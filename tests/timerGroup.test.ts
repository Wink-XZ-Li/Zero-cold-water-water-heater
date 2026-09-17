import assert from 'node:assert/strict';
import dayjs from 'dayjs';
import type { CloudTimer } from '../src/api/timer';
import {
  DAILY_LOOPS,
  ONCE_LOOPS,
  WEEKDAY_LOOPS,
  groupEnabledFromStatus,
  isInGroupWindow,
  toTimerGroups,
  type TimerGroup,
} from '../src/utils/timer-group';

const now = (s: string) => dayjs(s);

function timer(partial: Partial<CloudTimer> & Pick<CloudTimer, 'timerId' | 'time' | 'dps'>): CloudTimer {
  return {
    loops: ONCE_LOOPS,
    aliasName: 'g1',
    isAppPush: false,
    status: true,
    ...partial,
  };
}

assert.equal(groupEnabledFromStatus(true, true, ONCE_LOOPS), true);
assert.equal(groupEnabledFromStatus(false, true, ONCE_LOOPS), true, 'once stays on after start consumed');
assert.equal(groupEnabledFromStatus(false, false, ONCE_LOOPS), false);
assert.equal(groupEnabledFromStatus(true, false, DAILY_LOOPS), false, 'repeating still needs both');
assert.equal(groupEnabledFromStatus(true, true, DAILY_LOOPS), true);

const oncePair = toTimerGroups([
  timer({
    timerId: 's',
    time: '10:00',
    date: '20260903',
    dps: { '104': true },
    status: false,
  }),
  timer({
    timerId: 'e',
    time: '11:00',
    date: '20260903',
    dps: { '104': false },
    status: true,
  }),
]);
assert.equal(oncePair.length, 1);
assert.equal(oncePair[0].orphan, false);
assert.equal(oncePair[0].missingStart, false);
assert.equal(oncePair[0].enabled, true, 'start status false + end armed → group on');

const endOnly = toTimerGroups([
  timer({
    timerId: 'e',
    time: '11:00',
    date: '20260903',
    dps: { '104': false },
    status: true,
  }),
]);
assert.equal(endOnly[0].orphan, false);
assert.equal(endOnly[0].missingStart, true);
assert.equal(endOnly[0].enabled, true);
assert.equal(endOnly[0].startTimerId, '');

const startOnly = toTimerGroups([
  timer({
    timerId: 's',
    time: '10:00',
    dps: { '104': true },
    status: true,
  }),
]);
assert.equal(startOnly[0].orphan, true);

function g(partial: Partial<TimerGroup>): TimerGroup {
  return {
    aliasName: 'g1',
    startTimerId: 's',
    endTimerId: 'e',
    startTime: '10:00',
    endTime: '11:00',
    date: '20260903',
    endDate: '20260903',
    loops: ONCE_LOOPS,
    isAppPush: false,
    enabled: true,
    orphan: false,
    missingStart: false,
    ...partial,
  };
}

assert.equal(isInGroupWindow(g({}), now('2026-09-03 10:30')), true);
assert.equal(isInGroupWindow(g({}), now('2026-09-03 09:59')), false);
assert.equal(isInGroupWindow(g({}), now('2026-09-03 11:00')), false);

assert.equal(
  isInGroupWindow(
    g({
      startTimerId: '',
      startTime: '',
      missingStart: true,
      date: '20260903',
      endDate: '20260903',
      endTime: '11:00',
    }),
    now('2026-09-03 10:30')
  ),
  true,
  'end-only once is in window until end'
);
assert.equal(
  isInGroupWindow(
    g({
      startTimerId: '',
      startTime: '',
      missingStart: true,
      date: '20260903',
      endDate: '20260903',
      endTime: '11:00',
    }),
    now('2026-09-03 11:00')
  ),
  false
);

assert.equal(
  isInGroupWindow(
    g({
      startTime: '22:00',
      endTime: '06:00',
      date: '20260903',
      endDate: '20260904',
    }),
    now('2026-09-03 23:00')
  ),
  true,
  'once overnight before midnight'
);
assert.equal(
  isInGroupWindow(
    g({
      startTime: '22:00',
      endTime: '06:00',
      date: '20260903',
      endDate: '20260904',
    }),
    now('2026-09-04 05:00')
  ),
  true
);
assert.equal(
  isInGroupWindow(
    g({
      startTime: '22:00',
      endTime: '06:00',
      date: '20260903',
      endDate: '20260904',
    }),
    now('2026-09-04 06:00')
  ),
  false
);

assert.equal(
  isInGroupWindow(g({ loops: DAILY_LOOPS, date: '', endDate: '' }), now('2026-09-03 10:30')),
  true
);
assert.equal(
  isInGroupWindow(
    g({ loops: DAILY_LOOPS, startTime: '22:00', endTime: '06:00', date: '', endDate: '' }),
    now('2026-09-03 23:00')
  ),
  true
);
assert.equal(
  isInGroupWindow(
    g({ loops: DAILY_LOOPS, startTime: '22:00', endTime: '06:00', date: '', endDate: '' }),
    now('2026-09-04 05:00')
  ),
  true
);

assert.equal(
  isInGroupWindow(
    g({ loops: WEEKDAY_LOOPS, date: '', endDate: '' }),
    now('2026-09-03 10:30')
  ),
  true,
  'Thu 2026-09-03 is a weekday'
);
assert.equal(
  isInGroupWindow(
    g({ loops: WEEKDAY_LOOPS, date: '', endDate: '' }),
    now('2026-09-06 10:30')
  ),
  false,
  'Sun is outside weekday loops'
);
assert.equal(
  isInGroupWindow(
    g({
      loops: WEEKDAY_LOOPS,
      startTime: '22:00',
      endTime: '06:00',
      date: '',
      endDate: '',
    }),
    now('2026-09-05 05:00')
  ),
  true,
  'Sat 05:00 belongs to Friday overnight window'
);

console.log('timerGroup tests passed');
