import React, { useEffect, useState } from 'react';
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

/** Fault banner — Ardot node 55:781；显隐带伸展过渡 */
export function FaultBanner() {
  const { hasFault, codes } = useFaultSummary();
  const [mounted, setMounted] = useState(hasFault);
  const [open, setOpen] = useState(hasFault);
  const [codesSnap, setCodesSnap] = useState(codes);

  useEffect(() => {
    if (hasFault) {
      setCodesSnap(codes);
      setMounted(true);
      const t = setTimeout(() => setOpen(true), 30);
      return () => clearTimeout(t);
    }
    setOpen(false);
    const t = setTimeout(() => setMounted(false), 320);
    return () => clearTimeout(t);
  }, [hasFault, codes.join(',')]);

  if (!mounted) {
    return null;
  }

  const primary = faultHeadline(codesSnap[0] || '');
  const title = `${Strings.getLang('fault_remind_prefix')}${primary}`;

  const onOpenDetail = () => {
    const lines = codesSnap.map(code => faultHeadline(code));
    const message = lines.length > 0 ? lines.join('\n') : Strings.getLang('fault_none');
    DialogInstance.alert({
      title: Strings.getLang('fault_detail_title'),
      message,
      confirmButtonText: Strings.getLang('confirm'),
      messageAlign: 'left',
    }).catch(() => undefined);
  };

  return (
    <View className={`${styles.shell} ${open ? styles.shellOpen : ''}`}>
      <View className={styles.shellInner}>
        <View
          className={styles.banner}
          hoverClassName={styles.bannerHover}
          hoverStartTime={20}
          hoverStayTime={70}
          onClick={onOpenDetail}
        >
          <View className={styles.iconWrap}>
            <FaultWarnGlyph size={32} />
          </View>
          <View className={styles.meta}>
            <Text className={styles.title}>{title}</Text>
            <Text className={styles.hint}>{Strings.getLang('fault_hint')}</Text>
          </View>
          <View className={styles.arrowWrap}>
            <ArrowRightGlyph fill={ICON_NAVY} size={12} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default FaultBanner;
