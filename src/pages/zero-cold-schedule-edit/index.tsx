import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, navigateBack, showToast, useQuery } from '@ray-js/ray';
import { NavBar, Switch, Popup, DatetimePicker } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import { useTimerGroups } from '@/hooks/useTimerGroups';
import {
  isValidLoops,
  isValidTimeRange,
  loopsFromSelected,
  normalizeTime,
  selectedFromLoops,
} from '@/utils/timer-group';
import styles from './index.module.less';

type PickerTarget = 'start' | 'end' | null;

function asTimeString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && /^\d{1,2}:\d{2}$/.test(value)) {
    return normalizeTime(value);
  }
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(
      2,
      '0'
    )}`;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return normalizeTime(fallback);
}

export function ZeroColdScheduleEdit() {
  const query = useQuery() as { mode?: string; aliasName?: string };
  const mode = query?.mode === 'edit' ? 'edit' : 'create';
  const aliasName = query?.aliasName ? decodeURIComponent(String(query.aliasName)) : '';
  const { groups, loading, createGroup, updateGroup, refresh } = useTimerGroups();

  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('08:00');
  const [selected, setSelected] = useState<boolean[]>([false, true, true, true, true, true, false]);
  const [isAppPush, setIsAppPush] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [pickerValue, setPickerValue] = useState('06:00');
  const [hydrated, setHydrated] = useState(mode === 'create');

  const dayLabels = [
    Strings.getLang('schedule_day_sun'),
    Strings.getLang('schedule_day_mon'),
    Strings.getLang('schedule_day_tue'),
    Strings.getLang('schedule_day_wed'),
    Strings.getLang('schedule_day_thu'),
    Strings.getLang('schedule_day_fri'),
    Strings.getLang('schedule_day_sat'),
  ];

  useEffect(() => {
    if (mode !== 'edit' || !aliasName) {
      setHydrated(true);
      return;
    }
    const group = groups.find(g => g.aliasName === aliasName && !g.orphan);
    if (group) {
      setStartTime(group.startTime);
      setEndTime(group.endTime);
      setSelected(selectedFromLoops(group.loops));
      setIsAppPush(!!group.isAppPush);
      setHydrated(true);
      return;
    }
    if (!loading) {
      refresh().then(list => {
        const found = list.find(g => g.aliasName === aliasName && !g.orphan);
        if (found) {
          setStartTime(found.startTime);
          setEndTime(found.endTime);
          setSelected(selectedFromLoops(found.loops));
          setIsAppPush(!!found.isAppPush);
        }
        setHydrated(true);
      });
    }
  }, [mode, aliasName, groups, loading, refresh]);

  const openPicker = (target: 'start' | 'end') => {
    setPickerValue(target === 'start' ? startTime : endTime);
    setPicker(target);
  };

  const applyPicker = (raw: unknown) => {
    const next = asTimeString(raw, pickerValue);
    if (picker === 'start') setStartTime(next);
    if (picker === 'end') setEndTime(next);
    setPicker(null);
  };

  const toggleDay = (index: number) => {
    setSelected(prev => prev.map((v, i) => (i === index ? !v : v)));
  };

  const onSave = async () => {
    const loops = loopsFromSelected(selected);
    if (!isValidLoops(loops)) {
      showToast({ title: Strings.getLang('schedule_invalid_loops'), icon: 'none' });
      return;
    }
    if (!isValidTimeRange(startTime, endTime)) {
      showToast({ title: Strings.getLang('schedule_invalid_time'), icon: 'none' });
      return;
    }

    setSaving(true);
    try {
      if (mode === 'edit') {
        const group = groups.find(g => g.aliasName === aliasName && !g.orphan);
        if (!group) throw new Error('missing_group');
        await updateGroup(group, { startTime, endTime, loops, isAppPush });
      } else {
        await createGroup({ startTime, endTime, loops, isAppPush });
      }
      navigateBack();
    } catch {
      showToast({ title: Strings.getLang('schedule_save_failed'), icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const title =
    mode === 'edit'
      ? Strings.getLang('schedule_edit_title')
      : Strings.getLang('schedule_edit_create_title');

  return (
    <View className={styles.page}>
      <NavBar
        title={title}
        leftText={Strings.getLang('cancel')}
        rightText={saving ? '...' : Strings.getLang('save')}
        onClickLeft={() => navigateBack()}
        onClickRight={() => {
          if (!saving && hydrated) onSave();
        }}
      />
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className={styles.scroll}
        style={{ flex: 1, height: '100%' }}
      >
        <View className={styles.content}>
          <Text className={styles.sectionTitle}>{Strings.getLang('schedule_repeat')}</Text>
          <View className={styles.card}>
            <View className={styles.days}>
              {dayLabels.map((label, index) => {
                const on = selected[index];
                return (
                  <View
                    key={label}
                    className={`${styles.day} ${on ? styles.dayOn : ''}`}
                    onClick={() => toggleDay(index)}
                  >
                    <Text className={`${styles.dayText} ${on ? styles.dayTextOn : ''}`}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View className={styles.card}>
            <View className={styles.row} onClick={() => openPicker('start')}>
              <Text className={styles.label}>{Strings.getLang('schedule_start_time')}</Text>
              <Text className={styles.value}>{startTime}</Text>
            </View>
            <View className={styles.row} onClick={() => openPicker('end')}>
              <Text className={styles.label}>{Strings.getLang('schedule_end_time')}</Text>
              <Text className={styles.value}>{endTime}</Text>
            </View>
          </View>

          <View className={styles.card}>
            <View className={styles.row}>
              <Text className={styles.label}>{Strings.getLang('schedule_notify')}</Text>
              <Switch
                checked={isAppPush}
                activeColor="var(--index-accent)"
                onChange={(event: { detail?: boolean } | boolean) => {
                  const checked = typeof event === 'boolean' ? event : !!event?.detail;
                  setIsAppPush(checked);
                }}
              />
            </View>
            <Text className={styles.hint}>{Strings.getLang('schedule_notify_hint')}</Text>
          </View>
        </View>
      </ScrollView>

      <Popup show={!!picker} position="bottom" round onClose={() => setPicker(null)}>
        <View className={styles.pickerPanel}>
          <DatetimePicker
            type="time"
            value={pickerValue}
            showToolbar
            title={
              picker === 'end'
                ? Strings.getLang('schedule_end_time')
                : Strings.getLang('schedule_start_time')
            }
            confirmButtonText={Strings.getLang('confirm')}
            cancelButtonText={Strings.getLang('cancel')}
            onInput={(e: { detail?: string | number | Date }) => {
              setPickerValue(asTimeString(e?.detail, pickerValue));
            }}
            onConfirm={(e: { detail?: string | number | Date }) => {
              applyPicker(e?.detail ?? pickerValue);
            }}
            onCancel={() => setPicker(null)}
          />
        </View>
      </Popup>
    </View>
  );
}

export default ZeroColdScheduleEdit;
