import { syncTimerTask, addTimer, updateTimer, updateTimerStatus, removeTimer } from '@ray-js/ray';
import { TIMER_CATEGORY } from '@/utils/timer-group';

export type TimerDps = Record<string, boolean | number | string>;

export type CloudTimer = {
  timerId: string;
  time: string;
  loops: string;
  dps: TimerDps;
  aliasName: string;
  isAppPush: boolean;
  status: boolean;
  date?: string;
  timezoneId?: string;
  id?: string;
};

export function syncTimers(deviceId: string, category = TIMER_CATEGORY): Promise<CloudTimer[]> {
  return new Promise((resolve, reject) => {
    syncTimerTask({
      deviceId,
      category,
      success: res => {
        resolve((res?.timers || []) as CloudTimer[]);
      },
      fail: err => reject(new Error(err?.errorMsg || String(err?.errorCode ?? 'sync_failed'))),
    });
  });
}

export type AddTimerPayload = {
  time: string;
  loops: string;
  dps: TimerDps;
  aliasName: string;
  isAppPush?: boolean;
  date?: string;
};

export function addDeviceTimer(
  deviceId: string,
  timer: AddTimerPayload,
  category = TIMER_CATEGORY
): Promise<string> {
  return new Promise((resolve, reject) => {
    addTimer({
      deviceId,
      category,
      timer: {
        time: timer.time,
        loops: timer.loops,
        dps: timer.dps,
        aliasName: timer.aliasName,
        isAppPush: timer.isAppPush ?? false,
        ...(timer.date ? { date: timer.date } : {}),
      } as Parameters<typeof addTimer>[0]['timer'],
      success: res => resolve(res.timerId),
      fail: err => reject(new Error(err?.errorMsg || String(err?.errorCode ?? 'add_failed'))),
    });
  });
}

export type UpdateTimerPayload = {
  timerId: string;
  time: string;
  loops: string;
  dps: TimerDps;
  aliasName: string;
  isAppPush?: boolean;
  date?: string;
};

export function updateDeviceTimer(deviceId: string, timer: UpdateTimerPayload): Promise<void> {
  return new Promise((resolve, reject) => {
    updateTimer({
      deviceId,
      timer: {
        timerId: timer.timerId,
        time: timer.time,
        loops: timer.loops,
        dps: timer.dps,
        aliasName: timer.aliasName,
        isAppPush: timer.isAppPush ?? false,
        ...(timer.date ? { date: timer.date } : {}),
      } as Parameters<typeof updateTimer>[0]['timer'],
      success: () => resolve(),
      fail: err => reject(new Error(err?.errorMsg || String(err?.errorCode ?? 'update_failed'))),
    });
  });
}

export function updateDeviceTimerStatus(
  deviceId: string,
  timerId: string,
  status: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    updateTimerStatus({
      deviceId,
      timerId,
      status,
      success: () => resolve(),
      fail: err => reject(new Error(err?.errorMsg || String(err?.errorCode ?? 'status_failed'))),
    });
  });
}

export function removeDeviceTimer(deviceId: string, timerId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    removeTimer({
      deviceId,
      timerId,
      success: () => resolve(),
      fail: err => reject(new Error(err?.errorMsg || String(err?.errorCode ?? 'remove_failed'))),
    });
  });
}
