import dayjs, { Dayjs } from 'dayjs';
import type { CloudTimer } from '@/api/timer';

export const TIMER_CATEGORY = 'zc_schedule';
export const ZC_ALWAYS_ON_DP_ID = '104';
export const ONCE_LOOPS = '0000000';
export const DAILY_LOOPS = '1111111';
export const WEEKDAY_LOOPS = '0111110';
export const WEEKDAY_SELECTED = [false, true, true, true, true, true, false];
export const ALL_DAYS_SELECTED = [true, true, true, true, true, true, true];

export type RepeatMode = 'once' | 'daily' | 'custom';

export type TimerGroup = {
  aliasName: string;
  startTimerId: string;
  endTimerId: string;
  startTime: string;
  endTime: string;
  /** Start timer calendar day, compact YYYYMMDD. Empty when cloud omitted it. */
  date: string;
  loops: string;
  isAppPush: boolean;
  enabled: boolean;
  orphan: boolean;
};

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function createAliasName(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `zc_g_${Date.now().toString(36)}_${rand}`;
}

export function isZcAlwaysOn(dps: CloudTimer['dps'] | undefined): boolean {
  if (!dps) return false;
  const raw = dps[ZC_ALWAYS_ON_DP_ID] ?? dps[104 as unknown as string];
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
}

export function buildZcDps(on: boolean): Record<string, boolean> {
  return { [ZC_ALWAYS_ON_DP_ID]: on };
}

export function isLoopsBits(loops: string): boolean {
  return /^[01]{7}$/.test(loops);
}

/** Once (`0000000`) or any weekly mask. */
export function isValidLoops(loops: string): boolean {
  return isLoopsBits(loops);
}

export function isOnceLoops(loops: string): boolean {
  return loops === ONCE_LOOPS;
}

export function repeatModeFromLoops(loops: string): RepeatMode {
  if (loops === ONCE_LOOPS) return 'once';
  if (loops === DAILY_LOOPS) return 'daily';
  return 'custom';
}

export function loopsFromRepeatMode(mode: RepeatMode, selected: boolean[]): string {
  if (mode === 'once') return ONCE_LOOPS;
  if (mode === 'daily') return DAILY_LOOPS;
  return loopsFromSelected(selected);
}

export function isValidTimeRange(startTime: string, endTime: string): boolean {
  return (
    /^\d{1,2}:\d{2}$/.test(startTime) && /^\d{1,2}:\d{2}$/.test(endTime) && startTime !== endTime
  );
}

export function normalizeTime(time: string): string {
  const [h = '0', m = '0'] = time.split(':');
  return `${String(Number(h)).padStart(2, '0')}:${String(Number(m)).padStart(2, '0')}`;
}

/** True when a valid range wraps past midnight (end is next calendar day). */
export function isOvernightPeriod(startTime: string, endTime: string): boolean {
  if (!isValidTimeRange(startTime, endTime)) return false;
  return normalizeTime(endTime) < normalizeTime(startTime);
}

export function loopsFromSelected(selected: boolean[]): string {
  const bits = DAY_KEYS.map((_, i) => (selected[i] ? '1' : '0'));
  return bits.join('');
}

export function selectedFromLoops(loops: string): boolean[] {
  const safe = isLoopsBits(loops) ? loops : ONCE_LOOPS;
  return DAY_KEYS.map((_, i) => safe[i] === '1');
}

export function parseTimerDate(raw?: string): Dayjs | null {
  if (!raw) return null;
  const compact = raw.replace(/-/g, '');
  if (!/^\d{8}$/.test(compact)) return null;
  const parsed = dayjs(
    `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`
  );
  return parsed.isValid() ? parsed : null;
}

/** zh: 8月18日 (year if not this year). en: Aug 18. */
export function formatOnceDateLabel(raw: string | undefined, locale: 'zh' | 'en'): string {
  const parsed = parseTimerDate(raw);
  if (!parsed) return '';
  const showYear = parsed.year() !== dayjs().year();
  if (locale === 'en') {
    return showYear ? parsed.format('MMM D, YYYY') : parsed.format('MMM D');
  }
  const md = `${parsed.month() + 1}月${parsed.date()}日`;
  return showYear ? `${parsed.year()}年${md}` : md;
}

