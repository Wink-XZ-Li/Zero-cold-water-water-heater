import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, navigateBack } from '@ray-js/ray';
import { NavBar } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import styles from './index.module.less';

type Metric = 'water' | 'gas';
type Period = 'day' | 'week' | 'month' | 'year';

/**
 * Energy report page shell for 004 — Ardot 55:1044 layout, no real data/Charts.
 * Metric/period are local UI-only; no cloud query or DP writes.
 */
export function EnergyReport() {
  const [metric] = useState<Metric>('water');
  const [period] = useState<Period>('day');

  const dateLabel = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }, []);

  const periods: { key: Period; labelKey: string }[] = [
    { key: 'day', labelKey: 'energy_period_day' },
    { key: 'week', labelKey: 'energy_period_week' },
    { key: 'month', labelKey: 'energy_period_month' },
    { key: 'year', labelKey: 'energy_period_year' },
  ];

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
          <View className={styles.banner}>
            <Text className={styles.bannerText}>
              {Strings.getLang('energy_report_unavailable')}
            </Text>
          </View>

          <View className={styles.card}>
            <View className={styles.metricRow}>
              <View
                className={`${styles.metricChip} ${metric === 'water' ? styles.metricChipOn : ''}`}
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
              >
                <Text
                  className={`${styles.metricText} ${metric === 'gas' ? styles.metricTextOn : ''}`}
                >
                  {Strings.getLang('energy_metric_gas')}
                </Text>
              </View>
            </View>

            <View className={styles.periodRow}>
              {periods.map(item => {
                const on = period === item.key;
                return (
                  <View
                    key={item.key}
                    className={`${styles.periodChip} ${on ? styles.periodChipOn : ''}`}
                  >
                    <Text className={`${styles.periodText} ${on ? styles.periodTextOn : ''}`}>
                      {Strings.getLang(item.labelKey)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className={styles.dateRow}>
              <Text className={styles.dateNav}>‹</Text>
              <Text className={styles.dateLabel}>{dateLabel}</Text>
              <Text className={styles.dateNav}>›</Text>
            </View>

            <View className={styles.chartCard}>
              <Text className={styles.chartTitle}>
                {metric === 'gas'
                  ? Strings.getLang('energy_chart_gas_title')
                  : Strings.getLang('energy_chart_water_title')}
              </Text>
              <View className={styles.chartEmpty}>
                <Text className={styles.chartEmptyText}>
                  {Strings.getLang('energy_report_unavailable')}
                </Text>
              </View>
            </View>

            <Text className={styles.errorHint}>{Strings.getLang('energy_error_hint')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default EnergyReport;
