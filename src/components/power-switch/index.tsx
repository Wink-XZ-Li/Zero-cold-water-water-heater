import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import { ICON_LIGHT, ICON_NAVY, PowerGlyph } from '@/components/panel-icons';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

/** Power row — Ardot 55:792. On-state navy fill is a product exception. */
export function PowerSwitch({ disabled }: Props) {
  const on = useProps(p => !!p.switch);
  const actions = useActions();

  const onToggle = () => {
    if (disabled) return;
    actions.switch.set(!on);
  };

  return (
    <View
      className={`${styles.row} ${disabled ? styles.disabled : ''} ${on ? styles.on : ''}`}
      onClick={onToggle}
    >
      <View className={`${styles.iconWrap} ${on ? styles.iconWrapOn : ''}`}>
        <PowerGlyph fill={on ? ICON_NAVY : ICON_LIGHT} size={22} />
      </View>
      <Text className={styles.label} style={{ color: on ? '#F5F5F5' : '#2B1F1D' }}>
        {Strings.getLang(on ? 'power_off' : 'power_on')}
      </Text>
    </View>
  );
}

export default PowerSwitch;
