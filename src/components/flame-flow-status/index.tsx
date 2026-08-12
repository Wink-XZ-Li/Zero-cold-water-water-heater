import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import styles from './index.module.less';

/**
 * Mount on home only when Figma confirms flame/flow nodes (see docs/design/figma-nodes.md).
 */
export function FlameFlowStatus() {
  const flame = useProps(p => !!p.flame_state2);
  const flow = useProps(p => !!p.flow_state2);

  return (
    <View className={styles.row}>
      <View className={styles.item}>
        <Text className={styles.label}>{Strings.getLang('flame')}</Text>
        <Text className={styles.value}>
          {flame ? Strings.getLang('state_on') : Strings.getLang('state_off')}
        </Text>
      </View>
      <View className={styles.item}>
        <Text className={styles.label}>{Strings.getLang('flow')}</Text>
        <Text className={styles.value}>
          {flow ? Strings.getLang('state_on') : Strings.getLang('state_off')}
        </Text>
      </View>
    </View>
  );
}

export default FlameFlowStatus;
