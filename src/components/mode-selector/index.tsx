import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { isEnumAllowed } from '@/utils/dp';
import Strings from '@/i18n';
import styles from './index.module.less';

/** Design shows four tiles; no_mode remains in schema but is not a tile. */
const MODE_TILES = [
  { code: 'eco', mark: 'Eco' },
  { code: 'kitchen', mark: '厨' },
  { code: 'bath', mark: '浴' },
  { code: 'auto_temp', mark: '温' },
] as const;

const MODE_RANGE = ['no_mode', 'eco', 'kitchen', 'bath', 'auto_temp'];

type Props = {
  disabled?: boolean;
};

function modeLabel(code: string) {
  const key = `dp_mode_${code}`;
  const text = Strings.getLang(key);
  return text === key ? code : text;
}

/** Mode grid — Ardot nodes 55:797–55:816 */
export function ModeSelector({ disabled }: Props) {
  const mode = useProps(p => (p.mode as string) || 'no_mode');
  const actions = useActions();

  const onSelect = (value: string) => {
    if (disabled) return;
    if (!isEnumAllowed(value, MODE_RANGE)) return;
    actions.mode.set(value);
  };

  return (
    <View className={styles.wrap}>
      <View className={styles.titleRow}>
        <View className={styles.titleGlyph} />
        <Text className={styles.title}>{Strings.getLang('mode')}</Text>
      </View>
      <View className={styles.grid}>
        {MODE_TILES.map(item => {
          const active = mode === item.code;
          return (
            <View
              key={item.code}
              className={`${styles.chip} ${active ? styles.chipActive : ''} ${
                disabled ? styles.chipDisabled : ''
              }`}
              onClick={() => onSelect(item.code)}
            >
              <View className={`${styles.iconBox} ${active ? styles.iconBoxActive : ''}`}>
                <Text className={`${styles.icon} ${active ? styles.iconActive : ''}`}>
                  {item.mark}
                </Text>
              </View>
              <Text className={`${styles.chipText} ${active ? styles.chipTextActive : ''}`}>
                {modeLabel(item.code)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default ModeSelector;
