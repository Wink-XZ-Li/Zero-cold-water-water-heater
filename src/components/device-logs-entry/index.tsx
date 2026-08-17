import React from 'react';
import { View, Text, navigateTo } from '@ray-js/ray';
import { ArrowRightGlyph, EnergyGlyph, ICON_LIGHT, ICON_NAVY } from '@/components/panel-icons';
import styles from './index.module.less';

/**
 * Hidden home entry for device DP logs. Revealed by NavBar 5-tap.
 * Visual clone of EnergyReportEntry.
 */
export function DeviceLogsEntry() {
  const onOpen = () => {
    navigateTo({ url: '/pages/logs/index' });
  };

  return (
    <View
      className={styles.row}
      hoverClassName={styles.rowHover}
      hoverStartTime={20}
      hoverStayTime={70}
      onClick={onOpen}
    >
      <View className={styles.iconWrap}>
        <EnergyGlyph fill={ICON_LIGHT} size={13} />
      </View>
      <Text className={styles.title}>设备日志</Text>
      <View className={styles.arrow}>
        <ArrowRightGlyph fill={ICON_NAVY} size={12} />
      </View>
    </View>
  );
}

export default DeviceLogsEntry;
