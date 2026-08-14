import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  clampToRange,
  EnergyPeriod,
  formatAnchorLabel,
  overlayPickerDate,
  formatDateToken,
  getMinDate,
  getPeriodWindow,
  isNextDisabled,
  isPrevDisabled,
  periodToChartRange,
  shiftAnchor,
  ChartRange,
} from '../energyMetric';

export interface EnergyAnchorState {
  anchor: Dayjs;
  period: EnergyPeriod;
  setPeriod: (period: EnergyPeriod) => void;
  setAnchorDate: (value: string) => void;
  label: string;
  chartRange: ChartRange;
  startDate: string;
  endDate: string;
  pickerValue: string;
  pickerStart: string;
  pickerEnd: string;
  pickerFields: 'day' | 'month' | 'year';
  goPrev: () => void;
  goNext: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Date window for StatCharts — mirrors miniapp-1 chart-card period math.
 */
export function useEnergyAnchor(initialPeriod: EnergyPeriod = 'day'): EnergyAnchorState {
  const [period, setPeriodState] = useState<EnergyPeriod>(initialPeriod);
  const [anchor, setAnchor] = useState<Dayjs>(() => dayjs());

  // Prevent date after today (same guard as chart-card)
  useEffect(() => {
    const now = dayjs();
    if (anchor.isAfter(now)) setAnchor(now);
  }, [anchor]);

  const setPeriod = useCallback((next: EnergyPeriod) => {
    setPeriodState(next);
    setAnchor(prev => clampToRange(next, prev));
  }, []);

  const chartRange = useMemo(() => periodToChartRange(period), [period]);
  const window = useMemo(() => getPeriodWindow(period, anchor), [period, anchor]);
  const dateFormat = formatDateToken(chartRange);

  const goPrev = useCallback(() => {
    if (isPrevDisabled(period, anchor)) return;
    setAnchor(prev => shiftAnchor(period, prev, -1));
  }, [period, anchor]);

  const goNext = useCallback(() => {
    if (isNextDisabled(period, anchor)) return;
    setAnchor(prev => shiftAnchor(period, prev, 1));
  }, [period, anchor]);

  const setAnchorDate = useCallback(
    (value: string) => {
      const picked = dayjs(value);
      if (!picked.isValid()) return;
      setAnchor(prev => clampToRange(period, overlayPickerDate(prev, picked, period)));
    },
    [period]
  );

  const pickerFields: 'day' | 'month' | 'year' =
    period === 'year' ? 'year' : period === 'month' ? 'month' : 'day';

  return {
    anchor,
    period,
    setPeriod,
    setAnchorDate,
    label: formatAnchorLabel(period, anchor),
    chartRange,
    startDate: window.start.format(dateFormat),
    endDate: window.end.format(dateFormat),
    pickerValue: anchor.format('YYYY-MM-DD'),
    pickerStart: getMinDate(period).format('YYYY-MM-DD'),
    pickerEnd: dayjs().format('YYYY-MM-DD'),
    pickerFields,
    goPrev,
    goNext,
    canGoNext: !isNextDisabled(period, anchor),
    canGoPrev: !isPrevDisabled(period, anchor),
  };
}
