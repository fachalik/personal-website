import { useLocale, useTranslations } from "next-intl";
import type { GithubActivity } from "@/lib/github";
import { cn, formatDate } from "@/lib/utils";

/** Static classes so Tailwind can see every level at build time. */
const LEVEL_CLASSES = [
  "bg-[hsl(var(--gh-0))]",
  "bg-[hsl(var(--gh-1))]",
  "bg-[hsl(var(--gh-2))]",
  "bg-[hsl(var(--gh-3))]",
  "bg-[hsl(var(--gh-4))]",
] as const;

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-bold font-display text-xl tabular-nums tracking-tight sm:text-2xl">
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function GithubActivityGraph({ data }: { data: GithubActivity }) {
  const t = useTranslations("Github");
  const locale = useLocale();
  const numberFormat = new Intl.NumberFormat(locale);
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  });
  const columns = data.weeks.length;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          value={numberFormat.format(data.total)}
          label={t("contributions")}
        />
        <Stat
          value={t("days", { count: data.currentStreak })}
          label={t("currentStreak")}
        />
        <Stat
          value={t("days", { count: data.longestStreak })}
          label={t("longestStreak")}
        />
        <Stat
          value={data.bestDay ? numberFormat.format(data.bestDay.count) : "0"}
          label={t("bestDay")}
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
              {monthFormat.format(
                new Date(`${data.weeks[month.weekIndex][0].date}T00:00:00Z`),
              )}
            </span>
          ))}
        </div>

        <div
          className="grid gap-px sm:gap-[2px]"
          role="img"
          aria-label={t("summary", {
            total: numberFormat.format(data.total),
            start: formatDate(data.startDate, locale),
            end: formatDate(data.endDate, locale),
            accounts: data.accounts.length,
          })}
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
                  title={t("dayTooltip", {
                    count: day.count,
                    date: formatDate(day.date, locale),
                  })}
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
          {t("less")}
          {LEVEL_CLASSES.map((levelClass) => (
            <span
              key={levelClass}
              className={cn("size-2.5 rounded-[2px]", levelClass)}
            />
          ))}
          {t("more")}
        </span>
      </div>
    </div>
  );
}
