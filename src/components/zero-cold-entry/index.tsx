import React from 'react';
import { View, Text, navigateTo } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import styles from './index.module.less';

export function ZeroColdEntry() {
  const once = useProps(p => !!p.once_zero_cold);
  const always = useProps(p => !!p.zc_always_on);

  const onOpen = () => {
    navigateTo({ url: '/pages/zero-cold-placeholder/index' });
  };

  return (
    <View className={styles.card} onClick={onOpen}>
      <View className={styles.meta}>
        <Text className={styles.title}>{Strings.getLang('zero_cold_entry')}</Text>
        <Text className={styles.summary}>
          {Strings.getLang('zero_cold_once')}:{' '}
          {once ? Strings.getLang('state_on') : Strings.getLang('state_off')}
          {' · '}
          {Strings.getLang('zero_cold_always')}:{' '}
          {always ? Strings.getLang('state_on') : Strings.getLang('state_off')}
        </Text>
      </View>
      <Text className={styles.arrow}>›</Text>
    </View>
  );
}

export default ZeroColdEntry;
