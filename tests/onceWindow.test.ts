import assert from 'node:assert/strict';
import dayjs from 'dayjs';
import { computeOnceWindow, formatOnceDateLabel } from '../src/utils/timer-group';

const now = (s: string) => dayjs(s);

assert.deepEqual(
  computeOnceWindow('06:00', '08:00', now('2026-08-18 05:00')),
  { startDate: '20260818', endDate: '20260818' },
  'before start → today'
);

assert.deepEqual(
  computeOnceWindow('06:00', '08:00', now('2026-08-18 06:00')),
  { startDate: '20260819', endDate: '20260819' },
  'at start → tomorrow'
);

assert.deepEqual(
  computeOnceWindow('06:00', '08:00', now('2026-08-18 07:00')),
  { startDate: '20260819', endDate: '20260819' },
  'inside window → tomorrow'
);

assert.deepEqual(
  computeOnceWindow('22:00', '06:00', now('2026-08-18 10:00')),
  { startDate: '20260818', endDate: '20260819' },
  'overnight before start → tonight into tomorrow'
);

assert.deepEqual(
  computeOnceWindow('22:00', '06:00', now('2026-08-18 23:00')),
  { startDate: '20260819', endDate: '20260820' },
  'overnight after start → next night'
);

assert.equal(formatOnceDateLabel('20260818', 'zh'), '8月18日');
assert.equal(formatOnceDateLabel('20270103', 'zh'), '2027年1月3日');

console.log('onceWindow tests passed');
