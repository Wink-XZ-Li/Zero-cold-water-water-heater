import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { isEnumAllowed } from '@/utils/dp';
import Strings from '@/i18n';
import styles from './index.module.less';

const MODE_RANGE = ['no_mode', 'eco', 'kitchen', 'bath', 'auto_temp'] as const;

type Props = {
  disabled?: boolean;
};

function modeLabel(code: string) {
  const key = `dp_mode_${code}`;
  const text = Strings.getLang(key);
  return text === key ? code : text;
}

export function ModeSelector({ disabled }: Props) {
  const mode = useProps(p => (p.mode as string) || 'no_mode');
  const actions = useActions();

  const onSelect = (value: string) => {
    if (disabled) return;
    if (!isEnumAllowed(value, MODE_RANGE as unknown as string[])) return;
    actions.mode.set(value);
  };

  return (
    <View className={styles.wrap}>
      <Text className={styles.title}>{Strings.getLang('mode')}</Text>
      <View className={styles.grid}>
        {MODE_RANGE.map(item => {
          const active = mode === item;
          return (
            <View
              key={item}
              className={`${styles.chip} ${active ? styles.chipActive : ''} ${
                disabled ? styles.chipDisabled : ''
              }`}
              onClick={() => onSelect(item)}
            >
              <Text className={`${styles.chipText} ${active ? styles.chipTextActive : ''}`}>
                {modeLabel(item)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default ModeSelector;
