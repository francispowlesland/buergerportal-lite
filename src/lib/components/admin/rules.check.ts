import assert from 'node:assert/strict';
import {
	APPLICATION_TRANSITIONS,
	DEFECT_TRANSITIONS,
	canMoveApplication,
	canMoveDefect,
	checkText,
	mayDecideOffice,
	parseId,
	sourcesOf
} from './rules.ts';

for (const from of Object.keys(
	APPLICATION_TRANSITIONS
) as (keyof typeof APPLICATION_TRANSITIONS)[]) {
	for (const to of Object.keys(
		APPLICATION_TRANSITIONS
	) as (keyof typeof APPLICATION_TRANSITIONS)[]) {
		assert.equal(canMoveApplication(from, to), sourcesOf(to).includes(from));
	}
}
assert.equal(canMoveApplication('bewilligt', 'abgelehnt'), false);
assert.equal(canMoveApplication('entwurf', 'bewilligt'), false);
assert.equal(canMoveApplication('in_pruefung', 'nachforderung'), true);
for (const status of Object.keys(DEFECT_TRANSITIONS) as (keyof typeof DEFECT_TRANSITIONS)[]) {
	assert.equal(canMoveDefect(status, status), false);
}
assert.equal(canMoveDefect('gemeldet', 'in_bearbeitung'), true);
assert.equal(canMoveDefect('in_bearbeitung', 'behoben'), true);
assert.equal(canMoveDefect('behoben', 'in_bearbeitung'), true);
assert.equal(mayDecideOffice(1, 1), true);
assert.equal(mayDecideOffice(1, 2), false);
assert.equal(mayDecideOffice(null, 1), false);
assert.equal(parseId('123x'), null);
assert.equal(parseId('0'), null);
assert.equal(parseId('123'), 123);
assert(checkText(new File(['x'], 'proof.txt'), { label: 'Text', required: true }).error);
assert(checkText('kurz', { label: 'Text', required: true, min: 10 }).error);
assert.deepEqual(checkText('  Genügend langer Text  ', { label: 'Text', min: 10 }), {
	value: 'Genügend langer Text'
});
console.log('All caseworker rule checks passed.');
