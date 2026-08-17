import React from 'react';
import { View, Text, navigateTo } from '@ray-js/ray';
import { Switch } from '@ray-js/smart-ui';
import { useProps, useActions } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import {
  ArrowRightGlyph,
  ICON_LIGHT,
  ICON_NAVY,
  PreheatGlyph,
  ZeroColdGlyph,
} from '@/components/panel-icons';
import styles from './index.module.less';

type Props = {
  /** Disables the zero-cold DP switch only; preheat entry stays tappable. */
  writeDisabled?: boolean;
};

/**
 * Zero-cold home block — Ardot 55:817 (toggle) + 55:824 (preheat entry).
 * Toggle is the OR of once_zero_cold (DP 101, one-shot) and zc_always_on (DP 104, schedule).
 * Off  101=F 104=F → tap opens one-shot (101=T)
 * On   101=F 104=T → tap closes schedule (104=F)
 * On   101=T 104=F → tap closes one-shot (101=F)
 * On   101=T 104=T → tap closes both
 * Preheat row opens schedule list (002).
 */
export function ZeroColdEntry({ writeDisabled }: Props) {
  const once = useProps(p => !!p.once_zero_cold);
  const alwaysOn = useProps(p => !!p.zc_always_on);
  const actions = useActions();
  const isOn = once || alwaysOn;
  // 104 (schedule) outranks 101 for the subtitle.
  let hintKey: 'zero_cold_hint_off' | 'zero_cold_hint_once' | 'zero_cold_hint_schedule' =
    'zero_cold_hint_off';
  if (alwaysOn) hintKey = 'zero_cold_hint_schedule';
  else if (once) hintKey = 'zero_cold_hint_once';

  const onToggle = (event: { detail?: boolean } | boolean) => {
    if (writeDisabled) return;
    const checked = typeof event === 'boolean' ? event : !!event?.detail;
    if (checked) {
      if (!once) actions.once_zero_cold.set(true);
      return;
    }
    if (once) actions.once_zero_cold.set(false);
    if (alwaysOn) actions.zc_always_on.set(false);
  };

  const onOpenPreheat = () => {
    navigateTo({ url: '/pages/zero-cold-schedule/index' });
  };

  return (
    <View className={styles.wrap}>
      <View className={`${styles.row} ${writeDisabled ? styles.disabled : ''}`}>
        <View className={styles.iconWrap}>
          <ZeroColdGlyph fill={ICON_LIGHT} size={20} />
        </View>
        <View className={styles.textCol}>
          <Text className={styles.title}>{Strings.getLang('zero_cold_entry')}</Text>
          <Text className={styles.hint}>{Strings.getLang(hintKey)}</Text>
        </View>
        <Switch
          checked={isOn}
          disabled={writeDisabled}
          activeColor="var(--index-accent)"
          onChange={onToggle}
        />
      </View>
      <View
        className={styles.row}
        hoverClassName={styles.rowHover}
        hoverStartTime={20}
        hoverStayTime={70}
        onClick={onOpenPreheat}
      >
        <View className={styles.iconWrap}>
          <PreheatGlyph fill={ICON_LIGHT} size={20} />
        </View>
        <Text className={styles.title}>{Strings.getLang('zero_cold_preheat')}</Text>
        <View className={styles.arrow}>
          <ArrowRightGlyph fill={ICON_NAVY} size={12} />
        </View>
      </View>
    </View>
  );
}

export default ZeroColdEntry;
