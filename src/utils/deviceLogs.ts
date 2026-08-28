export type LogDpMeta = { label: string };

/** 109 与其它 DP 混查时，云端常把 dpId 回成组合串（只认第一个）或直接丢掉 109 */
export const LOG_ISOLATED_DP_IDS = [109];

export function toMillis(timeStamp: number): number {
  return timeStamp > 1e12 ? timeStamp : timeStamp * 1000;
}

export function parseDpIds(dpId: number | string | null | undefined): number[] {
  if (dpId == null || dpId === '') return [];
  return String(dpId)
    .split(',')
    .map(part => Number(part.trim()))
    .filter(id => Number.isFinite(id));
}

export function splitLogDpIdQueries(dpIds: string): string[] {
  const ids = parseDpIds(dpIds);
  if (ids.length <= 1) return [String(dpIds).trim()].filter(Boolean);
  const isolated = new Set(LOG_ISOLATED_DP_IDS);
  const rest = ids.filter(id => !isolated.has(id));
  const special = ids.filter(id => isolated.has(id));
  const queries: string[] = [];
  if (rest.length > 0) queries.push(rest.join(','));
  for (const id of special) queries.push(String(id));
  return queries;
}

export function logItemKey(item: {
  timeStamp: number;
  dpId: number | string;
  value: unknown;
}): string {
  return `${item.timeStamp}|${item.dpId}|${item.value}`;
}

export function mergeLogItems<T extends { timeStamp: number; dpId: number | string; value: unknown }>(
  groups: T[][],
  sortDir: 'DESC' | 'ASC' = 'DESC'
): T[] {
  const seen = new Set<string>();
  const all: T[] = [];
  for (const group of groups) {
    for (const item of group) {
      const key = logItemKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(item);
    }
  }
  const sign = sortDir === 'DESC' ? -1 : 1;
  all.sort((a, b) => sign * (toMillis(a.timeStamp) - toMillis(b.timeStamp)));
  return all;
}

export function formatDpLabels(
  dpId: number | string,
  metaMap: Record<number, LogDpMeta>
): string {
  const ids = parseDpIds(dpId);
  if (ids.length === 0) return `DP ${dpId}`;
  return ids.map(id => metaMap[id]?.label || `DP ${id}`).join(' / ');
}
