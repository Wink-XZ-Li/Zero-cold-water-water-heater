import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export type EnergyMetric = 'water' | 'gas';
export type EnergyPeriod = 'day' | 'week' | 'month' | 'year';
export type ChartRange = '1hour' | '1day' | '1month';

export interface EnergyMetricMeta {
  id: EnergyMetric;
  dpCode: 'water_total' | 'gas_consumption';
  dpId: number;
  unit: string;
  titleKey: 'energy_chart_water_title' | 'energy_chart_gas_title';
  /** gas scale=3 → 保留小数 */
  keepScalaPoint: boolean;
}

export const ENERGY_METRICS: Record<EnergyMetric, EnergyMetricMeta> = {
  water: {
    id: 'water',
    dpCode: 'water_total',
    dpId: 25,
    unit: 'L',
    titleKey: 'energy_chart_water_title',
    keepScalaPoint: false,
  },
  gas: {
    id: 'gas',
    dpCode: 'gas_consumption',
    dpId: 24,
    unit: 'm³',
    titleKey: 'energy_chart_gas_title',
    keepScalaPoint: true,
  },
};

export const CHART_COLORS = ['#112959'];
export const CHART_STYLE = {
  width: '100%',
  padding: '0',
  margin: '0',
  marginBottom: '-10px',
};

/** Align miniapp-1 chart-card: day→1hour, week/month→1day, year→1month */
export function periodToChartRange(period: EnergyPeriod): ChartRange {
  if (period === 'day') return '1hour';
  if (period === 'year') return '1month';
  return '1day';
}

export function getPeriodWindow(period: EnergyPeriod, anchor: Dayjs): { start: Dayjs; end: Dayjs } {
  if (period === 'week') {
    return { start: anchor.subtract(6, 'day'), end: anchor };
  }
  return { start: anchor.startOf(period), end: anchor.endOf(period) };
}

export function formatDateToken(range: ChartRange): 'YYYYMM' | 'YYYYMMDD' {
  return range === '1month' ? 'YYYYMM' : 'YYYYMMDD';
}

export function formatAnchorLabel(period: EnergyPeriod, anchor: Dayjs): string {
  const { start, end } = getPeriodWindow(period, anchor);
  if (period === 'week') {
    return `${start.format('YYYY/MM/DD')} - ${end.format('YYYY/MM/DD')}`;
  }
  if (period === 'month') return anchor.format('YYYY.MM');
  if (period === 'year') return anchor.format('YYYY');
  return anchor.format('YYYY/MM/DD');
}

/** miniapp-1 chart-card max/min windows */
export function getMaxDate(): Dayjs {
  return dayjs();
}

export function getMinDate(period: EnergyPeriod, today = dayjs()): Dayjs {
  if (period === 'day') return today.subtract(364, 'day');
  if (period === 'week') return today.subtract(51, 'week');
  if (period === 'month') return today.subtract(12, 'month');
  return today.subtract(12, 'month');
}

export function isNextDisabled(period: EnergyPeriod, anchor: Dayjs, today = dayjs()): boolean {
  const max = today;
  if (period === 'day' || period === 'week') {
    const tk = 'YYYYMMDD';
    return anchor.add(1, 'day').format(tk) > max.format(tk);
  }
  if (period === 'month') {
    const tk = 'YYYYMM';
    return anchor.add(1, 'month').format(tk) > max.format(tk);
  }
  return anchor.add(1, 'year').format('YYYY') > max.format('YYYY');
}

export function isPrevDisabled(period: EnergyPeriod, anchor: Dayjs, today = dayjs()): boolean {
  const min = getMinDate(period, today);
  if (period === 'day' || period === 'week') {
    const tk = 'YYYYMMDD';
    return anchor.format(tk) <= min.format(tk);
  }
  if (period === 'month') {
    const tk = 'YYYYMM';
    return anchor.format(tk) <= min.format(tk);
  }
  return anchor.format('YYYY') <= min.format('YYYY');
}

export function clampToRange(period: EnergyPeriod, next: Dayjs, today = dayjs()): Dayjs {
  const max = today;
  const min = getMinDate(period, today);
  let target = next;
  if (period === 'month') target = target.startOf('month');
  if (period === 'year') target = target.startOf('year');
  if (target.isAfter(max)) target = max;
  if (target.isBefore(min)) target = min;
  return target;
}

export function shiftAnchor(period: EnergyPeriod, anchor: Dayjs, delta: 1 | -1): Dayjs {
  let next: Dayjs;
  if (period === 'week') next = anchor.add(delta * 7, 'day');
  else if (period === 'day') next = anchor.add(delta, 'day');
  else if (period === 'month') next = anchor.add(delta, 'month');
  else next = anchor.add(delta, 'year');
  return clampToRange(period, next);
}

/** Sum bar series values — same reduce as miniapp-1 chart-card */
export function sumChartUsage(originData: any[]): number {
  return originData.reduce((acc, series) => {
    return (
      acc +
      (series.data ?? []).reduce((sum: number, point: { value: string | number }) => {
        const value = parseFloat(String(point.value));
        return sum + (Number.isNaN(value) ? 0 : value);
      }, 0)
    );
  }, 0);
}
