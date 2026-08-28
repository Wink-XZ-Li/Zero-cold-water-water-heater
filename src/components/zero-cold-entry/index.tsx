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
 * Toggle is the OR of one-shot (DP 101 panel / DP 109 water-ctrl) and zc_always_on (DP 104).
 * Off  101=F 109=F 104=F → tap opens panel one-shot (101=T only; never write 109=T)
 * On   any of 101/109/104 → tap closes 101, 109, and 104
 * 104 (schedule) outranks one-shot for the subtitle; 101 and 109 share「单次运行中」.
 * Preheat row opens schedule list (002).
 */
export function ZeroColdEntry({ writeDisabled }: Props) {
  const once = useProps(p => !!p.once_zero_cold);
  const waterCtrlOnce = useProps(p => !!p.water_ctrl_once_zc);
  const alwaysOn = useProps(p => !!p.zc_always_on);
  const actions = useActions();
  const onceShot = once || waterCtrlOnce;
  const isOn = onceShot || alwaysOn;
  let hintKey: 'zero_cold_hint_off' | 'zero_cold_hint_once' | 'zero_cold_hint_schedule' =
    'zero_cold_hint_off';
  if (alwaysOn) hintKey = 'zero_cold_hint_schedule';
  else if (onceShot) hintKey = 'zero_cold_hint_once';

  const onToggle = (event: { detail?: boolean } | boolean) => {
    if (writeDisabled) return;
    const checked = typeof event === 'boolean' ? event : !!event?.detail;
    if (checked) {
      if (!once) actions.once_zero_cold.set(true);
      return;
    }
    actions.once_zero_cold.set(false);
    actions.water_ctrl_once_zc.set(false);
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
