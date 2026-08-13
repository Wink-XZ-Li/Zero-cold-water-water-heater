import React from 'react';
import { View, Text, navigateTo } from '@ray-js/ray';
import Strings from '@/i18n';
import styles from './index.module.less';

/**
 * Energy report home entry — Ardot 55:864 / 55:954 → page shell.
 */
export function EnergyReportEntry() {
  const onOpen = () => {
    navigateTo({ url: '/pages/energy-report/index' });
  };

  return (
    <View className={styles.row} onClick={onOpen}>
      <View className={styles.iconWrap}>
        <Text className={styles.icon}>报</Text>
      </View>
      <Text className={styles.title}>{Strings.getLang('energy_report')}</Text>
      <Text className={styles.arrow}>›</Text>
    </View>
  );
}

export default EnergyReportEntry;
