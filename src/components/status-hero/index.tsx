import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
import { useTempSetGuard } from '@/hooks/useTempSetGuard';
import Strings from '@/i18n';
import styles from './index.module.less';

function workStateLabel(code: string | undefined) {
  if (!code) return '--';
  const key = `dp_work_state_${code}`;
  const text = Strings.getLang(key);
  return text === key ? code : text;
}

/** Hero status card — Ardot node 55:848 */
export function StatusHero() {
  const tempSetRaw = useProps(p => p.temp_set as number);
  const tempCurrentRaw = useProps(p => p.temp_current as number);
  const workState = useProps(p => p.work_state as string);
  const { toDisplay } = useTempSetGuard();

  const setDisplay = toDisplay(tempSetRaw);
  const currentDisplay = toDisplay(tempCurrentRaw);
  const heating = workState === 'bath_heating' || workState === 'zc_heating';

  return (
    <View className={styles.hero}>
      <Text className={styles.setLabel}>{Strings.getLang('temp_set')}</Text>
      <View className={styles.tempRow}>
        <Text className={styles.setValue}>{Number.isFinite(setDisplay) ? setDisplay : '--'}</Text>
        <Text className={styles.setUnit}>{Strings.getLang('unit_celsius')}</Text>
      </View>
      <View className={styles.metaRow}>
        <Text className={styles.outlet}>
          {Strings.getLang('temp_current')}：
          {Number.isFinite(currentDisplay) ? currentDisplay : '--'}
          {Strings.getLang('unit_celsius')}
        </Text>
        <View className={styles.badge}>
          <View className={`${styles.dot} ${heating ? styles.dotOn : styles.dotOff}`} />
          <Text className={styles.badgeText}>{workStateLabel(workState)}</Text>
        </View>
      </View>
    </View>
  );
}

export default StatusHero;
