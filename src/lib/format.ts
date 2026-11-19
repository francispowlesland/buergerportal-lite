const TZ = 'Europe/Berlin';

const date = new Intl.DateTimeFormat('de-DE', {
	timeZone: TZ,
	day: '2-digit',
	month: '2-digit',
	year: 'numeric'
});
const dateLong = new Intl.DateTimeFormat('de-DE', {
	timeZone: TZ,
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});
const time = new Intl.DateTimeFormat('de-DE', {
	timeZone: TZ,
	hour: '2-digit',
	minute: '2-digit'
});
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

type D = Date | string | number;

/** 19.11.2026 */
export const formatDate = (d: D) => date.format(new Date(d));
/** Donnerstag, 19. November 2026 */
export const formatDateLong = (d: D) => dateLong.format(new Date(d));
/** 14:30 */
export const formatTime = (d: D) => time.format(new Date(d));
/** 19.11.2026, 14:30 Uhr */
export const formatDateTime = (d: D) => `${formatDate(d)}, ${formatTime(d)} Uhr`;
/** 5,00 € — free of charge is shown as "kostenfrei". */
export const formatFee = (cents: number) => (cents === 0 ? 'kostenfrei' : euro.format(cents / 100));
