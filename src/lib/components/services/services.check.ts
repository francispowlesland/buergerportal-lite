import assert from 'node:assert/strict';
import { efaFields } from './efa.ts';
import { groupByLetter, letterOf, scoreQuery, searchIndex } from './search.ts';

const service = searchIndex({
	name: 'Führungszeugnis beantragen',
	summary: 'Auszug aus dem Register',
	keywords: ['Leumundszeugnis'],
	officeName: 'Bürgeramt'
});
for (const query of [
	'Führungszeugnis',
	'Fuehrungszeugnis',
	'Fuhrungszeugnis',
	'buergeramt register'
]) {
	assert.ok(scoreQuery(service, query) > 0, query);
}
assert.equal(scoreQuery(service, 'zeugnis unbekannt'), 0);
assert.equal(letterOf('Änderung'), 'A');
assert.deepEqual(
	groupByLetter([{ name: 'Zulassung' }, { name: 'Änderung' }]).map((g) => g.letter),
	['A', 'Z']
);

const user = {
	firstName: 'Max',
	lastName: 'Mustermann',
	street: 'Lindenallee 14',
	postalCode: '12345',
	city: 'Musterstadt',
	birthDate: '1985-03-12'
};
assert.deepEqual(
	efaFields(user, 'basis')
		.filter((f) => f.value !== null)
		.map((f) => f.key),
	['name', 'trust']
);
assert.deepEqual(
	efaFields(user, 'substanziell')
		.filter((f) => f.value !== null)
		.map((f) => f.key),
	['name', 'address', 'trust']
);
assert.equal(efaFields(user, 'hoch').filter((f) => f.value !== null).length, 4);
assert.equal(
	efaFields({ ...user, birthDate: null }, 'hoch').find((f) => f.key === 'birthDate')?.value,
	null
);
console.log('Service search and EfA disclosure checks passed.');
