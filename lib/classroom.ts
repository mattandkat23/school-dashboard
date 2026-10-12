const API_BASE = "https://classroom.googleapis.com/v1";

export class ClassroomApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function classroomFetch<T>(
  accessToken: string,
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ClassroomApiError(`Classroom API ${path} failed: ${body}`, response.status);
  }

  return response.json();
}

async function fetchAllPages<T>(
  accessToken: string,
  path: string,
  itemsKey: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const items: T[] = [];
  let pageToken: string | undefined;
  let pagesFetched = 0;

  do {
    const page = await classroomFetch<Record<string, unknown>>(accessToken, path, {
      ...params,
      pageSize: "100",
      ...(pageToken ? { pageToken } : {}),
    });
    const pageItems = (page[itemsKey] as T[] | undefined) ?? [];
    items.push(...pageItems);
    pageToken = page.nextPageToken as string | undefined;
    pagesFetched += 1;
  } while (pageToken && pagesFetched < 10);

  return items;
}

export interface Course {
  id: string;
  name: string;
  section?: string;
  courseState?: string;
}

export interface ClassroomDate {
  year: number;
  month: number;
  day: number;
}

export interface ClassroomTimeOfDay {
  hours?: number;
  minutes?: number;
}

export interface CourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: unknown[];
  dueDate?: ClassroomDate;
  dueTime?: ClassroomTimeOfDay;
  alternateLink?: string;
  workType?: string;
  state?: string;
}

export interface Announcement {
  id: string;
  courseId: string;
  text?: string;
  creationTime?: string;
  alternateLink?: string;
}

export async function listActiveCourses(accessToken: string): Promise<Course[]> {
  return fetchAllPages<Course>(accessToken, "/courses", "courses", {
    courseStates: "ACTIVE",
  });
}

export async function listCourseWork(accessToken: string, courseId: string): Promise<CourseWork[]> {
  try {
    return await fetchAllPages<CourseWork>(accessToken, `/courses/${courseId}/courseWork`, "courseWork", {
      courseWorkStates: "PUBLISHED",
      orderBy: "dueDate asc",
    });
  } catch (error) {
    if (error instanceof ClassroomApiError && error.status === 403) {
      // Some courses (e.g. where the user is not a student) return 403; skip them.
      return [];
    }
    throw error;
  }
}

export async function listAnnouncements(accessToken: string, courseId: string): Promise<Announcement[]> {
  try {
    return await fetchAllPages<Announcement>(
      accessToken,
      `/courses/${courseId}/announcements`,
      "announcements",
      { announcementStates: "PUBLISHED" }
    );
  } catch (error) {
    if (error instanceof ClassroomApiError && error.status === 403) {
      return [];
    }
    throw error;
  }
}

export function dueDateToJsDate(dueDate?: ClassroomDate, dueTime?: ClassroomTimeOfDay): Date | undefined {
  if (!dueDate) return undefined;
  return new Date(
    dueDate.year,
    dueDate.month - 1,
    dueDate.day,
    dueTime?.hours ?? 23,
    dueTime?.minutes ?? 59
  );
}

export interface CourseWorkWithCourse extends CourseWork {
  courseName: string;
  dueAt?: Date;
}

export async function getUpcomingCourseWork(accessToken: string): Promise<CourseWorkWithCourse[]> {
  const courses = await listActiveCourses(accessToken);

  const perCourse = await Promise.all(
    courses.map(async (course) => {
      const work = await listCourseWork(accessToken, course.id);
      return work.map((item) => ({
        ...item,
        courseName: course.name,
        dueAt: dueDateToJsDate(item.dueDate, item.dueTime),
      }));
    })
  );

  return perCourse.flat().sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return a.dueAt.getTime() - b.dueAt.getTime();
  });
}

export interface AnnouncementWithCourse extends Announcement {
  courseName: string;
}

export async function getRecentAnnouncements(accessToken: string): Promise<AnnouncementWithCourse[]> {
  const courses = await listActiveCourses(accessToken);

  const perCourse = await Promise.all(
    courses.map(async (course) => {
      const announcements = await listAnnouncements(accessToken, course.id);
      return announcements.map((item) => ({ ...item, courseName: course.name }));
    })
  );

  return perCourse
    .flat()
    .sort((a, b) => new Date(b.creationTime ?? 0).getTime() - new Date(a.creationTime ?? 0).getTime());
}
