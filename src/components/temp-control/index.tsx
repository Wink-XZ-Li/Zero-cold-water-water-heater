import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image } from '@ray-js/ray';
import Slider from '@ray-js/components-ty-slider';
import { DialogInstance } from '@ray-js/smart-ui';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { useTempSetGuard } from '@/hooks/useTempSetGuard';
import Strings from '@/i18n';
import { ICON_LIGHT, MinusGlyph, PlusGlyph, ShowerGlyph } from '@/components/panel-icons';
import {
  TEMP_HIGH_GATE,
  isHeatingWorkState,
  quantizeTemp,
  sliderNeedsHighUnlock,
  tempMinusDelta,
  tempPlusDelta,
  tempSliderStep,
} from '@/utils/tempStep';
import headerBitePng from './header-bite.png';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

type UnlockGate = { unlocked: boolean; heating: boolean; enforceUnlockGate?: boolean };

/** 与 home content / 本卡 body / ± 尺寸对齐，供 ty-slider 使用绝对宽度（百分比重叠会塌） */
const PAGE_PAD_RPX = 32;
const BODY_PAD_RPX = 24;
const BTN_RPX = 56;
const BTN_GAP_RPX = 16;
const DESIGN_WIDTH_RPX = 750;

/**
 * Bathroom temp card — Ardot 55:832
 * 「+」加热态从 49 调至 50℃ 需弹窗并落到 50；已在 50 未解锁再上调同样需解锁后到 55。
 * 滑条松手目标 ≥50℃ 仍弹窗，确认后落到松手刻度；解锁后可至上限。
 */
