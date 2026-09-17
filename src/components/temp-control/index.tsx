import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image } from '@ray-js/ray';
import Slider from '@ray-js/components-ty-slider';
import { DialogInstance } from '@ray-js/smart-ui';
import { useProps, useActions } from '@ray-js/panel-sdk';
import { useTempSetGuard } from '@/hooks/useTempSetGuard';
import Strings from '@/i18n';
import { ICON_LIGHT, MinusGlyph, PlusGlyph, ShowerGlyph } from '@/components/panel-icons';
import {
  TEMP_FINE_STEP,
  TEMP_HIGH_GATE,
  shouldEnforceHighTempGate,
  quantizeTemp,
  sliderNeedsHighUnlock,
  tempMinusDelta,
  tempPlusDelta,
} from '@/utils/tempStep';
import headerBitePng from './header-bite.png';
import styles from './index.module.less';

type Props = {
  disabled?: boolean;
};

type UnlockGate = { unlocked: boolean; heating: boolean; enforceUnlockGate?: boolean };

/** 与 home content / 本卡 body / btn 尺寸对齐，供 ty-slider 使用绝对宽度（百分比重叠会塌） */
const PAGE_PAD_RPX = 32;
const BODY_PAD_RPX = 24;
const BTN_RPX = 56;
const BTN_GAP_RPX = 16;
const DESIGN_WIDTH_RPX = 750;
/** 加减连点合并下发，避免 DP 回推与本地意图打架导致跳温 */
const WRITE_DEBOUNCE_MS = 150;

/**
 * Bathroom temp card — Ardot 55:832
 * 「+」待机/加热从 49 调至 50℃ 需弹窗并落到 50；已在 50 未解锁再上调同样需解锁后到 55。
 * 滑条松手目标 ≥50℃ 仍弹窗，确认后落到松手刻度；解锁后可至上限。
 *
 * 交互约定：加减按点击次数累加意图（UI 立刻跟上，DP 150ms 防抖合并）；
 * 滑条拖动只做本地轻量预览，松手再量化吸附并下发。
 */
export function TempControl({ disabled }: Props) {
  const tempSetRaw = useProps(p => p.temp_set as number);
  const workState = useProps(p => p.work_state as string);
  const actions = useActions();
  const { min, max, toDisplay, prepareWrite } = useTempSetGuard();

  const heating = shouldEnforceHighTempGate(workState);
  const setDisplay = toDisplay(tempSetRaw);
  const safeValue = Number.isFinite(setDisplay) ? setDisplay : min;

  const [localValue, setLocalValue] = useState(safeValue);
  /** >50 视为已在高温区；=50 仍可能未解锁 */
  const [highUnlocked, setHighUnlocked] = useState(safeValue > TEMP_HIGH_GATE);
  const draggingRef = useRef(false);
  const dragStartRef = useRef(safeValue);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmingRef = useRef(false);
  /** 累加意图：连点加减读这个，不依赖异步 setState */
  const intentRef = useRef(safeValue);
  /** 已下发、等待设备回报的目标显示温度；非 null 时忽略过时 props 回推 */
  const pendingWriteRef = useRef<number | null>(null);
  /** 防抖待发出的 raw DP，避免提前 flush 时重新量化不一致 */
  const pendingRawRef = useRef<number | null>(null);
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const dragPreviewRef = useRef<number | null>(null);

  const unlockOpts = useMemo(() => ({ unlocked: highUnlocked, heating }), [highUnlocked, heating]);

  const trackWidthRpx = useMemo(
    () => DESIGN_WIDTH_RPX - PAGE_PAD_RPX * 2 - BODY_PAD_RPX * 2 - BTN_RPX * 2 - BTN_GAP_RPX * 2,
    []
  );

  const setIntentValue = (value: number) => {
    intentRef.current = value;
    setLocalValue(value);
  };

  useEffect(() => {
    if (draggingRef.current) return;
    if (pendingWriteRef.current != null) {
      if (safeValue === pendingWriteRef.current) {
        pendingWriteRef.current = null;
        setIntentValue(safeValue);
      }
      return;
    }
    setIntentValue(safeValue);
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
    pendingWriteRef.current = next.display;
    setIntentValue(next.display);
    actions.temp_set.set(next.raw);
  }, [min, max, safeValue, disabled, prepareWrite, actions]);

  useEffect(
    () => () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      if (dragRafRef.current != null) cancelAnimationFrame(dragRafRef.current);
    },
    []
  );

  const flushWrite = (raw: number) => {
    writeTimerRef.current = null;
    pendingRawRef.current = null;
    actions.temp_set.set(raw);
  };

  const commitValue = (
    value: number,
    opts?: { silent?: boolean; unlockOpts?: UnlockGate; debounce?: boolean }
  ) => {
    const gate: UnlockGate = opts?.unlockOpts ?? { ...unlockOpts, enforceUnlockGate: true };
    const snapped = quantizeTemp(value, min, max, gate);
    const next = prepareWrite(snapped, { silent: opts?.silent });
    if (!next.ok) return;

    setIntentValue(next.display);
    pendingWriteRef.current = next.display;
    pendingRawRef.current = next.raw;

    if (opts?.debounce) {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      writeTimerRef.current = setTimeout(() => flushWrite(next.raw), WRITE_DEBOUNCE_MS);
      return;
    }

    if (writeTimerRef.current) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
    flushWrite(next.raw);
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
    const current = intentRef.current;
    const result = tempPlusDelta(current, unlockOpts);
    if (result.kind === 'need_unlock') {
      const ok = await requestHighUnlock();
      if (!ok) return;
      commitValue(result.next, {
        silent: true,
        unlockOpts: { unlocked: true, heating, enforceUnlockGate: false },
      });
      return;
    }
    commitValue(current + result.delta, { debounce: true });
  };

  const onMinus = () => {
    if (disabled) return;
    commitValue(intentRef.current - tempMinusDelta(intentRef.current), { debounce: true });
  };

  const flushPendingWriteNow = () => {
    if (!writeTimerRef.current || pendingRawRef.current == null) return;
    clearTimeout(writeTimerRef.current);
    flushWrite(pendingRawRef.current);
  };

  const onSliderChange = (value: number) => {
    if (disabled) return;
    if (!draggingRef.current) {
      // 拖动开始前若有未发出的加减防抖，先刷下去，避免丢意图
      flushPendingWriteNow();
      dragStartRef.current = intentRef.current;
    }
    draggingRef.current = true;
    if (unlockTimer.current) clearTimeout(unlockTimer.current);

    // 拖动只钳范围，不做 5℃ 吸附；松手再量化。rAF 合并 setState 减轻卡顿。
    const clamped = Math.min(max, Math.max(min, value));
    intentRef.current = clamped;
    dragPreviewRef.current = clamped;
    if (dragRafRef.current == null) {
      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null;
        if (dragPreviewRef.current != null) {
          setLocalValue(dragPreviewRef.current);
        }
      });
    }
  };

  const onSliderAfterChange = async (value: number) => {
    if (disabled) return;
    if (dragRafRef.current != null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }

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
        setIntentValue(fallback);
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

  // 展示用整数：拖动预览可能带小数，标题仍读起来干净
  const displayValue = Number.isFinite(localValue) ? Math.round(localValue) : NaN;

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
          {Number.isFinite(displayValue) ? displayValue : '--'}
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
            step={TEMP_FINE_STEP}
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
            thumbWidth="56rpx"
            thumbHeight="56rpx"
            thumbRadius="28rpx"
            thumbColor="#2F4573"
            thumbBoxShadowStyle="0 0 0 6rpx #FFFFFF"
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
