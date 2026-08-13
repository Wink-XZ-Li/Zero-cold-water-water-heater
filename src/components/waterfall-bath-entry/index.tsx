import React from 'react';
import { View, Text } from '@ray-js/ray';
import { Switch } from '@ray-js/smart-ui';
import { useProps, useActions } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import { ICON_LIGHT, WaterfallGlyph } from '@/components/panel-icons';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

/**
 * Waterfall bath (turbo) — Ardot 55:864 / 55:954.
 */
export function WaterfallBathEntry({ disabled }: Props) {
  const turbo = useProps(p => !!p.turbo);
  const actions = useActions();

  const onToggle = (event: { detail?: boolean } | boolean) => {
    if (disabled) return;
    const checked = typeof event === 'boolean' ? event : !!event?.detail;
    actions.turbo.set(checked);
  };

  return (
    <View className={`${styles.row} ${disabled ? styles.disabled : ''}`}>
      <View className={styles.iconWrap}>
        <WaterfallGlyph fill={ICON_LIGHT} size={20} />
      </View>
      <View className={styles.textCol}>
        <Text className={styles.title}>{Strings.getLang('waterfall_bath')}</Text>
        <Text className={styles.hint}>{Strings.getLang('waterfall_bath_hint')}</Text>
      </View>
      <Switch
        checked={turbo}
        disabled={disabled}
        activeColor="var(--index-accent)"
        onChange={onToggle}
      />
    </View>
  );
}

export default WaterfallBathEntry;
