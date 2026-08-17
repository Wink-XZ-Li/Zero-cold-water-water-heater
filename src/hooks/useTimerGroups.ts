import { useCallback, useEffect, useState } from 'react';
import { useDevice } from '@ray-js/panel-sdk';
import {
  addDeviceTimer,
  removeDeviceTimer,
  syncTimers,
  updateDeviceTimer,
  updateDeviceTimerStatus,
  type CloudTimer,
} from '@/api/timer';
import {
  TIMER_CATEGORY,
  buildZcDps,
  computeOnceWindow,
  createAliasName,
  isOnceLoops,
  isValidLoops,
  isValidTimeRange,
  normalizeTime,
  toTimerGroups,
  type TimerGroup,
} from '@/utils/timer-group';

export type ScheduleFormValue = {
  startTime: string;
  endTime: string;
  loops: string;
  isAppPush: boolean;
};

export type RefreshOptions = {
  /** Skip the list loading flag so ScrollView pull-refresh does not animate. */
  silent?: boolean;
};

export function useTimerGroups() {
  const deviceId = useDevice(d => d.devInfo?.devId || '') as string;
  const [timers, setTimers] = useState<CloudTimer[]>([]);
  const [groups, setGroups] = useState<TimerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (opts?: RefreshOptions) => {
      if (!deviceId) {
        setLoading(false);
        setError('missing_device');
        return [];
      }
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const list = await syncTimers(deviceId, TIMER_CATEGORY);
        setTimers(list);
        const next = toTimerGroups(list);
        setGroups(next);
        return next;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'sync_failed';
        setError(msg);
        return [];
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [deviceId]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setGroupEnabled = useCallback(
    async (group: TimerGroup, enabled: boolean) => {
      if (!deviceId || group.orphan || !group.startTimerId || !group.endTimerId) {
        throw new Error('invalid_group');
      }
      if (enabled && isOnceLoops(group.loops)) {
        const { startDate, endDate } = computeOnceWindow(group.startTime, group.endTime);
        await updateDeviceTimer(deviceId, {
          timerId: group.startTimerId,
          time: group.startTime,
          loops: group.loops,
          dps: buildZcDps(true),
          aliasName: group.aliasName,
          isAppPush: group.isAppPush,
          date: startDate,
        });
        try {
          await updateDeviceTimer(deviceId, {
            timerId: group.endTimerId,
            time: group.endTime,
            loops: group.loops,
            dps: buildZcDps(false),
            aliasName: group.aliasName,
            isAppPush: group.isAppPush,
            date: endDate,
          });
        } catch (e) {
          await refresh({ silent: true });
          throw e;
        }
      }
      await updateDeviceTimerStatus(deviceId, group.startTimerId, enabled);
      try {
        await updateDeviceTimerStatus(deviceId, group.endTimerId, enabled);
      } catch (e) {
        try {
          await updateDeviceTimerStatus(deviceId, group.startTimerId, group.enabled);
        } catch {
          // refresh will reconcile
        }
        await refresh({ silent: true });
        throw e;
      }
      await refresh({ silent: true });
    },
    [deviceId, refresh]
  );

  const createGroup = useCallback(
    async (form: ScheduleFormValue) => {
      if (!deviceId) throw new Error('missing_device');
      const startTime = normalizeTime(form.startTime);
      const endTime = normalizeTime(form.endTime);
      if (!isValidLoops(form.loops)) throw new Error('invalid_loops');
      if (!isValidTimeRange(startTime, endTime)) throw new Error('invalid_time_range');

      const aliasName = createAliasName();
      const once = isOnceLoops(form.loops);
      const window = once ? computeOnceWindow(startTime, endTime) : null;
      const startId = await addDeviceTimer(deviceId, {
        time: startTime,
        loops: form.loops,
        dps: buildZcDps(true),
        aliasName,
        isAppPush: form.isAppPush,
        ...(window ? { date: window.startDate } : {}),
      });
      try {
        await addDeviceTimer(deviceId, {
          time: endTime,
          loops: form.loops,
          dps: buildZcDps(false),
          aliasName,
          isAppPush: form.isAppPush,
          ...(window ? { date: window.endDate } : {}),
        });
      } catch (e) {
        try {
          await removeDeviceTimer(deviceId, startId);
        } catch {
          // ignore rollback secondary failure
        }
        await refresh({ silent: true });
        throw e;
      }
      await refresh({ silent: true });
      return aliasName;
    },
    [deviceId, refresh]
  );

  const updateGroup = useCallback(
    async (group: TimerGroup, form: ScheduleFormValue) => {
      if (!deviceId || group.orphan) throw new Error('invalid_group');
      const startTime = normalizeTime(form.startTime);
      const endTime = normalizeTime(form.endTime);
      if (!isValidLoops(form.loops)) throw new Error('invalid_loops');
      if (!isValidTimeRange(startTime, endTime)) throw new Error('invalid_time_range');

      const once = isOnceLoops(form.loops);
      const window = once ? computeOnceWindow(startTime, endTime) : null;
      await updateDeviceTimer(deviceId, {
        timerId: group.startTimerId,
        time: startTime,
        loops: form.loops,
        dps: buildZcDps(true),
        aliasName: group.aliasName,
        isAppPush: form.isAppPush,
        ...(window ? { date: window.startDate } : {}),
      });
      try {
        await updateDeviceTimer(deviceId, {
          timerId: group.endTimerId,
          time: endTime,
          loops: form.loops,
          dps: buildZcDps(false),
          aliasName: group.aliasName,
          isAppPush: form.isAppPush,
          ...(window ? { date: window.endDate } : {}),
        });
      } catch (e) {
        await refresh({ silent: true });
        throw e;
      }
      await refresh({ silent: true });
    },
    [deviceId, refresh]
  );

  const removeGroup = useCallback(
    async (group: TimerGroup) => {
      if (!deviceId) throw new Error('missing_device');
      const ids = [group.startTimerId, group.endTimerId].filter(Boolean);
      const related = timers.filter(t => t.aliasName === group.aliasName).map(t => t.timerId);
      const unique = Array.from(new Set([...ids, ...related]));
      const results = await Promise.allSettled(unique.map(id => removeDeviceTimer(deviceId, id)));
      await refresh({ silent: true });
      if (results.some(r => r.status === 'rejected')) {
        throw new Error('remove_partial');
      }
    },
    [deviceId, refresh, timers]
  );

  return {
    deviceId,
    timers,
    groups,
    loading,
    error,
    refresh,
    setGroupEnabled,
    createGroup,
    updateGroup,
    removeGroup,
  };
}
