/**
 * Merges the public contribution calendars of several GitHub accounts into a
 * single year-long heatmap, so multiple identities read as one body of work.
 *
 * Uses the GraphQL API when `GITHUB_TOKEN` is set (exact counts, one request
 * for every account) and falls back to scraping the public contributions
 * fragment, which needs no credentials at all.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const CALENDAR_DAYS = 365;
const REVALIDATE_SECONDS = 60 * 60;

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type GithubActivity = {
  weeks: ContributionDay[][];
  months: { label: string; weekIndex: number; span: number }[];
  total: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: ContributionDay | null;
  accounts: string[];
  startDate: string;
  endDate: string;
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const parseISODate = (date: string) => new Date(`${date}T00:00:00.000Z`);

/** Sunday-aligned window ending today, matching GitHub's own calendar shape. */
function calendarRange() {
  const end = parseISODate(toISODate(new Date()));
  const start = new Date(end.getTime() - (CALENDAR_DAYS - 1) * DAY_MS);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return { start, end };
}

async function fetchViaGraphQL(
  logins: readonly string[],
  start: Date,
  end: Date,
  token: string,
): Promise<(Map<string, number> | null)[]> {
  const aliases = logins.map((_, index) => `u${index}`);
  const query = `query(${aliases
    .map((alias) => `$${alias}: String!`)
    .join(", ")}, $from: DateTime!, $to: DateTime!) {
    ${aliases
      .map(
        (alias) => `${alias}: user(login: $${alias}) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks { contributionDays { date contributionCount } }
        }
      }
    }`,
      )
      .join("\n")}
  }`;

  const variables: Record<string, string> = {
    from: start.toISOString(),
    to: end.toISOString(),
  };
  logins.forEach((login, index) => {
    variables[aliases[index]] = login;
  });

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL responded ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: Record<
      string,
      {
        contributionsCollection: {
          contributionCalendar: {
            weeks: {
              contributionDays: { date: string; contributionCount: number }[];
            }[];
          };
        };
      } | null
    >;
  };

  return aliases.map((alias) => {
    const user = payload.data?.[alias];
    // A missing user (renamed, suspended, bad login) drops out of the merge
    // rather than silently contributing zeros.
    if (!user) return null;

    const counts = new Map<string, number>();
    for (const week of user.contributionsCollection.contributionCalendar
      .weeks) {
      for (const day of week.contributionDays) {
        counts.set(day.date, day.contributionCount);
      }
    }
    return counts;
  });
}

/**
 * Reads the same numbers off the public profile fragment. Each `<td>` carries
 * the date and an id; the matching `<tool-tip for="...">` carries the count.
 */
