import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  navigateBack,
  navigateTo,
  showToast,
  usePageEvent,
} from '@ray-js/ray';
import { NavBar, Dialog, DialogInstance, Popup } from '@ray-js/smart-ui';
import Strings from '@/i18n';
import { ScheduleGroupItem } from '@/components/schedule-group-item';
import { useTimerGroups } from '@/hooks/useTimerGroups';
import {
  isZcAlwaysOn,
  validateTimerConsistency,
  type TimerConsistencyReport,
  type TimerGroup,
} from '@/utils/timer-group';
import styles from './index.module.less';

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function issueClass(level: string): string {
  if (level === 'error') return styles.debugIssueError;
  if (level === 'warn') return styles.debugIssueWarn;
  return '';
}

export function ZeroColdSchedule() {
  const { timers, groups, loading, error, refresh, setGroupEnabled, removeGroup } =
    useTimerGroups();
  const [busyAlias, setBusyAlias] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugBusy, setDebugBusy] = useState(false);
  const [report, setReport] = useState<TimerConsistencyReport | null>(null);

  usePageEvent('onShow', () => {
    refresh();
  });

  const toastFail = (key: string) => {
    showToast({ title: Strings.getLang(key), icon: 'none' });
  };

  const openDebug = useCallback(async () => {
    setDebugOpen(true);
    setDebugBusy(true);
    try {
      await refresh();
    } finally {
      setDebugBusy(false);
    }
  }, [refresh]);

  const resyncDebug = useCallback(async () => {
    setDebugBusy(true);
    try {
      await refresh();
    } finally {
      setDebugBusy(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (!debugOpen) return;
    setReport(validateTimerConsistency(timers));
  }, [debugOpen, timers]);

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
          <View className={styles.debugEntry} onClick={openDebug}>
            <Text className={styles.debugEntryText}>{Strings.getLang('schedule_debug')}</Text>
          </View>
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

      <Popup
        show={debugOpen}
        position="bottom"
        round
        closeable
        onClose={() => setDebugOpen(false)}
        customStyle={{ height: '78%' }}
      >
        <View className={styles.debugPanel}>
          <Text className={styles.debugTitle}>{Strings.getLang('schedule_debug_title')}</Text>
          <View className={styles.debugToolbar}>
            <Text className={styles.debugAction} onClick={resyncDebug}>
              {debugBusy ? '...' : Strings.getLang('schedule_debug_refresh')}
            </Text>
            <Text className={styles.debugAction} onClick={() => setDebugOpen(false)}>
              {Strings.getLang('schedule_debug_close')}
            </Text>
          </View>
          <ScrollView scrollY enhanced showScrollbar className={styles.debugScroll}>
            {report ? (
              <View className={styles.debugBody}>
                <Text className={styles.debugSection}>
                  {Strings.getLang('schedule_debug_summary')}
                </Text>
                <Text
                  className={`${styles.debugBadge} ${
                    report.ok ? styles.debugBadgeOk : styles.debugBadgeFail
                  }`}
                >
                  {report.ok
                    ? Strings.getLang('schedule_debug_ok')
                    : Strings.getLang('schedule_debug_fail')}
                </Text>
                <Text className={styles.debugMono}>
                  {`timers=${report.timerCount}\ngroups=${report.groupCount}\ncomplete=${report.completeCount}\norphan=${report.orphanCount}\nuiGroups=${groups.length}`}
                </Text>

                <Text className={styles.debugSection}>
                  {Strings.getLang('schedule_debug_issues')}
                </Text>
                {report.issues.length === 0 ? (
                  <Text className={styles.debugMono}>
                    {Strings.getLang('schedule_debug_empty_issues')}
                  </Text>
                ) : (
                  report.issues.map((issue, idx) => (
                    <Text
                      key={`${issue.code}-${issue.timerId || issue.aliasName || idx}`}
                      className={`${styles.debugIssue} ${issueClass(issue.level)}`}
                    >
                      {`[${issue.level}] ${issue.code}: ${issue.message}${
                        issue.aliasName ? `\nalias=${issue.aliasName}` : ''
                      }${issue.timerId ? `\ntimerId=${issue.timerId}` : ''}`}
                    </Text>
                  ))
                )}

                <Text className={styles.debugSection}>
                  {Strings.getLang('schedule_debug_groups')}
                </Text>
                <Text className={styles.debugMono}>{safeJson(report.groups)}</Text>

                <Text className={styles.debugSection}>{Strings.getLang('schedule_debug_raw')}</Text>
                {timers.length === 0 ? (
                  <Text className={styles.debugMono}>[]</Text>
                ) : (
                  timers.map(t => (
                    <Text key={t.timerId} className={styles.debugMono}>
                      {safeJson({
                        timerId: t.timerId,
                        aliasName: t.aliasName,
                        time: t.time,
                        loops: t.loops,
                        status: t.status,
                        isAppPush: t.isAppPush,
                        role: isZcAlwaysOn(t.dps) ? 'start(104=true)' : 'end(104=false)',
                        dps: t.dps,
                      })}
                    </Text>
                  ))
                )}
              </View>
            ) : (
              <Text className={styles.debugMono}>...</Text>
            )}
          </ScrollView>
        </View>
      </Popup>
    </View>
  );
}

export default ZeroColdSchedule;
