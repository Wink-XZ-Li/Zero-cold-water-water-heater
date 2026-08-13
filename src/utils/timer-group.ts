import type { CloudTimer } from '@/api/timer';

export const TIMER_CATEGORY = 'zc_schedule';
export const ZC_ALWAYS_ON_DP_ID = '104';

export type TimerGroup = {
  aliasName: string;
  startTimerId: string;
  endTimerId: string;
  startTime: string;
  endTime: string;
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

export function isValidLoops(loops: string): boolean {
  return /^[01]{7}$/.test(loops) && loops.includes('1');
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

export function loopsFromSelected(selected: boolean[]): string {
  const bits = DAY_KEYS.map((_, i) => (selected[i] ? '1' : '0'));
  return bits.join('');
}

export function selectedFromLoops(loops: string): boolean[] {
  const safe = isValidLoops(loops) ? loops : '0000000';
  return DAY_KEYS.map((_, i) => safe[i] === '1');
}

export function loopsSummary(
  loops: string,
  labels: { everyDay: string; weekdays: string; days: string[] }
): string {
  if (!isValidLoops(loops)) return '';
  if (loops === '1111111') return labels.everyDay;
  if (loops === '0111110') return labels.weekdays;
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
        loops: start.loops || end.loops || '0000000',
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
      loops: primary?.loops || '0000000',
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
