/**
 * DP helpers — scale / range / enum / fault bitmap
 * Labels from ST1 Pro fault property (maxlen 13).
 */

export const FAULT_LABELS = [
  'E0',
  'E1',
  'E2',
  'E3',
  'E4',
  'E5',
  'E6',
  'E7',
  'E8',
  'EH',
  'En',
  'Eb',
  'Ec',
] as const;

export function fromDpScale(raw: number | undefined | null, scale = 0): number {
  if (raw === undefined || raw === null || Number.isNaN(Number(raw))) {
    return NaN;
  }
  return Number(raw) / Math.pow(10, scale);
}

export function toDpScale(display: number, scale = 0): number {
  return Math.round(display * Math.pow(10, scale));
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isEnumAllowed(value: string, range: readonly string[] | string[]): boolean {
  return range.indexOf(value) >= 0;
}

export function parseFaultBitmap(
  fault: number | undefined | null,
  labels: readonly string[] = FAULT_LABELS
): { codes: string[]; hasFault: boolean } {
  const n = Number(fault) || 0;
  if (n === 0) {
    return { codes: [], hasFault: false };
  }
  const bits = n.toString(2).padStart(labels.length, '0').split('').reverse();
  const codes: string[] = [];
  bits.forEach((bit, i) => {
    if (bit === '1' && labels[i]) {
      codes.push(labels[i]);
    }
  });
  return { codes, hasFault: codes.length > 0 };
}