export function TempControl({ disabled }: Props) {
  const tempSetRaw = useProps(p => p.temp_set as number);
  const workState = useProps(p => p.work_state as string);
  const actions = useActions();
  const { min, max, toDisplay, prepareWrite } = useTempSetGuard();

  const heating = isHeatingWorkState(workState);
  const setDisplay = toDisplay(tempSetRaw);
  const safeValue = Number.isFinite(setDisplay) ? setDisplay : min;

  const [localValue, setLocalValue] = useState(safeValue);
  /** >50 视为已在高温区；=50 仍可能未解锁 */
  const [highUnlocked, setHighUnlocked] = useState(safeValue > TEMP_HIGH_GATE);
  const draggingRef = useRef(false);
  const dragStartRef = useRef(safeValue);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmingRef = useRef(false);

  const unlockOpts = useMemo(() => ({ unlocked: highUnlocked, heating }), [highUnlocked, heating]);

  const sliderStep = tempSliderStep(localValue);

  const trackWidthRpx = useMemo(
    () => DESIGN_WIDTH_RPX - PAGE_PAD_RPX * 2 - BODY_PAD_RPX * 2 - BTN_RPX * 2 - BTN_GAP_RPX * 2,
    []
  );

  useEffect(() => {
    if (!draggingRef.current) {
      setLocalValue(safeValue);
    }
  }, [safeValue]);

  useEffect(() => {
    if (safeValue > TEMP_HIGH_GATE) {
      setHighUnlocked(true);
    } else if (safeValue < TEMP_HIGH_GATE) {
      setHighUnlocked(false);
    }
  }, [safeValue]);

  // 切到厨宝等窄范围模式时，超限设定温静默钳回并下发
  useEffect(() => {
    if (disabled || draggingRef.current) return;
    if (!Number.isFinite(safeValue)) return;
    if (safeValue >= min && safeValue <= max) return;
    const next = prepareWrite(safeValue, { silent: true });
    if (!next.ok || !next.clamped) return;
    setLocalValue(next.display);
    actions.temp_set.set(next.raw);
  }, [min, max, safeValue, disabled, prepareWrite, actions]);

  useEffect(
    () => () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
    },
    []
  );

  const commitValue = (value: number, opts?: { silent?: boolean; unlockOpts?: UnlockGate }) => {
    const gate: UnlockGate = opts?.unlockOpts ?? { ...unlockOpts, enforceUnlockGate: true };
    const snapped = quantizeTemp(value, min, max, gate);
    const next = prepareWrite(snapped, { silent: opts?.silent });
    if (!next.ok) return;
    setLocalValue(next.display);
    actions.temp_set.set(next.raw);
  };

  const requestHighUnlock = async (): Promise<boolean> => {
    if (confirmingRef.current) return false;
    confirmingRef.current = true;
    try {
      await DialogInstance.confirm({
        title: Strings.getLang('temp_high_unlock_title'),
        message: Strings.getLang('temp_high_unlock_message'),
        confirmButtonText: Strings.getLang('confirm'),
        cancelButtonText: Strings.getLang('cancel'),
      });
      setHighUnlocked(true);
      return true;
    } catch {
      return false;
    } finally {
      confirmingRef.current = false;
    }
  };

  const finishDrag = () => {
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    unlockTimer.current = setTimeout(() => {
      draggingRef.current = false;
    }, 500);
  };

  const onPlus = async () => {
    if (disabled) return;
    const result = tempPlusDelta(localValue, unlockOpts);
    if (result.kind === 'need_unlock') {
      const ok = await requestHighUnlock();
      if (!ok) return;
      commitValue(result.next, {
        silent: true,
        unlockOpts: { unlocked: true, heating, enforceUnlockGate: false },
      });
      return;
    }
    commitValue(localValue + result.delta);
  };

  const onMinus = () => {
    if (disabled) return;
    commitValue(localValue - tempMinusDelta(localValue));
  };

  const onSliderChange = (value: number) => {
    if (disabled) return;
    if (!draggingRef.current) {
      dragStartRef.current = localValue;
    }
    draggingRef.current = true;
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    // 拖动中允许预览到高温区；松手再决定是否弹窗
    setLocalValue(
      quantizeTemp(value, min, max, {
        unlocked: true,
        heating,
        enforceUnlockGate: false,
      })
    );
  };

  const onSliderAfterChange = async (value: number) => {
    if (disabled) return;
    const snapped = quantizeTemp(value, min, max, {
      unlocked: true,
      heating,
      enforceUnlockGate: false,
    });

    if (sliderNeedsHighUnlock(snapped, unlockOpts)) {
      const ok = await requestHighUnlock();
      if (!ok) {
        const fallback = quantizeTemp(dragStartRef.current, min, max, {
          ...unlockOpts,
          enforceUnlockGate: true,
        });
        setLocalValue(fallback);
        commitValue(fallback, { silent: true });
        finishDrag();
        return;
      }
      commitValue(snapped, {
        silent: true,
        unlockOpts: { unlocked: true, heating, enforceUnlockGate: false },
      });
      finishDrag();
      return;
    }

    commitValue(snapped, {
      unlockOpts: { ...unlockOpts, enforceUnlockGate: false },
    });
    finishDrag();
  };

  return (
    <View className={`${styles.wrap} ${disabled ? styles.disabled : ''}`}>
      <View className={styles.header}>
        <View className={styles.headerBite}>
          <Image className={styles.headerBiteImg} src={headerBitePng} mode="scaleToFill" />
        </View>
        <View className={styles.headerBarRest} />
        <View className={styles.iconWrap}>
          <View className={styles.iconGlyph}>
            <ShowerGlyph fill={ICON_LIGHT} size={12} />
          </View>
        </View>
        <Text className={styles.headerTitle}>{Strings.getLang('bath_temp_set')}</Text>
        <Text className={styles.headerValue}>
          {Number.isFinite(localValue) ? localValue : '--'}
          {Strings.getLang('unit_celsius')}
        </Text>
      </View>
      <View className={styles.panel}>
        <View className={styles.body}>
          <View
            className={`${styles.btn} ${disabled ? styles.btnDisabled : ''}`}
            style={{ marginRight: `${BTN_GAP_RPX}rpx` }}
            hoverClassName={disabled ? undefined : styles.btnHover}
            hoverStartTime={10}
            hoverStayTime={60}
            onClick={onMinus}
          >
            <MinusGlyph fill={ICON_LIGHT} size={12} />
          </View>
          <Slider
            disabled={!!disabled}
            min={min}
            max={max}
            step={sliderStep}
            value={localValue}
            onChange={onSliderChange}
            onAfterChange={onSliderAfterChange}
            maxTrackWidth={`${trackWidthRpx}rpx`}
            maxTrackHeight="48rpx"
            maxTrackRadius="24rpx"
            maxTrackColor="#EAF1FE"
            minTrackHeight="48rpx"
            minTrackWidth="48rpx"
            minTrackRadius="24rpx"
            minTrackColor="#AEBFE7"
            thumbWidth="48rpx"
            thumbHeight="48rpx"
            thumbRadius="24rpx"
            thumbColor="#2F4573"
            thumbBorderStyle="solid"
            thumbBoxShadowStyle="0 0 0 4rpx #FFFFFF"
            isShowTicks={false}
          />
          <View
            className={`${styles.btn} ${disabled ? styles.btnDisabled : ''}`}
            style={{ marginLeft: `${BTN_GAP_RPX}rpx` }}
            hoverClassName={disabled ? undefined : styles.btnHover}
            hoverStartTime={10}
            hoverStayTime={60}
            onClick={onPlus}
          >
            <PlusGlyph fill={ICON_LIGHT} size={12} />
          </View>
        </View>
        <View className={styles.rangeRow}>
          <Text className={styles.rangeText}>
            {min}
            {Strings.getLang('unit_celsius')}
          </Text>
          <Text className={styles.rangeText}>
            {max}
            {Strings.getLang('unit_celsius')}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default TempControl;
