import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import styles from './index.module.less';

function workStateLabel(code: string | undefined) {
  if (!code) return '--';
  const key = `dp_work_state_${code}`;
  const text = Strings.getLang(key);
  return text === key ? code : text;
}

export function WorkStateDisplay() {
  const workState = useProps(p => p.work_state as string);

  return (
    <View className={styles.row}>
      <Text className={styles.label}>{Strings.getLang('work_state')}</Text>
      <Text className={styles.value}>{workStateLabel(workState)}</Text>
    </View>
  );
}

export default WorkStateDisplay;
