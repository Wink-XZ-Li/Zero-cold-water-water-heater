import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, navigateBack } from '@ray-js/ray';
import { NavBar } from '@ray-js/smart-ui';
import { useDevice } from '@ray-js/panel-sdk';
import StatCharts from '@ray-js/stat-charts';
import Strings from '@/i18n';
import {
  ArrowLeftGlyph,
  ArrowRightGlyph,
  EnergyGlyph,
  ICON_LIGHT,
  ICON_NAVY,
} from '@/components/panel-icons';
import styles from './index.module.less';
import {
  CHART_COLORS,
  CHART_STYLE,
  ENERGY_METRICS,
  EnergyMetric,
  EnergyPeriod,
  sumChartUsage,
} from './energyMetric';
import { useEnergyAnchor } from './hooks/useEnergyAnchor';

const PERIODS: { key: EnergyPeriod; labelKey: string }[] = [
  { key: 'day', labelKey: 'energy_period_day' },
  { key: 'week', labelKey: 'energy_period_week' },
  { key: 'month', labelKey: 'energy_period_month' },
  { key: 'year', labelKey: 'energy_period_year' },
];

/**
 * Energy report — Ardot 55:1044 shell (white header + blue content card).
 * StatCharts request path unchanged from 004.
 */
export function EnergyReport() {
  const [metric, setMetric] = useState<EnergyMetric>('water');
  const [totalUsage, setTotalUsage] = useState('_ _');
  const {
    period,
    setPeriod,
    label: dateLabel,
    chartRange,
    startDate,
    endDate,
    goPrev,
    goNext,
    canGoNext,
    canGoPrev,
  } = useEnergyAnchor('day');

  const devId = useDevice(d => d.devInfo?.devId || '') as string;
  const meta = ENERGY_METRICS[metric];

  // Stable refs — chart-card: 不触发 StatCharts 重复请求
  const devIdList = useMemo(() => (devId ? [devId] : []), [devId]);
  const dpList = useMemo(
    () => [{ id: meta.dpId, name: Strings.getLang(meta.titleKey) }],
    [meta.dpId, meta.titleKey]
  );

  // 参数变化时重置 total（与 chart-card 一致）
  useEffect(() => {
    setTotalUsage(prev => (prev === '_ _' ? prev : '_ _'));
  }, [devId, metric, period, startDate, endDate]);

  const dataTransformer = useCallback(
    (originData: any[]) => {
      const total = sumChartUsage(originData);
      const formatted = meta.keepScalaPoint
        ? total.toFixed(3)
        : String(Math.round(total * 100) / 100);
      setTotalUsage(prev => (prev === formatted ? prev : formatted));
      return originData;
    },
    [meta.keepScalaPoint]
  );

  return (
    <View className={styles.page}>
      <NavBar
        title={Strings.getLang('energy_report')}
        leftArrow
        onClickLeft={() => navigateBack()}
      />
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className={styles.scroll}
        style={{ flex: 1, height: '100%' }}
      >
        <View className={styles.content}>
          <View className={styles.headerCard}>
            <View className={styles.headerIcon}>
              <EnergyGlyph fill={ICON_LIGHT} size={16} />
            </View>
            <Text className={styles.headerTitle}>{Strings.getLang('energy_report')}</Text>
            <View className={styles.metricTrack}>
              <View
                className={`${styles.metricChip} ${metric === 'water' ? styles.metricChipOn : ''}`}
                onClick={() => setMetric('water')}
              >
                <Text
                  className={`${styles.metricText} ${
                    metric === 'water' ? styles.metricTextOn : ''
                  }`}
                >
                  {Strings.getLang('energy_metric_water')}
                </Text>
              </View>
              <View
                className={`${styles.metricChip} ${metric === 'gas' ? styles.metricChipOn : ''}`}
                onClick={() => setMetric('gas')}
              >
                <Text
                  className={`${styles.metricText} ${metric === 'gas' ? styles.metricTextOn : ''}`}
                >
                  {Strings.getLang('energy_metric_gas')}
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.board}>
            <View className={styles.periodTrack}>
              {PERIODS.map(item => {
                const on = period === item.key;
                return (
                  <View
                    key={item.key}
                    className={`${styles.periodChip} ${on ? styles.periodChipOn : ''}`}
                    onClick={() => setPeriod(item.key)}
                  >
                    <Text className={`${styles.periodText} ${on ? styles.periodTextOn : ''}`}>
                      {Strings.getLang(item.labelKey)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className={styles.dateRow}>
              <View
                className={styles.arrowBtn}
                onClick={goPrev}
                style={{ opacity: canGoPrev ? 1 : 0.35 }}
              >
                <ArrowLeftGlyph fill={ICON_NAVY} size={14} />
              </View>
              <Text className={styles.dateLabel}>{dateLabel}</Text>
              <View
                className={styles.arrowBtn}
                onClick={goNext}
                style={{ opacity: canGoNext ? 1 : 0.35 }}
              >
                <ArrowRightGlyph fill={ICON_NAVY} size={14} />
              </View>
            </View>

            <View className={styles.chartCard}>
              <Text className={styles.chartTitle}>
                {Strings.getLang(meta.titleKey)}
                {totalUsage !== '_ _' ? ` ${totalUsage}` : ''}
              </Text>
              <View className={styles.chartBody}>
                {devIdList.length > 0 ? (
                  <StatCharts
                    style={CHART_STYLE}
                    devIdList={devIdList}
                    dpList={dpList}
                    unit={meta.unit}
                    range={chartRange}
                    // @ts-ignore cumulative DP → period delta (miniapp-1 chart-card)
                    type="sum"
                    startDate={startDate}
                    endDate={endDate}
                    chartType="bar"
                    width={564}
                    height={480}
                    colors={CHART_COLORS}
                    keepScalaPoint={meta.keepScalaPoint}
                    dataTransformer={dataTransformer}
                  />
                ) : (
                  <View className={styles.chartEmpty}>
                    <Text className={styles.chartEmptyText}>
                      {Strings.getLang('energy_load_failed')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {metric === 'water' ? (
              <Text className={styles.errorHint}>{Strings.getLang('energy_error_hint')}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default EnergyReport;