/**
 * Next complete start/end window from `now`.
 * If start has already been reached (including inside the window), shift to tomorrow.
 */
export function computeOnceWindow(
  startTime: string,
  endTime: string,
  now: Dayjs = dayjs()
): { startDate: string; endDate: string } {
  const startHm = normalizeTime(startTime);
  const endHm = normalizeTime(endTime);
  const [sh, sm] = startHm.split(':').map(Number);
  const [eh, em] = endHm.split(':').map(Number);
  let start = now.hour(sh).minute(sm).second(0).millisecond(0);
  let end = now.hour(eh).minute(em).second(0).millisecond(0);
  if (endHm < startHm) {
    end = end.add(1, 'day');
  }
  if (!now.isBefore(start)) {
    start = start.add(1, 'day');
    end = end.add(1, 'day');
  }
  return {
    startDate: start.format('YYYYMMDD'),
    endDate: end.format('YYYYMMDD'),
  };
}

export function loopsSummary(
  loops: string,
  labels: { once: string; everyDay: string; weekdays: string; days: string[] },
  onceDateLabel?: string
): string {
  if (!isLoopsBits(loops)) return '';
  if (loops === ONCE_LOOPS) {
    return onceDateLabel ? `${labels.once} · ${onceDateLabel}` : labels.once;
  }
  if (loops === DAILY_LOOPS) return labels.everyDay;
  if (loops === WEEKDAY_LOOPS) return labels.weekdays;
  const picked = DAY_KEYS.map((_, i) => (loops[i] === '1' ? labels.days[i] : null)).filter(
    Boolean
  ) as string[];
  return picked.join('、');
}

/**
 * Pair cloud timers that share aliasName into TimerGroup rows.
 * Orphans (missing start or end, or duplicate roles) are marked orphan=true.
 */
export function toTimerGroups(timers: CloudTimer[]): TimerGroup[] {
  const map = new Map<string, CloudTimer[]>();
  timers.forEach(t => {
    const key = t.aliasName || `__noid_${t.timerId}`;
    const list = map.get(key) || [];
    list.push(t);
    map.set(key, list);
  });

  const groups: TimerGroup[] = [];
  map.forEach((list, aliasName) => {
    const starts = list.filter(t => isZcAlwaysOn(t.dps));
    const ends = list.filter(t => !isZcAlwaysOn(t.dps));

    if (starts.length === 1 && ends.length === 1) {
      const start = starts[0];
      const end = ends[0];
      groups.push({
        aliasName,
        startTimerId: start.timerId,
        endTimerId: end.timerId,
        startTime: normalizeTime(start.time),
        endTime: normalizeTime(end.time),
        date: start.date || '',
        loops: start.loops || end.loops || ONCE_LOOPS,
        isAppPush: !!(start.isAppPush || end.isAppPush),
        enabled: !!(start.status && end.status),
        orphan: false,
      });
      return;
    }

    const primary = list[0];
    groups.push({
      aliasName,
      startTimerId: starts[0]?.timerId || '',
      endTimerId: ends[0]?.timerId || '',
      startTime: normalizeTime(starts[0]?.time || primary?.time || '00:00'),
      endTime: normalizeTime(ends[0]?.time || primary?.time || '00:00'),
      date: primary?.date || '',
      loops: primary?.loops || ONCE_LOOPS,
      isAppPush: !!primary?.isAppPush,
      enabled: false,
      orphan: true,
    });
  });

  return groups.sort(
    (a, b) => a.startTime.localeCompare(b.startTime) || a.aliasName.localeCompare(b.aliasName)
  );
}

export function orphanTimerIds(group: TimerGroup, timers: CloudTimer[]): string[] {
  return timers.filter(t => t.aliasName === group.aliasName).map(t => t.timerId);
}

export type TimerCheckIssue = {
  level: 'error' | 'warn' | 'info';
  code: string;
  message: string;
  aliasName?: string;
  timerId?: string;
};

