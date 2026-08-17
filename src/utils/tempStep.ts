/** 加热态：「+」从 49 调至 50℃ 需解锁；已在 50 未解锁再上调同样需解锁；滑条松手 ≥50℃ 也需解锁一次 */

export const TEMP_HIGH_GATE = 50;
export const TEMP_FINE_STEP = 1;
export const TEMP_COARSE_STEP = 5;

export function isHeatingWorkState(workState: string | undefined | null): boolean {
  return workState === 'bath_heating' || workState === 'zc_heating';
}

/** 「+」键是否处于粗步进区（>50，或已在 50 且已解锁/非加热） */
export function isCoarseTempZone(
  value: number,
  opts: { unlocked: boolean; heating: boolean }
): boolean {
  if (!Number.isFinite(value)) return false;
  if (value > TEMP_HIGH_GATE) return true;
  if (value === TEMP_HIGH_GATE && (!opts.heating || opts.unlocked)) return true;
  return false;
}

export function tempPlusDelta(
  value: number,
  opts: { unlocked: boolean; heating: boolean }
): { kind: 'need_unlock'; next: number } | { kind: 'step'; delta: number } {
  if (value < TEMP_HIGH_GATE) {
    if (opts.heating && !opts.unlocked && value + TEMP_FINE_STEP >= TEMP_HIGH_GATE) {
      return { kind: 'need_unlock', next: TEMP_HIGH_GATE };
    }
    return { kind: 'step', delta: TEMP_FINE_STEP };
  }
  if (value === TEMP_HIGH_GATE && opts.heating && !opts.unlocked) {
    return { kind: 'need_unlock', next: TEMP_HIGH_GATE + TEMP_COARSE_STEP };
  }
  return { kind: 'step', delta: TEMP_COARSE_STEP };
}

export function tempMinusDelta(value: number): number {
  return value > TEMP_HIGH_GATE ? TEMP_COARSE_STEP : TEMP_FINE_STEP;
}

/** 滑条步进：≥50℃ 为 5，否则为 1 */
export function tempSliderStep(value: number): number {
  return value >= TEMP_HIGH_GATE ? TEMP_COARSE_STEP : TEMP_FINE_STEP;
}

/** 加热未解锁时，滑条松手目标 ≥50℃ 需弹窗 */
export function sliderNeedsHighUnlock(
  value: number,
  opts: { unlocked: boolean; heating: boolean }
): boolean {
  return !!opts.heating && !opts.unlocked && value >= TEMP_HIGH_GATE;
}

/**
 * 量化温度刻度。
 * `enforceUnlockGate`：加热未解锁时把 ≥50 钳到 49（取消确认时回退）。
 */
export function quantizeTemp(
  value: number,
  min: number,
  max: number,
  opts: { unlocked: boolean; heating: boolean; enforceUnlockGate?: boolean }
): number {
  let v = Math.min(max, Math.max(min, value));
  if (opts.enforceUnlockGate && opts.heating && !opts.unlocked && v >= TEMP_HIGH_GATE) {
    v = Math.min(v, TEMP_HIGH_GATE - TEMP_FINE_STEP);
  }
  if (v > TEMP_HIGH_GATE) {
    const steps: number[] = [];
    for (let t = TEMP_HIGH_GATE + TEMP_COARSE_STEP; t <= max; t += TEMP_COARSE_STEP) {
      steps.push(t);
    }
    if (steps.length === 0) return Math.min(max, TEMP_HIGH_GATE);
    let best = steps[0];
    let bestDist = Math.abs(v - best);
    for (let i = 1; i < steps.length; i += 1) {
      const d = Math.abs(v - steps[i]);
      if (d < bestDist) {
        best = steps[i];
        bestDist = d;
      }
    }
    return best;
  }
  return Math.round(v);
}
