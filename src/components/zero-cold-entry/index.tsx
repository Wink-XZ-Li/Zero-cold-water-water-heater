import React from 'react';
import { View, Text, navigateTo } from '@ray-js/ray';
import { Switch } from '@ray-js/smart-ui';
import { useProps, useActions } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

/**
 * Zero-cold home block — Ardot 55:817 (toggle) + 55:824 (preheat entry).
 * Toggle binds once_zero_cold only; schedule details stay on placeholder page.
 */
export function ZeroColdEntry({ disabled }: Props) {
  const once = useProps(p => !!p.once_zero_cold);
  const actions = useActions();

  const onToggle = (event: { detail?: boolean } | boolean) => {
    if (disabled) return;
    const checked = typeof event === 'boolean' ? event : !!event?.detail;
    actions.once_zero_cold.set(checked);
  };

  const onOpenPreheat = () => {
    navigateTo({ url: '/pages/zero-cold-placeholder/index' });
  };

  return (
    <View className={styles.wrap}>
      <View className={`${styles.row} ${disabled ? styles.disabled : ''}`}>
        <View className={styles.iconWrap}>
          <Text className={styles.icon}>水</Text>
        </View>
        <Text className={styles.title}>{Strings.getLang('zero_cold_entry')}</Text>
        <Switch
          checked={once}
          disabled={disabled}
          activeColor="var(--index-accent)"
          onChange={onToggle}
        />
      </View>
      <View className={styles.row} onClick={onOpenPreheat}>
        <View className={styles.iconWrap}>
          <Text className={styles.icon}>预</Text>
        </View>
        <Text className={styles.title}>{Strings.getLang('zero_cold_preheat')}</Text>
        <Text className={styles.arrow}>›</Text>
      </View>
    </View>
  );
}

export default ZeroColdEntry;
