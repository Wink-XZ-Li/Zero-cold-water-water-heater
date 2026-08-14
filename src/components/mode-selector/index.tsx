import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { isEnumAllowed } from '@/utils/dp';
import Strings from '@/i18n';
import { ModeIcon } from '@/components/mode-icons';
import { ICON_NAVY, ModeTitleGlyph } from '@/components/panel-icons';
import { BathFlowControl } from '@/components/bath-flow-control';
import styles from './index.module.less';

/** Design shows four tiles; no_mode remains in schema but is not a tile. */
const MODE_TILES = [
  { code: 'eco' as const },
  { code: 'kitchen' as const },
  { code: 'bath' as const },
  { code: 'auto_temp' as const },
];

const MODE_RANGE = ['no_mode', 'eco', 'kitchen', 'bath', 'auto_temp'];

type Props = {
  disabled?: boolean;
};

function modeLabel(code: string) {
  const key = `dp_mode_${code}`;
  const text = Strings.getLang(key);
  return text === key ? code : text;
}

/** Mode grid — Ardot nodes 55:797–55:816；浴缸选中时气泡伸展引出流量设置 */
export function ModeSelector({ disabled }: Props) {
  const mode = useProps(p => (p.mode as string) || 'no_mode');
  const actions = useActions();
  const showBathFlow = mode === 'bath';

  const onSelect = (value: string) => {
    if (disabled) return;
    // 再点已选中模式 → 无模式
    const next = mode === value ? 'no_mode' : value;
    if (!isEnumAllowed(next, MODE_RANGE)) return;
    actions.mode.set(next);
  };

  return (
    <View className={styles.wrap}>
      <View className={styles.titleRow}>
        <View className={styles.titleGlyph}>
          <View className={styles.titleGlyphSvg}>
            <ModeTitleGlyph fill={ICON_NAVY} size={18} />
          </View>
        </View>
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
              hoverClassName={disabled ? undefined : styles.chipHover}
              hoverStartTime={20}
              hoverStayTime={70}
              onClick={() => onSelect(item.code)}
            >
              <View className={styles.iconBox}>
                <ModeIcon code={item.code} active={active} />
              </View>
              <Text className={`${styles.chipText} ${active ? styles.chipTextActive : ''}`}>
                {modeLabel(item.code)}
              </Text>
            </View>
          );
        })}
      </View>
      <View className={`${styles.bathExtra} ${showBathFlow ? styles.bathExtraOpen : ''}`}>
        <View className={styles.bathExtraInner}>
          <BathFlowControl disabled={disabled} />
        </View>
      </View>
    </View>
  );
}

export default ModeSelector;
