import { users } from '../schema';
import type { TrustLevel } from '../../../trust';
import { idOf, type Db, type Ids } from './util';

type UserSeed = {
	slug: string;
	role: 'citizen' | 'caseworker';
	firstName: string;
	lastName: string;
	email: string;
	steuerId?: string;
	birthDate?: string;
	street?: string;
	maxTrust: TrustLevel;
	office?: string;
	jobTitle?: string;
};

const userRows: UserSeed[] = [
	{
		slug: 'max',
		role: 'citizen',
		firstName: 'Max',
		lastName: 'Mustermann',
		email: 'max.mustermann@example.de',
		steuerId: '12345678901',
		birthDate: '1985-03-12',
		street: 'Lindenallee 14',
		maxTrust: 'hoch'
	},
	{
		slug: 'erika',
		role: 'citizen',
		firstName: 'Erika',
		lastName: 'Musterfrau',
		email: 'erika.musterfrau@example.de',
		steuerId: '23456789012',
		birthDate: '1990-07-23',
		street: 'Gartenweg 3',
		maxTrust: 'basis'
	},
	{
		slug: 'hans',
		role: 'caseworker',
		firstName: 'Hans',
		lastName: 'Schmidt',
		email: 'hans.schmidt@musterstadt.example',
		office: 'buergeramt',
		jobTitle: 'Sachbearbeiter Bürgeramt',
		maxTrust: 'hoch'
	},
	{
		slug: 'sabine',
		role: 'caseworker',
		firstName: 'Sabine',
		lastName: 'Weber',
		email: 'sabine.weber@musterstadt.example',
		office: 'ordnungsamt',
		jobTitle: 'Sachbearbeiterin Ordnungsamt',
		maxTrust: 'hoch'
	},
	{
		slug: 'lena',
		role: 'citizen',
		firstName: 'Lena',
		lastName: 'Hoffmann',
		email: 'lena.hoffmann@example.de',
		steuerId: '34567890123',
		birthDate: '1996-11-02',
		street: 'Bahnhofstraße 27',
		maxTrust: 'substanziell'
	},
	{
		slug: 'jonas',
		role: 'citizen',
		firstName: 'Jonas',
		lastName: 'Becker',
		email: 'jonas.becker@example.de',
		steuerId: '45678901234',
		birthDate: '1988-05-17',
		street: 'Hauptstraße 63',
		maxTrust: 'hoch'
	},
	{
		slug: 'fatma',
		role: 'citizen',
		firstName: 'Fatma',
		lastName: 'Yılmaz',
		email: 'fatma.yilmaz@example.de',
		steuerId: '56789012345',
		birthDate: '1979-09-30',
		street: 'Marktplatz 7',
		maxTrust: 'substanziell'
	},
	{
		slug: 'tobias',
		role: 'citizen',
		firstName: 'Tobias',
		lastName: 'Krüger',
		email: 'tobias.krueger@example.de',
		steuerId: '67890123456',
		birthDate: '1993-01-08',
		street: 'Schulstraße 5',
		maxTrust: 'basis'
	},
	{
		slug: 'svetlana',
		role: 'citizen',
		firstName: 'Svetlana',
		lastName: 'Petrova',
		email: 'svetlana.petrova@example.de',
		steuerId: '78901234567',
		birthDate: '1984-04-19',
		street: 'Lindenallee 31',
		maxTrust: 'hoch'
	},
	{
		slug: 'klaus',
		role: 'citizen',
		firstName: 'Klaus',
		lastName: 'Wagner',
		email: 'klaus.wagner@example.de',
		steuerId: '89012345678',
		birthDate: '1962-12-25',
		street: 'Parkallee 18',
		maxTrust: 'basis'
	},
	{
		slug: 'mia',
		role: 'citizen',
		firstName: 'Mia',
		lastName: 'Schneider',
		email: 'mia.schneider@example.de',
		steuerId: '90123456789',
		birthDate: '2001-06-14',
		street: 'Gartenweg 21',
		maxTrust: 'substanziell'
	},
	{
		slug: 'ahmet',
		role: 'citizen',
		firstName: 'Ahmet',
		lastName: 'Demir',
		email: 'ahmet.demir@example.de',
		steuerId: '01234567890',
		birthDate: '1975-08-03',
		street: 'Bahnhofstraße 4',
		maxTrust: 'hoch'
	}
];

export async function seedUsers(db: Db, office: Ids): Promise<Ids> {
	const rows = await db
		.insert(users)
		.values(
			userRows.map((u) => ({
				slug: u.slug,
				role: u.role,
				firstName: u.firstName,
				lastName: u.lastName,
				email: u.email,
				steuerId: u.steuerId ?? null,
				birthDate: u.birthDate ?? null,
				street: u.street ?? null,
				postalCode: u.role === 'citizen' ? '12345' : null,
				city: u.role === 'citizen' ? 'Musterstadt' : null,
				maxTrust: u.maxTrust,
				officeId: u.office ? idOf(office, u.office, 'office') : null,
				jobTitle: u.jobTitle ?? null
			}))
		)
		.returning({ id: users.id, slug: users.slug });
	return Object.fromEntries(rows.map((r) => [r.slug, r.id]));
}
