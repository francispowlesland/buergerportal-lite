import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { UPLOAD_LIMITS, validateReply, validateUpload } from './types.ts';

for (const route of ['+page.svelte', '[id]/+page.svelte']) {
	const source = readFileSync(
		new URL(`../../../routes/postkorb/${route}`, import.meta.url),
		'utf8'
	);
	assert.match(source, /data-sveltekit-preload-data="false"/);
	assert.doesNotMatch(source, /data-sveltekit-preload-data="off"/);
}

for (const filename of ['test.exe', 'test.constructor', 'test.__proto__']) {
	assert.equal(validateUpload({ filename, sizeBytes: 1 }).ok, false, filename);
}
for (const sizeBytes of [0, -1, NaN, Infinity, 1.1, UPLOAD_LIMITS.maxBytes + 1]) {
	assert.equal(validateUpload({ filename: 'test.pdf', sizeBytes }).ok, false);
}
assert.equal(
	validateUpload({ filename: 'test.pdf', sizeBytes: 1, mimeType: 'text/html' }).ok,
	false
);
const valid = validateUpload({ filename: '../nachweis.PDF', sizeBytes: UPLOAD_LIMITS.maxBytes });
assert.ok(valid.ok);
assert.equal(valid.file.filename, '..nachweis.PDF');
assert.equal(valid.file.mimeType, 'application/pdf');

const form = new FormData();
assert.ok(validateReply(form).errors.text);
form.set('text', '  Guten Tag\r\nDanke  ');
assert.equal(validateReply(form).text, 'Guten Tag\nDanke');
assert.deepEqual(validateReply(form).errors, {});
form.set('text', 'x'.repeat(UPLOAD_LIMITS.maxText + 1));
assert.ok(validateReply(form).errors.text);
form.set('text', new File(['test'], 'text.pdf'));
assert.ok(validateReply(form).errors.text);
form.set('text', '');
form.set('datei', 'forged-file');
assert.ok(validateReply(form).errors.dokumente);
form.delete('datei');
form.append('datei', new File(['pdf demo'], 'nachweis.pdf', { type: 'application/pdf' }));
assert.equal(validateReply(form).valid.length, 1);
assert.deepEqual(validateReply(form).errors, {});
for (let i = 0; i < UPLOAD_LIMITS.maxFiles; i++) {
	form.append('datei', new File(['test'], `nachweis${i}.pdf`));
}
assert.ok(validateReply(form).errors.dokumente);
console.log('Postkorb multipart validation checks passed.');
