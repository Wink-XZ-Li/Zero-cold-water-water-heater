import { useCallback, useMemo } from 'react';
import { useDevice } from '@ray-js/panel-sdk';
import { showToast } from '@ray-js/ray';
import { clampNumber, fromDpScale, toDpScale } from '@/utils/dp';
import Strings from '@/i18n';

const DEFAULT_MIN = 35;
const DEFAULT_MAX = 65;
const DEFAULT_SCALE = 0;

/**
 * Guard temp_set writes using schema min/max/scale when available.
 */
export function useTempSetGuard() {
  const tempSchema = useDevice(d => d.dpSchema?.temp_set);

  const min = tempSchema?.property?.min ?? DEFAULT_MIN;
  const max = tempSchema?.property?.max ?? DEFAULT_MAX;
  const scale = tempSchema?.property?.scale ?? DEFAULT_SCALE;

  const toDisplay = useCallback(
    (raw: number | undefined | null) => {
      const v = fromDpScale(raw as number, scale);
      return Number.isFinite(v) ? v : NaN;
    },
    [scale]
  );

  const prepareWrite = useCallback(
    (displayOrRaw: number, opts?: { alreadyRaw?: boolean }) => {
      const display = opts?.alreadyRaw ? fromDpScale(displayOrRaw, scale) : displayOrRaw;
      if (!Number.isFinite(display)) {
        return { ok: false as const, raw: displayOrRaw, clamped: false };
      }
      const clampedDisplay = clampNumber(display, min, max);
      const clamped = clampedDisplay !== display;
      if (clamped) {
        showToast({
          title: Strings.getLang('temp_out_of_range'),
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
      toDisplay,
      prepareWrite,
    }),
    [min, max, scale, toDisplay, prepareWrite]
  );
}
