import type { GithubActivity } from "@/lib/github";
import { cn } from "@/lib/utils";

/** Static classes so Tailwind can see every level at build time. */
const LEVEL_CLASSES = [
  "bg-[hsl(var(--gh-0))]",
  "bg-[hsl(var(--gh-1))]",
  "bg-[hsl(var(--gh-2))]",
  "bg-[hsl(var(--gh-3))]",
  "bg-[hsl(var(--gh-4))]",
] as const;

const numberFormat = new Intl.NumberFormat("en-US");

function formatDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-display text-xl font-bold tabular-nums tracking-tight sm:text-2xl">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function GithubActivityGraph({ data }: { data: GithubActivity }) {
  const columns = data.weeks.length;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={numberFormat.format(data.total)} label="Contributions" />
        <Stat value={`${data.currentStreak}d`} label="Current streak" />
        <Stat value={`${data.longestStreak}d`} label="Longest streak" />
        <Stat
          value={data.bestDay ? numberFormat.format(data.bestDay.count) : "0"}
          label="Best day"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div
          aria-hidden
          className="grid gap-px text-[10px] text-muted-foreground sm:gap-[2px]"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {data.months.map((month) => (
            <span
              key={`${month.label}-${month.weekIndex}`}
              style={{
                gridColumnStart: month.weekIndex + 1,
                gridColumnEnd: `span ${month.span}`,
              }}
            >
              {month.label}
            </span>
          ))}
        </div>

        <div
          className="grid gap-px sm:gap-[2px]"
          role="img"
          aria-label={`${numberFormat.format(data.total)} GitHub contributions between ${formatDate(data.startDate)} and ${formatDate(data.endDate)}, merged across ${data.accounts.length} accounts.`}
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {data.weeks.map((week) => (
            <div
              key={week[0].date}
              className="grid grid-rows-7 gap-px sm:gap-[2px]"
            >
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.count === 0 ? "No" : numberFormat.format(day.count)} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`}
                  className={cn(
                    "aspect-square rounded-[2px] transition-transform duration-150 hover:scale-125",
                    LEVEL_CLASSES[day.level],
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          Less
          {LEVEL_CLASSES.map((levelClass) => (
            <span
              key={levelClass}
              className={cn("size-2.5 rounded-[2px]", levelClass)}
            />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
