import type { ApplicationStatus, Message } from '#lib/server/db/schema.ts';
import type { TrustLevel } from '#lib/trust.ts';

export type DashApplication = {
	id: number;
	reference: string;
	status: ApplicationStatus;
	serviceName: string;
	wizardSlug: string | null;
	/** ISO timestamp */
	updatedAt: string;
};

export type DashAppointment = {
	code: string;
	/** ISO timestamp */
	startsAt: string;
	durationMin: number;
	serviceName: string;
	locationName: string;
	locationStreet: string;
};

export type DashMessage = {
	id: number;
	subject: string;
	kind: Message['kind'];
	fromName: string;
	requiredTrust: TrustLevel;
	/** ISO timestamp */
	createdAt: string;
};
