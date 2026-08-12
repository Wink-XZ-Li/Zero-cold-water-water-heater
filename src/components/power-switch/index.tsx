import React from 'react';
import { View, Text } from '@ray-js/ray';
import { Switch } from '@ray-js/smart-ui';
import { useProps, useActions } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

export function PowerSwitch({ disabled }: Props) {
  const on = useProps(p => !!p.switch);
  const actions = useActions();

  const onChange = (checked: boolean) => {
    if (disabled) return;
    actions.switch.set(checked);
  };

  return (
    <View className={styles.row}>
      <View className={styles.meta}>
        <Text className={styles.label}>{Strings.getLang('power')}</Text>
        <Text className={styles.value}>
          {on ? Strings.getLang('power_on') : Strings.getLang('power_off')}
        </Text>
      </View>
      <Switch
        checked={on}
        disabled={disabled}
        activeColor="var(--index-accent)"
        onChange={onChange}
      />
    </View>
  );
}

export default PowerSwitch;
