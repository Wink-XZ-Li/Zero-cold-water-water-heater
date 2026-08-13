import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

/** Power row — Ardot node 55:792 */
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
      <View className={styles.iconWrap}>
        <Text className={styles.icon}>⏻</Text>
      </View>
      <Text className={styles.label}>{Strings.getLang('power_on')}</Text>
    </View>
  );
}

export default PowerSwitch;
