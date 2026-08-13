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
 * Toggle binds once_zero_cold; preheat row opens schedule list (002).
 */
export function ZeroColdEntry({ writeDisabled }: Props) {
  const once = useProps(p => !!p.once_zero_cold);
  const actions = useActions();

  const onToggle = (event: { detail?: boolean } | boolean) => {
    if (writeDisabled) return;
    const checked = typeof event === 'boolean' ? event : !!event?.detail;
    actions.once_zero_cold.set(checked);
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
        <Text className={styles.title}>{Strings.getLang('zero_cold_entry')}</Text>
        <Switch
          checked={once}
          disabled={writeDisabled}
          activeColor="var(--index-accent)"
          onChange={onToggle}
        />
      </View>
      <View className={styles.row} onClick={onOpenPreheat}>
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
