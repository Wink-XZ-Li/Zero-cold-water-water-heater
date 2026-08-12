import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { useTempSetGuard } from '@/hooks/useTempSetGuard';
import Strings from '@/i18n';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

export function TempControl({ disabled }: Props) {
  const tempSetRaw = useProps(p => p.temp_set as number);
  const tempCurrentRaw = useProps(p => p.temp_current as number);
  const actions = useActions();
  const { min, max, toDisplay, prepareWrite } = useTempSetGuard();

  const setDisplay = toDisplay(tempSetRaw);
  const currentDisplay = toDisplay(tempCurrentRaw);

  const applyDelta = (delta: number) => {
    if (disabled) return;
    const base = Number.isFinite(setDisplay) ? setDisplay : min;
    const next = prepareWrite(base + delta);
    if (!next.ok) return;
    actions.temp_set.set(next.raw);
  };

  return (
    <View className={styles.wrap}>
      <View className={styles.currentBlock}>
        <Text className={styles.label}>{Strings.getLang('temp_current')}</Text>
        <Text className={styles.currentValue}>
          {Number.isFinite(currentDisplay) ? `${currentDisplay}` : '--'}
          <Text className={styles.unit}>{Strings.getLang('unit_celsius')}</Text>
        </Text>
      </View>
      <View className={styles.setBlock}>
        <Text className={styles.label}>{Strings.getLang('temp_set')}</Text>
        <View className={styles.stepper}>
          <View
            className={`${styles.btn} ${disabled ? styles.btnDisabled : ''}`}
            onClick={() => applyDelta(-1)}
          >
            <Text className={styles.btnText}>−</Text>
          </View>
          <Text className={styles.setValue}>
            {Number.isFinite(setDisplay) ? setDisplay : '--'}
            {Strings.getLang('unit_celsius')}
          </Text>
          <View
            className={`${styles.btn} ${disabled ? styles.btnDisabled : ''}`}
            onClick={() => applyDelta(1)}
          >
            <Text className={styles.btnText}>+</Text>
          </View>
        </View>
        <Text className={styles.hint}>
          {min}–{max}
          {Strings.getLang('unit_celsius')}
        </Text>
      </View>
    </View>
  );
}

export default TempControl;