export type TimerConsistencyReport = {
  timerCount: number;
  groupCount: number;
  completeCount: number;
  orphanCount: number;
  ok: boolean;
  issues: TimerCheckIssue[];
  groups: TimerGroup[];
};

/**
 * Validate raw cloud timers vs business TimerGroup pairing rules.
 */
export function validateTimerConsistency(timers: CloudTimer[]): TimerConsistencyReport {
  const groups = toTimerGroups(timers);
  const issues: TimerCheckIssue[] = [];

  timers.forEach(t => {
    if (!t.timerId) {
      issues.push({ level: 'error', code: 'missing_timer_id', message: 'Timer 缺少 timerId' });
    }
    if (!t.aliasName) {
      issues.push({
        level: 'warn',
        code: 'missing_alias',
        message: 'Timer 缺少 aliasName，无法成组',
        timerId: t.timerId,
      });
    }
    if (!isValidLoops(t.loops || '')) {
      issues.push({
        level: 'error',
        code: 'invalid_loops',
        message: `loops 非法: ${t.loops}`,
        timerId: t.timerId,
        aliasName: t.aliasName,
      });
    }
    const dps = t.dps || {};
    const has104 = Object.prototype.hasOwnProperty.call(dps, ZC_ALWAYS_ON_DP_ID);
    if (!has104) {
      issues.push({
        level: 'error',
        code: 'missing_dp_104',
        message: 'dps 未包含 104',
        timerId: t.timerId,
        aliasName: t.aliasName,
      });
    }
    const extraKeys = Object.keys(dps).filter(k => k !== ZC_ALWAYS_ON_DP_ID);
    if (extraKeys.length) {
      issues.push({
        level: 'warn',
        code: 'extra_dps',
        message: `dps 含非 104 键: ${extraKeys.join(',')}`,
        timerId: t.timerId,
        aliasName: t.aliasName,
      });
    }
  });

  groups.forEach(g => {
    if (g.orphan) {
      issues.push({
        level: 'error',
        code: 'orphan_group',
        message: `半组/不成对: start=${g.startTimerId || '-'} end=${g.endTimerId || '-'}`,
        aliasName: g.aliasName,
      });
      return;
    }
    if (!isValidTimeRange(g.startTime, g.endTime)) {
      issues.push({
        level: 'error',
        code: 'same_time',
        message: `开启/关闭时间相同或非法: ${g.startTime} / ${g.endTime}`,
        aliasName: g.aliasName,
      });
    }
    const pair = timers.filter(t => t.aliasName === g.aliasName);
    if (pair.length !== 2) {
      issues.push({
        level: 'error',
        code: 'pair_count',
        message: `同 alias 条数应为 2，实际 ${pair.length}`,
        aliasName: g.aliasName,
      });
    }
    const [a, b] = pair;
    if (a && b) {
      if (a.loops !== b.loops) {
        issues.push({
          level: 'warn',
          code: 'loops_mismatch',
          message: `两侧 loops 不一致: ${a.loops} vs ${b.loops}`,
          aliasName: g.aliasName,
        });
      }
      if (!!a.isAppPush !== !!b.isAppPush) {
        issues.push({
          level: 'warn',
          code: 'push_mismatch',
          message: `两侧 isAppPush 不一致: ${a.isAppPush} vs ${b.isAppPush}`,
          aliasName: g.aliasName,
        });
      }
      if (!!a.status !== !!b.status) {
        issues.push({
          level: 'warn',
          code: 'status_mismatch',
          message: `两侧 status 不一致: ${a.status} vs ${b.status}（UI enabled=${g.enabled}）`,
          aliasName: g.aliasName,
        });
      }
    }
  });

  const orphanCount = groups.filter(g => g.orphan).length;
  const completeCount = groups.length - orphanCount;
  const hasError = issues.some(i => i.level === 'error');

  return {
    timerCount: timers.length,
    groupCount: groups.length,
    completeCount,
    orphanCount,
    ok: !hasError,
    issues,
    groups,
  };
}
