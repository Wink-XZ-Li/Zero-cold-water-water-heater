import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import { ICON_LIGHT, PowerGlyph } from '@/components/panel-icons';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

/**
 * Power row — Ardot 55:792.
 * 开启：白底 + 海军蓝图标圈（稿面「开机」行样式）
 * 关闭：同布局，仅图标圈变暗
 */
export function PowerSwitch({ disabled }: Props) {
  const on = useProps(p => !!p.switch);
  const actions = useActions();

  const onToggle = () => {
    if (disabled) return;
    actions.switch.set(!on);
  };

  return (
    <View
      className={`${styles.row} ${disabled ? styles.disabled : ''}`}
      hoverClassName={disabled ? undefined : styles.rowHover}
      hoverStartTime={20}
      hoverStayTime={70}
      onClick={onToggle}
    >
      <View className={`${styles.iconWrap} ${on ? '' : styles.iconWrapOff}`}>
        <PowerGlyph fill={ICON_LIGHT} size={20} />
      </View>
      <Text className={styles.label} style={{ color: '#2B1F1D' }}>
        {Strings.getLang(on ? 'power_on' : 'power_off')}
      </Text>
    </View>
  );
}

export default PowerSwitch;
