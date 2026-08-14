import { useCallback, useMemo } from 'react';
import { useDevice, useProps } from '@ray-js/panel-sdk';
import { showToast } from '@ray-js/ray';
import { clampNumber, fromDpScale, toDpScale } from '@/utils/dp';
import Strings from '@/i18n';

const DEFAULT_MIN = 35;
const DEFAULT_MAX = 65;
const DEFAULT_SCALE = 0;

/** 模式覆盖温度可调范围（未列出的模式用 schema / 默认 35–65） */
const MODE_TEMP_RANGE: Record<string, { min: number; max: number }> = {
  kitchen: { min: 38, max: 45 },
};

/**
 * Guard temp_set writes using schema min/max/scale when available,
 * narrowed further by current `mode` (e.g. kitchen → 38–45).
 */
export function useTempSetGuard() {
  const tempSchema = useDevice(d => d.dpSchema?.temp_set);
  const mode = useProps(p => (p.mode as string) || 'no_mode');

  const schemaMin = tempSchema?.property?.min ?? DEFAULT_MIN;
  const schemaMax = tempSchema?.property?.max ?? DEFAULT_MAX;
  const scale = tempSchema?.property?.scale ?? DEFAULT_SCALE;

  const modeRange = MODE_TEMP_RANGE[mode];
  const min = modeRange ? Math.max(schemaMin, modeRange.min) : schemaMin;
  const max = modeRange ? Math.min(schemaMax, modeRange.max) : schemaMax;

  const toDisplay = useCallback(
    (raw: number | undefined | null) => {
      const v = fromDpScale(raw as number, scale);
      return Number.isFinite(v) ? v : NaN;
    },
    [scale]
  );

  const prepareWrite = useCallback(
    (displayOrRaw: number, opts?: { alreadyRaw?: boolean; silent?: boolean }) => {
      const display = opts?.alreadyRaw ? fromDpScale(displayOrRaw, scale) : displayOrRaw;
      if (!Number.isFinite(display)) {
        return { ok: false as const, raw: displayOrRaw, clamped: false };
      }
      const clampedDisplay = clampNumber(display, min, max);
      const clamped = clampedDisplay !== display;
      if (clamped && !opts?.silent) {
        showToast({
          title: Strings.getLang('temp_out_of_range')
            .replace('{min}', String(min))
            .replace('{max}', String(max)),
          icon: 'none',
        });
      }
      return {
        ok: true as const,
        raw: toDpScale(clampedDisplay, scale),
        clamped,
        display: clampedDisplay,
      };
    },
    [min, max, scale]
  );

  return useMemo(
    () => ({
      min,
      max,
      scale,
      mode,
      toDisplay,
      prepareWrite,
    }),
    [min, max, scale, mode, toDisplay, prepareWrite]
  );
}
