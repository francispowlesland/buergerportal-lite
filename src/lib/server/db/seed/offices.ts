import { locations, offices } from '../schema';
import { idOf, type Db, type Ids } from './util';

const officeRows = [
	{
		slug: 'buergeramt',
		name: 'Bürgeramt Musterstadt',
		shortDescription:
			'Meldewesen, Ausweise und Pässe, Führungszeugnisse und Beglaubigungen – die erste Anlaufstelle für Ihre Anliegen.',
		phone: '012 345 678-100',
		email: 'buergeramt@musterstadt.example',
		openingHours: 'Mo–Fr 8–12 Uhr, Do auch 14–18 Uhr'
	},
	{
		slug: 'standesamt',
		name: 'Standesamt Musterstadt',
		shortDescription:
			'Beurkundung von Geburten, Eheschließungen und Sterbefällen sowie Namensänderungen und Kirchenaustritte.',
		phone: '012 345 678-200',
		email: 'standesamt@musterstadt.example',
		openingHours: 'Mo–Fr 8–12 Uhr, Di auch 14–16 Uhr'
	},
	{
		slug: 'kfz-zulassung',
		name: 'Kfz-Zulassungsstelle Musterstadt',
		shortDescription:
			'Zulassung, Ummeldung und Außerbetriebsetzung von Fahrzeugen sowie Fahrerlaubnisangelegenheiten.',
		phone: '012 345 678-300',
		email: 'kfz@musterstadt.example',
		openingHours: 'Mo–Fr 7:30–13 Uhr, Mi auch 14–17 Uhr'
	},
	{
		slug: 'ordnungsamt',
		name: 'Ordnungsamt Musterstadt',
		shortDescription:
			'Öffentliche Sicherheit und Ordnung: Parken, Hundesteuer, Gewerbe, Veranstaltungen und Lärmschutz.',
		phone: '012 345 678-400',
		email: 'ordnungsamt@musterstadt.example',
		openingHours: 'Mo–Fr 8–12 Uhr, Di und Do auch 14–16 Uhr'
	},
	{
		slug: 'bauamt',
		name: 'Bauamt Musterstadt',
		shortDescription:
			'Baugenehmigungen, Bauberatung, Wohngeld und Wohnberechtigungsscheine für Musterstadt.',
		phone: '012 345 678-500',
		email: 'bauamt@musterstadt.example',
		openingHours: 'Mo, Di, Do, Fr 8–12 Uhr, Di auch 14–17 Uhr'
	},
	{
		slug: 'jugendamt',
		name: 'Jugendamt Musterstadt',
		shortDescription:
			'Hilfen für Familien: Kita-Plätze, Elterngeld, Unterhaltsvorschuss und Beratung rund um Kinder und Jugendliche.',
		phone: '012 345 678-600',
		email: 'jugendamt@musterstadt.example',
		openingHours: 'Mo–Fr 8:30–12 Uhr, Mi auch 14–16 Uhr'
	},
	{
		slug: 'wahlamt',
		name: 'Wahlamt Musterstadt',
		shortDescription:
			'Organisation von Wahlen und Abstimmungen, Briefwahl, Wählerverzeichnis und Wahlhelfer.',
		phone: '012 345 678-700',
		email: 'wahlamt@musterstadt.example',
		openingHours: 'Mo–Fr 8–12 Uhr, in der Wahlwoche auch Sa 9–12 Uhr'
	}
];

type LocationSeed = {
	key: string;
	office: string;
	name: string;
	street: string;
	lat: number;
	lng: number;
};

const locationRows: LocationSeed[] = [
	{
		key: 'buergeramt-mitte',
		office: 'buergeramt',
		name: 'Bürgeramt Mitte',
		street: 'Hauptstraße 12',
		lat: 51.0502,
		lng: 10.0021
	},
	{
		key: 'buergeramt-nord',
		office: 'buergeramt',
		name: 'Bürgeramt Nord',
		street: 'Lindenallee 45',
		lat: 51.0585,
		lng: 10.0035
	},
	{
		key: 'buergeramt-sued',
		office: 'buergeramt',
		name: 'Bürgeramt Süd',
		street: 'Bahnhofstraße 8',
		lat: 51.0408,
		lng: 9.999
	},
	{
		key: 'standesamt',
		office: 'standesamt',
		name: 'Standesamt im Alten Rathaus',
		street: 'Marktplatz 1',
		lat: 51.051,
		lng: 10.003
	},
	{
		key: 'kfz',
		office: 'kfz-zulassung',
		name: 'Kfz-Zulassungsstelle Gewerbering',
		street: 'Gewerbering 21',
		lat: 51.0425,
		lng: 10.0165
	},
	{
		key: 'ordnungsamt',
		office: 'ordnungsamt',
		name: 'Ordnungsamt',
		street: 'Marktplatz 3',
		lat: 51.0495,
		lng: 10.006
	},
	{
		key: 'wahlamt',
		office: 'wahlamt',
		name: 'Wahlamt',
		street: 'Marktplatz 2',
		lat: 51.0508,
		lng: 10.0015
	},
	{
		key: 'jugendamt',
		office: 'jugendamt',
		name: 'Jugendamt',
		street: 'Gartenweg 9',
		lat: 51.047,
		lng: 9.9955
	},
	{
		key: 'bauamt',
		office: 'bauamt',
		name: 'Bauamt',
		street: 'Hauptstraße 40',
		lat: 51.052,
		lng: 10.009
	}
];

export async function seedOffices(db: Db): Promise<{ office: Ids; location: Ids }> {
	const insertedOffices = await db
		.insert(offices)
		.values(officeRows)
		.returning({ id: offices.id, slug: offices.slug });
	const office: Ids = Object.fromEntries(insertedOffices.map((o) => [o.slug, o.id]));

	const insertedLocations = await db
		.insert(locations)
		.values(
			locationRows.map((l) => ({
				officeId: idOf(office, l.office, 'office'),
				name: l.name,
				street: l.street,
				postalCode: '12345',
				city: 'Musterstadt',
				lat: l.lat,
				lng: l.lng
			}))
		)
		.returning({ id: locations.id, name: locations.name });

	const idByName: Ids = Object.fromEntries(insertedLocations.map((l) => [l.name, l.id]));
	const location: Ids = {};
	for (const row of locationRows) location[row.key] = idOf(idByName, row.name, 'location');
	return { office, location };
}
