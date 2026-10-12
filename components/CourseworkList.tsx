import type { CourseWorkWithCourse } from "@/lib/classroom";

function formatDue(dueAt?: Date): { label: string; tone: string } {
  if (!dueAt) return { label: "No due date", tone: "bg-slate-100 text-slate-500" };

  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((dueAt.getTime() - now.getTime()) / msPerDay);

  const dateLabel = dueAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = dueAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (dueAt.getTime() < now.getTime()) {
    return { label: `Overdue · was due ${dateLabel}`, tone: "bg-red-100 text-red-700" };
  }
  if (diffDays <= 1) {
    return { label: `Due today, ${timeLabel}`, tone: "bg-amber-100 text-amber-800" };
  }
  if (diffDays <= 7) {
    return { label: `Due ${dateLabel}, ${timeLabel}`, tone: "bg-blue-100 text-blue-700" };
  }
  return { label: `Due ${dateLabel}`, tone: "bg-slate-100 text-slate-600" };
}

export function CourseworkList({ items }: { items: CourseWorkWithCourse[] }) {
  if (items.length === 0) {
    return <p className="text-slate-500 text-sm">No assignments found. Nicely caught up.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200">
      {items.map((item) => {
        const due = formatDue(item.dueAt);
        return (
          <li key={item.id} className="py-3 flex items-start justify-between gap-4">
            <div>
              <a
                href={item.alternateLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-900 hover:underline"
              >
                {item.title}
              </a>
              <p className="text-sm text-slate-500">{item.courseName}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${due.tone}`}>
              {due.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
