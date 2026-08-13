import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
import { useTempSetGuard } from '@/hooks/useTempSetGuard';
import { useFaultSummary } from '@/hooks/useFaultSummary';
import Strings from '@/i18n';
import styles from './index.module.less';

type BadgeTone = 'heating' | 'standby' | 'fault';

type BadgeModel = {
  tone: BadgeTone;
  label: string;
} | null;

function resolveBadge(workState: string | undefined, hasFault: boolean): BadgeModel {
  if (hasFault) {
    return { tone: 'fault', label: Strings.getLang('hero_badge_fault') };
  }
  if (!workState || workState === 'off') {
    return null;
  }
  if (workState === 'standby') {
    return { tone: 'standby', label: Strings.getLang('dp_work_state_standby') };
  }
  if (workState === 'bath_heating') {
    return { tone: 'heating', label: Strings.getLang('dp_work_state_bath_heating') };
  }
  if (workState === 'zc_heating') {
    return { tone: 'heating', label: Strings.getLang('dp_work_state_zc_heating') };
  }
  return null;
}

function toneClass(tone: BadgeTone) {
  if (tone === 'fault') return styles.dotFault;
  if (tone === 'standby') return styles.dotStandby;
  return styles.dotHeating;
}

/** Hero status card — Ardot node 55:848 */
export function StatusHero() {
  const tempSetRaw = useProps(p => p.temp_set as number);
  const tempCurrentRaw = useProps(p => p.temp_current as number);
  const workState = useProps(p => p.work_state as string);
  const { hasFault } = useFaultSummary();
  const { toDisplay } = useTempSetGuard();

  const setDisplay = toDisplay(tempSetRaw);
  const currentDisplay = toDisplay(tempCurrentRaw);
  const badge = resolveBadge(workState, hasFault);

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
        {badge ? (
          <View className={styles.badge}>
            <View className={`${styles.dot} ${toneClass(badge.tone)}`} />
            <Text className={styles.badgeText}>{badge.label}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default StatusHero;
