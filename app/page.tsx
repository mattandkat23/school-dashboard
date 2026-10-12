import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUpcomingCourseWork, getRecentAnnouncements } from "@/lib/classroom";
import { SignInButton, SignOutButton, ReconnectButton } from "@/components/AuthButtons";
import { CourseworkList } from "@/components/CourseworkList";
import { AnnouncementsList } from "@/components/AnnouncementsList";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-3xl font-semibold">School Dashboard</h1>
        <p className="text-slate-600 max-w-sm">
          Sign in with your Google Classroom account to see what&apos;s due and what&apos;s new.
        </p>
        <SignInButton />
      </main>
    );
  }

  if (session.error || !session.accessToken) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-2xl font-semibold">Google connection needs a refresh</h1>
        <p className="text-slate-600 max-w-sm">
          Your Google session expired or access was revoked. Reconnect to keep syncing Classroom.
        </p>
        <ReconnectButton />
      </main>
    );
  }

  const [courseWork, announcements] = await Promise.all([
    getUpcomingCourseWork(session.accessToken),
    getRecentAnnouncements(session.accessToken),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">School Dashboard</h1>
          <p className="text-sm text-slate-500">Signed in as {session.user?.email}</p>
        </div>
        <SignOutButton />
      </header>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold mb-3">Assignments</h2>
        <CourseworkList items={courseWork} />
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold mb-3">Recent announcements</h2>
        <AnnouncementsList items={announcements} />
      </section>
    </main>
  );
}
