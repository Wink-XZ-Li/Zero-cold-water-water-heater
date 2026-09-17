import assert from 'node:assert/strict';
import {
  sliderNeedsHighUnlock,
  shouldEnforceHighTempGate,
  tempPlusDelta,
} from '../src/utils/tempStep';

const heatingLocked = { heating: true, unlocked: false };
const heatingUnlocked = { heating: true, unlocked: true };
const idle = { heating: false, unlocked: false };

assert.equal(shouldEnforceHighTempGate('standby'), true);
assert.equal(shouldEnforceHighTempGate('bath_heating'), true);
assert.equal(shouldEnforceHighTempGate('zc_heating'), true);
assert.equal(shouldEnforceHighTempGate('off'), false);

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

assert.equal(sliderNeedsHighUnlock(50, heatingLocked), true);
assert.equal(sliderNeedsHighUnlock(49, heatingLocked), false);
assert.equal(sliderNeedsHighUnlock(50, idle), false, 'off does not gate the slider');
assert.equal(
  sliderNeedsHighUnlock(55, { heating: shouldEnforceHighTempGate('standby'), unlocked: false }),
  true,
  'standby slider ≥50 requires unlock'
);

console.log('tempStep tests passed');
