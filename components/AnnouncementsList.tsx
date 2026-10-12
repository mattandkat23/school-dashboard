import type { AnnouncementWithCourse } from "@/lib/classroom";

export function AnnouncementsList({ items }: { items: AnnouncementWithCourse[] }) {
  if (items.length === 0) {
    return <p className="text-slate-500 text-sm">No recent announcements.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.slice(0, 10).map((item) => (
        <li key={item.id} className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-medium text-slate-500">{item.courseName}</p>
          <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{item.text}</p>
          {item.alternateLink && (
            <a
              href={item.alternateLink}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
            >
              Open in Classroom
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
