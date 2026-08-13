import React from 'react';
import { View, Text } from '@ray-js/ray';
import { DialogInstance } from '@ray-js/smart-ui';
import { useFaultSummary } from '@/hooks/useFaultSummary';
import Strings from '@/i18n';
import { ArrowRightGlyph, FaultWarnGlyph, ICON_NAVY } from '@/components/panel-icons';
import styles from './index.module.less';

function faultLabel(code: string) {
  const key = `fault_code_${code}`;
  const text = Strings.getLang(key);
  return text === key ? code : text;
}

function faultHeadline(code: string) {
  const label = faultLabel(code);
  return label === code ? code : `${code} ${label}`;
}

/** Fault banner — Ardot node 55:781; tap shows in-place summary (no handbook page) */
export function FaultBanner() {
  const { hasFault, codes } = useFaultSummary();
  if (!hasFault) {
    return null;
  }

  const primary = faultHeadline(codes[0] || '');
  const title = `${Strings.getLang('fault_remind_prefix')}${primary}`;

  const onOpenDetail = () => {
    const lines = codes.map(code => faultHeadline(code));
    const message = lines.length > 0 ? lines.join('\n') : Strings.getLang('fault_none');
    DialogInstance.alert({
      title: Strings.getLang('fault_detail_title'),
      message,
      confirmButtonText: Strings.getLang('confirm'),
      messageAlign: 'left',
    }).catch(() => undefined);
  };

  return (
    <View className={styles.banner} onClick={onOpenDetail}>
      <View className={styles.iconWrap}>
        <FaultWarnGlyph size={24} />
      </View>
      <View className={styles.meta}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.hint}>{Strings.getLang('fault_hint')}</Text>
      </View>
      <View className={styles.arrowWrap}>
        <ArrowRightGlyph fill={ICON_NAVY} size={12} />
      </View>
    </View>
  );
}

export default FaultBanner;
