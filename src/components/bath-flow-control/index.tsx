import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text } from '@ray-js/ray';
import Slider from '@ray-js/components-ty-slider';
import { useProps, useActions, useDevice } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

const PAGE_PAD_RPX = 32;
const CARD_PAD_RPX = 32;
const DESIGN_WIDTH_RPX = 750;

const FALLBACK_MIN = 50;
const FALLBACK_MAX = 990;
const FALLBACK_STEP = 10;

function clampStep(value: number, min: number, max: number, step: number) {
  const clamped = Math.min(max, Math.max(min, value));
  if (step <= 0) return clamped;
  const stepped = Math.round((clamped - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
}

/** 浴缸流量 — 自浴缸卡下方弹出的气泡滑条 */
export function BathFlowControl({ disabled }: Props) {
  const raw = useProps(p => p.bath_flow_set as number);
  const actions = useActions();
  const schema = useDevice(d => d.dpSchema?.bath_flow_set);
  const prop = schema?.property as { min?: number; max?: number; step?: number } | undefined;

  const min = prop?.min ?? FALLBACK_MIN;
  const max = prop?.max ?? FALLBACK_MAX;
  const step = prop?.step ?? FALLBACK_STEP;

  const safeValue = Number.isFinite(raw) ? clampStep(raw, min, max, step) : min;
  const [localValue, setLocalValue] = useState(safeValue);
  const draggingRef = useRef(false);

  const trackWidthRpx = useMemo(
    () => DESIGN_WIDTH_RPX - PAGE_PAD_RPX * 2 - CARD_PAD_RPX * 2,
    []
  );

  useEffect(() => {
    if (!draggingRef.current) setLocalValue(safeValue);
  }, [safeValue]);

  const onChange = (v: number) => {
    draggingRef.current = true;
    setLocalValue(clampStep(v, min, max, step));
  };

  const onAfterChange = (v: number) => {
    draggingRef.current = false;
    const next = clampStep(v, min, max, step);
    setLocalValue(next);
    actions.bath_flow_set.set(next);
  };

  return (
    <View className={`${styles.bubble} ${disabled ? styles.disabled : ''}`}>
      <View className={styles.tip} />
      <View className={styles.tipMask} />
      <View className={styles.head}>
        <Text className={styles.title}>{Strings.getLang('bath_flow_set')}</Text>
        <Text className={styles.value}>
          {Number.isFinite(localValue) ? localValue : '--'}
          {Strings.getLang('unit_liter')}
        </Text>
      </View>
      <View className={styles.sliderWrap}>
        <Slider
          disabled={!!disabled}
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={onChange}
          onAfterChange={onAfterChange}
          maxTrackWidth={`${trackWidthRpx}rpx`}
          maxTrackHeight="16rpx"
          maxTrackRadius="8rpx"
          maxTrackColor="#EAF1FE"
          minTrackHeight="16rpx"
          minTrackWidth="16rpx"
          minTrackRadius="8rpx"
          minTrackColor="#AEBFE7"
          thumbWidth="40rpx"
          thumbHeight="40rpx"
          thumbRadius="20rpx"
          thumbColor="#2F4573"
          thumbBorderStyle="solid"
          thumbBoxShadowStyle="0 0 0 4rpx #FFFFFF"
          isShowTicks={false}
        />
      </View>
    </View>
  );
}

export default BathFlowControl;
