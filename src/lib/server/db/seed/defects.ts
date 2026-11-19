import { defects, defectUpdates } from '../schema';
import { daysAgoAt, plusHours, plusMinutes, type Db, type Ids } from './util';

type DefectStatus = (typeof defects.$inferSelect)['status'];
type DefectCategory = (typeof defects.$inferSelect)['category'];

type DefectSeed = {
	category: DefectCategory;
	title: string;
	description: string;
	address: string;
	lat: number;
	lng: number;
	status: DefectStatus;
	/** User slug of the reporter; null = anonymous report. */
	reporter: string | null;
	photoName?: string;
	/** Days ago the defect was reported. */
	daysAgo: number;
	/** Hour of day (Berlin) when it was reported. */
	hour: number;
	/** Municipal updates after the initial "Meldung eingegangen". */
	updates: { status: DefectStatus; note: string; author: string; afterHours: number }[];
};

const TIEFBAU = 'Tiefbauamt Musterstadt';
const ORDNUNG = 'Ordnungsamt Musterstadt';
const STADTWERKE = 'Stadtwerke Musterstadt';
const GRUENFLAECHEN = 'Grünflächenamt Musterstadt';

const defectRows: DefectSeed[] = [
	{
		category: 'schlagloch',
		title: 'Tiefes Schlagloch vor Hauptstraße 57',
		description:
			'Auf Höhe der Hausnummer 57 befindet sich ein ca. 40 cm breites und 10 cm tiefes Schlagloch in der Fahrbahn. Radfahrer müssen ausweichen, ein Auto hat bereits einen Reifenschaden gemeldet.',
		address: 'Hauptstraße 57, 12345 Musterstadt',
		lat: 51.0512,
		lng: 10.001,
		status: 'in_bearbeitung',
		reporter: 'max',
		photoName: 'schlagloch-hauptstrasse.jpg',
		daysAgo: 34,
		hour: 8,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Schaden vor Ort geprüft. Die Reparatur ist für die nächste Asphaltkolonne eingeplant.',
				author: TIEFBAU,
				afterHours: 52
			}
		]
	},
	{
		category: 'schlagloch',
		title: 'Fahrbahnschaden Bahnhofstraße Nr. 22',
		description:
			'Der Asphalt ist auf ca. 2 m² aufgebrochen, Kanten stehen hoch. Besonders für Motorradfahrer gefährlich.',
		address: 'Bahnhofstraße 22, 12345 Musterstadt',
		lat: 51.0415,
		lng: 9.9985,
		status: 'behoben',
		reporter: 'lena',
		daysAgo: 58,
		hour: 17,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Absicherung der Schadstelle erfolgt. Reparatur wird beauftragt.',
				author: TIEFBAU,
				afterHours: 30
			},
			{
				status: 'behoben',
				note: 'Fahrbahn wurde mit neuem Asphalt geschlossen. Vielen Dank für Ihre Meldung.',
				author: TIEFBAU,
				afterHours: 24 * 9
			}
		]
	},
	{
		category: 'strassenbeleuchtung',
		title: 'Straßenlaterne in der Lindenallee ausgefallen',
		description:
			'Die Laterne vor Lindenallee 30 brennt seit mehreren Tagen nicht mehr. Der Gehweg ist abends sehr dunkel, besonders für Schulkinder im Winter ein Problem.',
		address: 'Lindenallee 30, 12345 Musterstadt',
		lat: 51.0575,
		lng: 10.004,
		status: 'gemeldet',
		reporter: 'erika',
		photoName: 'laterne-lindenallee.jpg',
		daysAgo: 3,
		hour: 18,
		updates: []
	},
	{
		category: 'strassenbeleuchtung',
		title: 'Defekte Beleuchtung im Gartenweg',
		description:
			'Gegenüber von Hausnummer 12 flackert die Leuchte dauerhaft und fällt immer wieder ganz aus.',
		address: 'Gartenweg 12, 12345 Musterstadt',
		lat: 51.0462,
		lng: 9.989,
		status: 'in_bearbeitung',
		reporter: 'mia',
		daysAgo: 12,
		hour: 19,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Leuchtmittel und Vorschaltgerät werden ausgetauscht. Ein Termin mit dem Hubsteiger wurde vereinbart.',
				author: STADTWERKE,
				afterHours: 70
			}
		]
	},
	{
		category: 'graffiti',
		title: 'Graffiti in der Bahnhofsunterführung',
		description:
			'Die gesamte Seitenwand der Unterführung am Bahnhof ist großflächig mit Schmierereien beschmiert, teils mit unangemessenen Inhalten.',
		address: 'Unterführung Bahnhof, 12345 Musterstadt',
		lat: 51.0398,
		lng: 10.0005,
		status: 'behoben',
		reporter: 'jonas',
		photoName: 'graffiti-unterfuehrung.jpg',
		daysAgo: 45,
		hour: 7,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Reinigung ist beauftragt. Der Bauhof prüft zudem eine Anti-Graffiti-Beschichtung.',
				author: ORDNUNG,
				afterHours: 48
			},
			{
				status: 'behoben',
				note: 'Die Wand wurde gereinigt und neu gestrichen.',
				author: ORDNUNG,
				afterHours: 24 * 12
			}
		]
	},
	{
		category: 'graffiti',
		title: 'Schmierereien an der Turnhallenwand',
		description:
			'An der Außenwand der Turnhalle in der Schulstraße wurden über das Wochenende großflächig Schriftzüge aufgesprüht.',
		address: 'Schulstraße 3, 12345 Musterstadt',
		lat: 51.0555,
		lng: 10.015,
		status: 'gemeldet',
		reporter: 'jonas',
		daysAgo: 6,
		hour: 16,
		updates: []
	},
	{
		category: 'illegale_muellablagerung',
		title: 'Illegale Müllablagerung am Gewerbering',
		description:
			'Am Waldweg hinter dem Gewerbering wurden Bauschutt, Altreifen und mehrere Müllsäcke abgeladen.',
		address: 'Waldweg am Gewerbering, 12345 Musterstadt',
		lat: 51.043,
		lng: 10.02,
		status: 'gemeldet',
		reporter: null,
		photoName: 'muell-gewerbering.jpg',
		daysAgo: 2,
		hour: 10,
		updates: []
	},
	{
		category: 'illegale_muellablagerung',
		title: 'Müllberge am Sportplatz-Parkplatz',
		description:
			'Auf dem Parkplatz am Sportplatz stapeln sich Sperrmüll, alte Matratzen und Elektrogeräte. Der Bereich wird zunehmend als Ablageplatz genutzt.',
		address: 'Parkplatz Sportplatz Nordwest, 12345 Musterstadt',
		lat: 51.06,
		lng: 9.99,
		status: 'in_bearbeitung',
		reporter: 'klaus',
		photoName: 'muell-sportplatz.jpg',
		daysAgo: 9,
		hour: 15,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Der Abfallbetrieb wurde mit der Beseitigung beauftragt. Das Ordnungsamt ermittelt die Verursacher.',
				author: ORDNUNG,
				afterHours: 26
			}
		]
	},
	{
		category: 'spielplatz',
		title: 'Rutsche im Stadtpark beschädigt',
		description:
			'Bei der großen Rutsche im Stadtpark ist ein Haltegriff abgebrochen und die Rutschfläche hat einen scharfen Riss. Verletzungsgefahr für Kinder.',
		address: 'Spielplatz Stadtpark, Parkallee, 12345 Musterstadt',
		lat: 51.049,
		lng: 9.996,
		status: 'in_bearbeitung',
		reporter: 'erika',
		photoName: 'rutsche-stadtpark.jpg',
		daysAgo: 15,
		hour: 16,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Das Gerät wurde gesperrt. Ersatzteile sind bestellt, die Lieferzeit beträgt voraussichtlich drei Wochen.',
				author: GRUENFLAECHEN,
				afterHours: 20
			}
		]
	},
	{
		category: 'spielplatz',
		title: 'Sandkasten am Spielplatz Lindenallee verunreinigt',
		description:
			'Der Sand im Sandkasten ist mit Scherben und Hundekot verunreinigt. Kleine Kinder können dort aktuell nicht spielen.',
		address: 'Spielplatz Lindenallee, 12345 Musterstadt',
		lat: 51.058,
		lng: 10.011,
		status: 'behoben',
		reporter: 'svetlana',
		daysAgo: 40,
		hour: 9,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Der Sandkasten wurde gesperrt und gereinigt. Ein Sandaustausch ist beauftragt.',
				author: GRUENFLAECHEN,
				afterHours: 28
			},
			{
				status: 'behoben',
				note: 'Der Sand wurde vollständig ausgetauscht, der Sandkasten ist wieder freigegeben.',
				author: GRUENFLAECHEN,
				afterHours: 24 * 6
			}
		]
	},
	{
		category: 'sonstiges',
		title: 'Umgestürzter Baum auf dem Radweg Parkallee',
		description:
			'Nach dem Sturm liegt ein größerer Ast samt Stamm auf dem Radweg an der Parkallee. Der Weg ist komplett blockiert.',
		address: 'Radweg Parkallee, 12345 Musterstadt',
		lat: 51.0445,
		lng: 10.01,
		status: 'behoben',
		reporter: 'tobias',
		photoName: 'baum-radweg.jpg',
		daysAgo: 28,
		hour: 7,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Die Stadtgärtnerei ist informiert und räumt den Radweg noch heute.',
				author: GRUENFLAECHEN,
				afterHours: 3
			},
			{
				status: 'behoben',
				note: 'Der Baum wurde zerkleinert und abtransportiert. Der Radweg ist wieder frei.',
				author: GRUENFLAECHEN,
				afterHours: 30
			}
		]
	},
	{
		category: 'sonstiges',
		title: 'Defekte Sitzbank am Marktplatz',
		description:
			'Bei der Bank vor dem Alten Rathaus fehlen zwei Latten der Sitzfläche. Die Bank ist nicht mehr sicher nutzbar.',
		address: 'Marktplatz 1, 12345 Musterstadt',
		lat: 51.0508,
		lng: 10.0035,
		status: 'gemeldet',
		reporter: 'max',
		daysAgo: 4,
		hour: 12,
		updates: []
	},
	{
		category: 'schlagloch',
		title: 'Schlaglöcher im Industrieweg',
		description:
			'Der Industrieweg am Gewerbering hat mehrere Schlaglöcher hintereinander. Lkw-Verkehr verschlimmert den Zustand zusehends.',
		address: 'Industrieweg, Gewerbering, 12345 Musterstadt',
		lat: 51.042,
		lng: 10.019,
		status: 'gemeldet',
		reporter: 'ahmet',
		daysAgo: 1,
		hour: 14,
		updates: []
	},
	{
		category: 'strassenbeleuchtung',
		title: 'Laterne am Marktplatz flackert',
		description:
			'Die historische Laterne am Brunnen auf dem Marktplatz flackert abends durchgehend und schaltet sich zwischenzeitlich ab.',
		address: 'Marktplatz, 12345 Musterstadt',
		lat: 51.0511,
		lng: 10.002,
		status: 'behoben',
		reporter: 'fatma',
		daysAgo: 20,
		hour: 20,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Der Fehler wurde lokalisiert. Die Elektrik wird bei der nächsten Wartungsrunde erneuert.',
				author: STADTWERKE,
				afterHours: 40
			},
			{
				status: 'behoben',
				note: 'Vorschaltgerät und Leuchtmittel wurden getauscht. Die Laterne funktioniert wieder einwandfrei.',
				author: STADTWERKE,
				afterHours: 24 * 5
			}
		]
	},
	{
		category: 'illegale_muellablagerung',
		title: 'Sperrmüll im Hinterhof Bahnhofstraße',
		description:
			'Im Durchgang zum Hinterhof an der Bahnhofstraße liegen Möbel, Matratzen und mehrere Säcke Hausmüll seit über einer Woche.',
		address: 'Hinterhof Bahnhofstraße 14, 12345 Musterstadt',
		lat: 51.0385,
		lng: 9.983,
		status: 'gemeldet',
		reporter: null,
		daysAgo: 5,
		hour: 9,
		updates: []
	},
	{
		category: 'graffiti',
		title: 'Haltestelle Nord großflächig besprüht',
		description:
			'Die Scheiben und die Rückwand der Bushaltestelle Nord sind mit Graffiti bedeckt. Der Fahrplan ist kaum noch lesbar.',
		address: 'Haltestelle Nord, Hauptstraße, 12345 Musterstadt',
		lat: 51.0535,
		lng: 10.021,
		status: 'in_bearbeitung',
		reporter: 'svetlana',
		photoName: 'graffiti-haltestelle.jpg',
		daysAgo: 7,
		hour: 11,
		updates: [
			{
				status: 'in_bearbeitung',
				note: 'Die Verkehrsbetriebe wurden informiert. Die Reinigung ist für die kommende Woche geplant.',
				author: ORDNUNG,
				afterHours: 34
			}
		]
	}
];

