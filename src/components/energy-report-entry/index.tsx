import React from 'react';
import { View, Text, navigateTo } from '@ray-js/ray';
import Strings from '@/i18n';
import { ArrowRightGlyph, EnergyGlyph, ICON_LIGHT, ICON_NAVY } from '@/components/panel-icons';
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
        <EnergyGlyph fill={ICON_LIGHT} size={18} />
      </View>
      <Text className={styles.title}>{Strings.getLang('energy_report')}</Text>
      <View className={styles.arrow}>
        <ArrowRightGlyph fill={ICON_NAVY} size={12} />
      </View>
    </View>
  );
}

export default EnergyReportEntry;
