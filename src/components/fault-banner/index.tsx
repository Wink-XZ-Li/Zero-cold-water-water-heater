import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useFaultSummary } from '@/hooks/useFaultSummary';
import Strings from '@/i18n';
import styles from './index.module.less';

function faultLabel(code: string) {
  const key = `fault_code_${code}`;
  const text = Strings.getLang(key);
  return text === key ? code : text;
}

/** Fault banner — Ardot node 55:781 */
export function FaultBanner() {
  const { hasFault, codes } = useFaultSummary();
  if (!hasFault) {
    return null;
  }

  const primary = faultLabel(codes[0] || '');
  const title = `${Strings.getLang('fault_remind_prefix')}${primary}`;

  return (
    <View className={styles.banner}>
      <View className={styles.iconWrap}>
        <Text className={styles.icon}>!</Text>
      </View>
      <View className={styles.meta}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.hint}>{Strings.getLang('fault_hint')}</Text>
      </View>
      <Text className={styles.arrow}>›</Text>
    </View>
  );
}

export default FaultBanner;
