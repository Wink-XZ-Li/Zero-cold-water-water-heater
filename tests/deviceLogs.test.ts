import assert from 'node:assert/strict';
import {
  formatDpLabels,
  mergeLogItems,
  parseDpIds,
  splitLogDpIdQueries,
} from '../src/utils/deviceLogs';

assert.deepEqual(parseDpIds(109), [109]);
assert.deepEqual(parseDpIds('109'), [109]);
assert.deepEqual(parseDpIds('101, 109'), [101, 109], 'combined status-log dpId must keep 109');
assert.deepEqual(parseDpIds('101,102,109,15'), [101, 102, 109, 15]);

assert.deepEqual(
  splitLogDpIdQueries('101,102,109,15'),
  ['101,102,15', '109'],
  '109 must be queried alone in the zero-cold tab'
);
assert.deepEqual(splitLogDpIdQueries('109'), ['109']);
assert.deepEqual(splitLogDpIdQueries('101,102,15'), ['101,102,15']);

const meta = {
  101: { label: '101-单次零冷水' },
  109: { label: '109-点动单次零冷水' },
};
assert.equal(formatDpLabels('101, 109', meta), '101-单次零冷水 / 109-点动单次零冷水');
assert.equal(formatDpLabels(109, meta), '109-点动单次零冷水');

const merged = mergeLogItems([
  [{ timeStamp: 100, dpId: 101, value: 'true' }],
  [{ timeStamp: 200, dpId: 109, value: 'true' }],
  [{ timeStamp: 200, dpId: 109, value: 'true' }],
]);
assert.deepEqual(
  merged.map(i => i.dpId),
  [109, 101],
  'newer 109 stays on top and duplicates drop'
);

console.log('deviceLogs tests passed');
