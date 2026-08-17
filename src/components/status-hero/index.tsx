import React, { useEffect, useState } from 'react';
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
};

function resolveBadge(workState: string | undefined, hasFault: boolean): BadgeModel | null {
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

/** 按文案粗估胶囊目标宽度，便于 max-width 过渡 */
function badgeWidthRpx(badge: BadgeModel | null) {
  if (!badge) return 0;
  if (badge.tone === 'heating') return 320;
  if (badge.tone === 'standby') return 168;
  return 148;
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

  const [displayBadge, setDisplayBadge] = useState<BadgeModel | null>(badge);
  const [badgeOpen, setBadgeOpen] = useState(!!badge);

  useEffect(() => {
    if (badge) {
      setDisplayBadge(badge);
      setBadgeOpen(true);
      return undefined;
    }
    setBadgeOpen(false);
    const t = setTimeout(() => setDisplayBadge(null), 300);
    return () => clearTimeout(t);
  }, [badge?.tone, badge?.label]);

  const widthRpx = badgeOpen ? badgeWidthRpx(displayBadge) : 0;

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
        <View
          className={`${styles.badge} ${badgeOpen ? styles.badgeOpen : ''}`}
          style={{ maxWidth: `${widthRpx}rpx` }}
        >
          {displayBadge ? (
            <>
              <View className={`${styles.dot} ${toneClass(displayBadge.tone)}`} />
              <Text className={styles.badgeText}>{displayBadge.label}</Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default StatusHero;