async function fetchViaScrape(
  login: string,
  start: Date,
  end: Date,
): Promise<Map<string, number>> {
  const url = `https://github.com/users/${encodeURIComponent(login)}/contributions?from=${toISODate(start)}&to=${toISODate(end)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "portfolio-contribution-graph",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`GitHub profile responded ${response.status} for ${login}`);
  }

  const html = await response.text();

  const countByTooltipTarget = new Map<string, number>();
  const tooltipPattern =
    /<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
  let tooltip = tooltipPattern.exec(html);
  while (tooltip !== null) {
    const leadingNumber = /^([\d,]+)\s+contribution/.exec(tooltip[2].trim());
    countByTooltipTarget.set(
      tooltip[1],
      leadingNumber ? Number(leadingNumber[1].replace(/,/g, "")) : 0,
    );
    tooltip = tooltipPattern.exec(html);
  }

  const counts = new Map<string, number>();
  const cellPattern =
    /<td\b[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g;
  let cell = cellPattern.exec(html);
  while (cell !== null) {
    const date = /\bdata-date="([^"]+)"/.exec(cell[0])?.[1];
    const id = /\bid="([^"]+)"/.exec(cell[0])?.[1];
    if (date) {
      counts.set(date, (id ? countByTooltipTarget.get(id) : undefined) ?? 0);
    }
    cell = cellPattern.exec(html);
  }

  return counts;
}

/**
 * Quartiles taken against the 90th percentile of active days rather than the
 * outright maximum: merging three accounts produces occasional huge days that
 * would otherwise flatten every normal day into the palest shade.
 */
function rampCeilingOf(days: { count: number }[]) {
  const active = days
    .map((day) => day.count)
    .filter((count) => count > 0)
    .sort((a, b) => a - b);
  if (active.length === 0) return 0;
  const percentile =
    active[Math.floor(active.length * 0.9)] ?? active.at(-1) ?? 0;
  return Math.max(percentile, 4);
}

function levelFor(count: number, ceiling: number): ContributionDay["level"] {
  if (count <= 0) return 0;
  if (ceiling <= 0) return 1;
  const quartile = Math.ceil(count / (ceiling / 4));
  return Math.min(Math.max(quartile, 1), 4) as ContributionDay["level"];
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function getMergedGithubActivity(
  logins: readonly string[],
): Promise<GithubActivity | null> {
  if (logins.length === 0) return null;

  const { start, end } = calendarRange();
  const token = process.env.GITHUB_TOKEN;

  let perAccount: (Map<string, number> | null)[];

  if (token) {
    try {
      perAccount = await fetchViaGraphQL(logins, start, end, token);
    } catch {
      perAccount = await scrapeAll(logins, start, end);
    }
  } else {
    perAccount = await scrapeAll(logins, start, end);
  }

  const resolved = logins.filter((_, index) => perAccount[index] !== null);
  if (resolved.length === 0) return null;

  const merged = new Map<string, number>();
  for (const counts of perAccount) {
    if (!counts) continue;
    for (const [date, count] of counts) {
      merged.set(date, (merged.get(date) ?? 0) + count);
    }
  }

  const days: { date: string; count: number }[] = [];
  for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
    const date = toISODate(new Date(time));
    days.push({ date, count: merged.get(date) ?? 0 });
  }

  const max = days.reduce((peak, day) => Math.max(peak, day.count), 0);
  const ceiling = rampCeilingOf(days);
  const calendar: ContributionDay[] = days.map((day) => ({
    ...day,
    level: levelFor(day.count, ceiling),
  }));

  const weeks: ContributionDay[][] = [];
  for (let index = 0; index < calendar.length; index += 7) {
    weeks.push(calendar.slice(index, index + 7));
  }

  const months: GithubActivity["months"] = [];
  weeks.forEach((week, weekIndex) => {
    const month = parseISODate(week[0].date).getUTCMonth();
    const previous = months.at(-1);
    if (!previous || previous.label !== MONTH_LABELS[month]) {
      if (previous) previous.span = weekIndex - previous.weekIndex;
      months.push({ label: MONTH_LABELS[month], weekIndex, span: 1 });
    }
  });
  const lastMonth = months.at(-1);
  if (lastMonth) lastMonth.span = weeks.length - lastMonth.weekIndex;

  return {
    weeks,
    // A month whose first week is the final column has no room for a label.
    months: months.filter((month) => month.span > 1),
    total: calendar.reduce((sum, day) => sum + day.count, 0),
    currentStreak: currentStreakOf(calendar),
    longestStreak: longestStreakOf(calendar),
    bestDay:
      max > 0
        ? calendar.reduce((best, day) => (day.count > best.count ? day : best))
        : null,
    accounts: resolved,
    startDate: toISODate(start),
    endDate: toISODate(end),
  };
}

async function scrapeAll(logins: readonly string[], start: Date, end: Date) {
  const results = await Promise.allSettled(
    logins.map((login) => fetchViaScrape(login, start, end)),
  );
  return results.map((result) =>
    result.status === "fulfilled" ? result.value : null,
  );
}

/** Today counts only once it has activity, so an empty morning never breaks a run. */
function currentStreakOf(days: ContributionDay[]) {
  let streak = 0;
  let index = days.length - 1;
  if (index >= 0 && days[index].count === 0) index -= 1;
  for (; index >= 0 && days[index].count > 0; index -= 1) {
    streak += 1;
  }
  return streak;
}

function longestStreakOf(days: ContributionDay[]) {
  let longest = 0;
  let running = 0;
  for (const day of days) {
    running = day.count > 0 ? running + 1 : 0;
    longest = Math.max(longest, running);
  }
  return longest;
}
