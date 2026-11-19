import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../schema';
import { seedOffices } from './offices';
import { seedServices } from './services';
import { seedUsers } from './users';
import { seedApplications } from './applications';
import { seedMessages } from './messages';
import { seedBescheide } from './bescheide';
import { seedAppointments } from './appointments';
import { seedDefects } from './defects';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const client = postgres(databaseUrl);
const db = drizzle(client, { schema });

try {
	console.log('Leere Tabellen …');
	await db.execute(sql`
		TRUNCATE TABLE
			defect_updates, defects, appointments, bescheide, messages, attachments,
			application_events, applications, sessions, users, services, locations, offices
		RESTART IDENTITY CASCADE
	`);

	const { office, location } = await seedOffices(db);
	const service = await seedServices(db, office);
	const user = await seedUsers(db, office);
	const application = await seedApplications(db, user, service);
	const message = await seedMessages(db, user, application);
	await seedBescheide(db, user, application, message);
	await seedAppointments(db, user, service, location);
	await seedDefects(db, user);

	console.log('Seed abgeschlossen:');
	console.log(`  Ämter:        ${Object.keys(office).length}`);
	console.log(`  Standorte:    ${Object.keys(location).length}`);
	console.log(`  Leistungen:   ${Object.keys(service).length}`);
	console.log(`  Nutzer:       ${Object.keys(user).length}`);
	console.log(`  Anträge:      ${Object.keys(application).length}`);
	console.log(`  Nachrichten:  ${Object.keys(message).length}`);
} finally {
	await client.end();
}
