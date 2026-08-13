import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { useTempSetGuard } from '@/hooks/useTempSetGuard';
import Strings from '@/i18n';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

/** Bathroom temp card — Ardot node 55:832 */
export function TempControl({ disabled }: Props) {
  const tempSetRaw = useProps(p => p.temp_set as number);
  const actions = useActions();
  const { min, max, toDisplay, prepareWrite } = useTempSetGuard();

  const setDisplay = toDisplay(tempSetRaw);
  const safeValue = Number.isFinite(setDisplay) ? setDisplay : min;
  const ratio = Math.max(0, Math.min(1, (safeValue - min) / (max - min || 1)));

  const applyDelta = (delta: number) => {
    if (disabled) return;
    const next = prepareWrite(safeValue + delta);
    if (!next.ok) return;
    actions.temp_set.set(next.raw);
  };

  return (
    <View className={styles.wrap}>
      <View className={styles.header}>
        <View className={styles.headerIcon}>
          <Text className={styles.headerIconText}>浴</Text>
        </View>
        <Text className={styles.headerTitle}>{Strings.getLang('bath_temp_set')}</Text>
        <Text className={styles.headerValue}>
          {Number.isFinite(setDisplay) ? setDisplay : '--'}
          {Strings.getLang('unit_celsius')}
        </Text>
      </View>
      <View className={styles.body}>
        <View
          className={`${styles.btn} ${disabled ? styles.btnDisabled : ''}`}
          onClick={() => applyDelta(-1)}
        >
          <Text className={styles.btnText}>−</Text>
        </View>
        <View className={styles.slider}>
          <View className={styles.track} />
          <View className={styles.fill} style={{ width: `${Math.round(ratio * 100)}%` }} />
          <View className={styles.thumb} style={{ left: `${Math.round(ratio * 100)}%` }} />
        </View>
        <View
          className={`${styles.btn} ${disabled ? styles.btnDisabled : ''}`}
          onClick={() => applyDelta(1)}
        >
          <Text className={styles.btnText}>+</Text>
        </View>
      </View>
      <View className={styles.rangeRow}>
        <Text className={styles.rangeText}>
          {min}
          {Strings.getLang('unit_celsius')}
        </Text>
        <Text className={styles.rangeText}>
          {max}
          {Strings.getLang('unit_celsius')}
        </Text>
      </View>
    </View>
  );
}

export default TempControl;
