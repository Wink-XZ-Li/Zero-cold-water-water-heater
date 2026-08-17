import assert from 'node:assert/strict';
import { tempPlusDelta } from '../src/utils/tempStep';

const heatingLocked = { heating: true, unlocked: false };
const heatingUnlocked = { heating: true, unlocked: true };
const idle = { heating: false, unlocked: false };

assert.deepEqual(
  tempPlusDelta(49, heatingLocked),
  { kind: 'need_unlock', next: 50 },
  'heating 49→50 requires unlock and lands at 50'
);

assert.deepEqual(
  tempPlusDelta(50, heatingLocked),
  { kind: 'need_unlock', next: 55 },
  'heating already at 50 requires unlock and goes to 55'
);

assert.deepEqual(tempPlusDelta(48, heatingLocked), { kind: 'step', delta: 1 });
assert.deepEqual(tempPlusDelta(50, heatingUnlocked), { kind: 'step', delta: 5 });
assert.deepEqual(tempPlusDelta(49, idle), { kind: 'step', delta: 1 });
assert.deepEqual(tempPlusDelta(50, idle), { kind: 'step', delta: 5 });

console.log('tempStep tests passed');
