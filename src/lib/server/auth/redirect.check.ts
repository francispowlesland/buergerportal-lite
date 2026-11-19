import assert from 'node:assert/strict';
import { safePath } from './redirect.ts';

assert.equal(safePath('/postkorb/42?x=1'), '/postkorb/42?x=1');
assert.equal(safePath('/dienste/../mein-buergerportal'), '/mein-buergerportal');
for (const input of [
	null,
	{},
	'https://evil.invalid',
	'//evil.invalid',
	'/\\evil.invalid',
	'/\n/evil.invalid',
	'/auth/login',
	'/x/../auth/login'
]) {
	assert.equal(safePath(input, '/'), '/', `Rejected redirect: ${JSON.stringify(input)}`);
}
console.log('Auth redirect checks passed.');
