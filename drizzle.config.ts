import { defineConfig } from 'drizzle-kit';

// Run via `npm run db:push` (Node loads .env with --env-file).
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL },
	strict: true,
	verbose: true
});
