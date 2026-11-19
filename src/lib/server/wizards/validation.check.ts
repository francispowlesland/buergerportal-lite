import assert from 'node:assert/strict';
import { validateWizard, validateWizardStep } from './validation.ts';
import { readWizardInput, readStep, validateAttachment } from './input.ts';
import { deriveParkingZone, validateGermanPlate } from './parkingZones.ts';

const user = { street: 'Nordallee 12', postalCode: '12345' };
const melde = { zweck: 'bank', anzahl: 2, uebermittlung: 'postkorb', bestaetigt: true };
assert.equal(validateWizard('meldebescheinigung', melde, user).valid, true);
assert.equal(
	validateWizard('meldebescheinigung', { ...melde, bestaetigt: 'true' }, user).valid,
	false
);
assert.equal(
	validateWizardStep('meldebescheinigung', 0, { ...melde, anzahl: 1.5 }, user).valid,
	false
);
assert.equal(validateWizardStep('meldebescheinigung', -1, melde, user).valid, false);
assert.equal(deriveParkingZone('Parkring 4'), 'C');
assert.equal(validateGermanPlate(' ms-ab1234 ').normalized, 'MS-AB 1234');
const parking = {
	kennzeichen: 'MS-AB 1234',
	fahrzeugart: 'pkw',
	halter: 'selbst',
	parkzone: 'B',
	laufzeitMonate: 12,
	nachweise: [],
	zulassungGeprueft: true
};
assert.equal(validateWizard('anwohnerparkausweis', parking, user).valid, true);
assert.equal(
	validateWizard('anwohnerparkausweis', { ...parking, parkzone: 'A' }, user).valid,
	false
);
assert.equal(
	validateWizard('anwohnerparkausweis', { ...parking, halter: 'andere' }, user).valid,
	false
);
const brief = {
	wahlbenachrichtigungsnummer: 'WB-07-004711',
	zustellung: 'abweichend',
	abweichendeAnschrift: { street: 'Testweg 1', postalCode: '12345', city: 'Berlin' }
};
assert.equal(validateWizard('briefwahl', brief, user).valid, true);
assert.equal(
	validateWizard('briefwahl', { ...brief, wahlbenachrichtigungsnummer: 'WB-99-123456' }, user)
		.valid,
	false
);
assert.equal(
	validateWizard('briefwahl', { ...brief, abweichendeAnschrift: { postalCode: 12345 } }, user)
		.valid,
	false
);
const form = new FormData();
form.set(
	'dataPayload',
	JSON.stringify({ ...parking, zulassungGeprueft: true, nachweise: ['forged'], userId: 999 })
);
const parsed = readWizardInput('anwohnerparkausweis', form, {}, {}, []);
assert.equal(parsed.zulassungGeprueft, false);
assert.deepEqual(parsed.nachweise, []);
assert.equal(parsed.userId, undefined);
form.set('dataPayload', '{');
assert.throws(() => readWizardInput('briefwahl', form, {}, {}, []));
form.set('dataPayload', 'null');
assert.throws(() => readWizardInput('briefwahl', form, {}, {}, []));
form.set(
	'dataPayload',
	JSON.stringify({ wahlDatum: '2000-01-01', wahlbenachrichtigungsnummer: 'wb-03-123456' })
);
assert.equal(
	readWizardInput('briefwahl', form, { wahlDatum: '2026-12-13' }, {}, []).wahlDatum,
	'2026-12-13'
);
assert.equal(readStep('1.5', 3), null);
assert.equal(readStep('3', 3), null);
assert.equal(readStep('2', 3), 2);
assert.equal(validateAttachment('schein.pdf', 1024, 'application/pdf'), true);
assert.equal(validateAttachment('../schein.pdf', 1024, 'application/pdf'), false);
assert.equal(validateAttachment('schein.pdf', -1, 'application/pdf'), false);
assert.equal(validateAttachment('schein.pdf', 6 * 1024 * 1024, 'application/pdf'), false);
assert.equal(validateAttachment('schein.exe', 1024, 'application/pdf'), false);
console.log('Wizard validation/input self-checks passed.');
