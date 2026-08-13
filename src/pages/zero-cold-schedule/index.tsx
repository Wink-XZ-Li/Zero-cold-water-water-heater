import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  navigateBack,
  navigateTo,
  showToast,
  usePageEvent,
} from '@ray-js/ray';
import { NavBar, Dialog, DialogInstance } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import { ScheduleGroupItem } from '@/components/schedule-group-item';
import { useTimerGroups } from '@/hooks/useTimerGroups';
import type { TimerGroup } from '@/utils/timer-group';
import styles from './index.module.less';

export function ZeroColdSchedule() {
  const { groups, loading, error, refresh, setGroupEnabled, removeGroup } = useTimerGroups();
  const [busyAlias, setBusyAlias] = useState<string | null>(null);

  usePageEvent('onShow', () => {
    refresh();
  });

  const toastFail = (key: string) => {
    showToast({ title: Strings.getLang(key), icon: 'none' });
  };

  const onToggle = useCallback(
    async (group: TimerGroup, enabled: boolean) => {
      setBusyAlias(group.aliasName);
      try {
        await setGroupEnabled(group, enabled);
      } catch {
        toastFail('schedule_toggle_failed');
      } finally {
        setBusyAlias(null);
      }
    },
    [setGroupEnabled]
  );

  const confirmRemove = useCallback(
    async (group: TimerGroup) => {
      try {
        await DialogInstance.confirm({
          title: Strings.getLang('schedule_delete_title'),
          message: Strings.getLang('schedule_delete_message'),
          confirmButtonText: Strings.getLang('confirm'),
          cancelButtonText: Strings.getLang('cancel'),
        });
      } catch {
        return;
      }
      setBusyAlias(group.aliasName);
      try {
        await removeGroup(group);
      } catch {
        toastFail('schedule_delete_failed');
      } finally {
        setBusyAlias(null);
      }
    },
    [removeGroup]
  );

  const openCreate = () => {
    navigateTo({ url: '/pages/zero-cold-schedule-edit/index?mode=create' });
  };

  const openEdit = (group: TimerGroup) => {
    navigateTo({
      url: `/pages/zero-cold-schedule-edit/index?mode=edit&aliasName=${encodeURIComponent(
        group.aliasName
      )}`,
    });
  };

  return (
    <View className={styles.page}>
      <NavBar
        title={Strings.getLang('schedule_list_title')}
        leftArrow
        onClickLeft={() => navigateBack()}
      />
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className={styles.scroll}
        style={{ flex: 1, height: '100%' }}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={() => {
          refresh();
        }}
      >
        <View className={styles.content}>
          {error && !groups.length ? (
            <Text className={styles.empty}>{Strings.getLang('schedule_load_failed')}</Text>
          ) : null}
          {!loading && !error && groups.length === 0 ? (
            <Text className={styles.empty}>{Strings.getLang('schedule_empty')}</Text>
          ) : null}
          {groups.map(group => (
            <ScheduleGroupItem
              key={group.aliasName}
              group={group}
              toggling={busyAlias === group.aliasName}
              onToggle={enabled => onToggle(group, enabled)}
              onPress={() => openEdit(group)}
              onDelete={() => confirmRemove(group)}
              onCleanup={() => confirmRemove(group)}
            />
          ))}
        </View>
      </ScrollView>
      <View className={styles.fab} onClick={openCreate}>
        <Text className={styles.fabText}>+</Text>
      </View>
      <Dialog id="smart-dialog" />
    </View>
  );
}

export default ZeroColdSchedule;
