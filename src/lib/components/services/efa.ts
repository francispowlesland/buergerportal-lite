import { formatDate } from '#lib/format.ts';
import { meetsTrust, TRUST_LABELS, type TrustLevel } from '#lib/trust.ts';
import type { User } from '#lib/server/db/schema.ts';

export type EfaField = {
	key: string;
	label: string;
	value: string | null;
	withheldHint: string;
};

/** The preview and simulated handoff share the same trust-based disclosure policy. */
export function efaFields(
	user: Pick<User, 'firstName' | 'lastName' | 'street' | 'postalCode' | 'city' | 'birthDate'>,
	trust: TrustLevel
): EfaField[] {
	const address = [user.street, [user.postalCode, user.city].filter(Boolean).join(' ')]
		.filter(Boolean)
		.join(', ');
	return [
		{ key: 'name', label: 'Name', value: `${user.firstName} ${user.lastName}`, withheldHint: '' },
		{
			key: 'address',
			label: 'Anschrift',
			value: meetsTrust(trust, 'substanziell') ? address || null : null,
			withheldHint: meetsTrust(trust, 'substanziell')
				? 'Nicht hinterlegt'
				: 'Erst ab Vertrauensniveau Substanziell'
		},
		{
			key: 'birthDate',
			label: 'Geburtsdatum',
			value: trust === 'hoch' && user.birthDate ? formatDate(user.birthDate) : null,
			withheldHint: trust === 'hoch' ? 'Nicht hinterlegt' : 'Erst ab Vertrauensniveau Hoch'
		},
		{ key: 'trust', label: 'Vertrauensniveau', value: TRUST_LABELS[trust], withheldHint: '' }
	];
}