function reference(index: number): string {
	return `M-2026-${String(index + 1).padStart(4, '0')}`;
}

export async function seedDefects(db: Db, user: Ids): Promise<number> {
	// Oldest first, so that reference numbers grow with time like real ticket numbers.
	const ordered = [...defectRows].sort((a, b) => b.daysAgo - a.daysAgo);

	for (const [index, d] of ordered.entries()) {
		const createdAt = daysAgoAt(d.daysAgo, d.hour, (index * 7) % 60);
		const [row] = await db
			.insert(defects)
			.values({
				reference: reference(index),
				category: d.category,
				title: d.title,
				description: d.description,
				address: d.address,
				lat: d.lat,
				lng: d.lng,
				status: d.status,
				reporterId: d.reporter ? (user[d.reporter] ?? null) : null,
				photoName: d.photoName ?? null,
				createdAt
			})
			.returning({ id: defects.id });
		if (!row) throw new Error(`Seed: defect ${reference(index)} was not inserted`);

		await db.insert(defectUpdates).values([
			{
				defectId: row.id,
				status: 'gemeldet' as const,
				note: 'Meldung eingegangen',
				authorName: 'Mängelmelder Musterstadt',
				createdAt: plusMinutes(createdAt, 5)
			},
			...d.updates.map((u) => ({
				defectId: row.id,
				status: u.status,
				note: u.note,
				authorName: u.author,
				createdAt: plusHours(createdAt, u.afterHours)
			}))
		]);
	}
	return ordered.length;
}
