import React from 'react';
import { View, Text, ScrollView, navigateBack } from '@ray-js/ray';
import { NavBar } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import styles from './index.module.less';

export function ZeroColdPlaceholder() {
  return (
    <View className={styles.page}>
      <NavBar
        title={Strings.getLang('zero_cold_placeholder_title')}
        leftArrow
        onClickLeft={() => navigateBack()}
      />
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className={styles.scroll}
        style={{ flex: 1, height: '100%' }}
      >
        <View className={styles.body}>
          <Text className={styles.title}>{Strings.getLang('zero_cold_placeholder_title')}</Text>
          <Text className={styles.desc}>{Strings.getLang('zero_cold_placeholder_body')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default ZeroColdPlaceholder;
