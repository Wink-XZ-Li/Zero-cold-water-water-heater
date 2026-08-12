import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useFaultSummary } from '@/hooks/useFaultSummary';
import Strings from '@/i18n';
import styles from './index.module.less';

export function FaultBanner() {
  const { hasFault, codes } = useFaultSummary();
  if (!hasFault) {
    return null;
  }

  return (
    <View className={styles.banner}>
      <Text className={styles.title}>{Strings.getLang('fault_title')}</Text>
      <Text className={styles.codes}>{codes.join(' · ')}</Text>
    </View>
  );
}

export default FaultBanner;
