import assert from 'node:assert/strict';
import {
	berlinInstant,
	buildCalendar,
	buildDays,
	buildIcs,
	checkSlot,
	foldLine,
	gridTimes,
	isoDate,
	isoTime,
	qrPayload,
	qrSvg,
	slotProfile
} from './appointments.ts';

const now = new Date('2026-11-19T06:00:00Z');
const profile = slotProfile('reisepass-beantragen');
assert.equal(berlinInstant('2026-02-30', '09:00'), null);
assert.equal(berlinInstant('2027-03-28', '02:30'), null);
assert.equal(berlinInstant('2026-11-20', '09:00')?.toISOString(), '2026-11-20T08:00:00.000Z');
assert.equal(berlinInstant('2026-07-20', '09:00')?.toISOString(), '2026-07-20T07:00:00.000Z');
assert.equal(isoDate(new Date('2026-11-19T23:30:00Z')), '2026-11-20');
assert.equal(isoTime(now), '07:00');
assert.equal(checkSlot('2026-11-19', '08:45', profile, now).ok, false);
assert.equal(checkSlot('2026-11-19', '09:00', profile, now).ok, true);
assert.equal(checkSlot('2026-11-20', '09:07', profile, now).ok, false);
assert.equal(checkSlot('2026-12-18', '09:00', profile, now).ok, false);
assert.deepEqual(gridTimes('2026-11-21', profile), []);
assert.deepEqual(gridTimes('2026-12-25', profile), []);
const days = buildDays(
	'2026-11-20',
	'2026-11-20',
	profile,
	[{ startsAt: new Date('2026-11-20T08:00:00Z'), durationMin: 30 }],
	now
);
assert.equal(days[0].slots.find((s) => s.time === '09:00')?.free, false);
assert.equal(days[0].slots.find((s) => s.time === '09:15')?.free, false);
assert.equal(days[0].slots.find((s) => s.time === '09:30')?.free, true);
const calendar = buildCalendar('2026-11', new Map(days.map((d) => [d.date, d])), {
	now,
	selected: '2026-11-20',
	hrefFor: (d) => `/termine/buchen?datum=${d}`
});
assert.equal(calendar[0].cells[0].weekday, 1);
assert.equal(calendar.flatMap((w) => w.cells).find((d) => d.date === '2026-11-20')?.selected, true);
const ics = buildIcs({
	code: 'T-CHECK',
	summary: 'Pass, Prüfung; Test\nZeile',
	location: 'Mitte',
	description: 'Ä'.repeat(100) + '\rX-INJECTED:true',
	startsAt: new Date('2026-11-20T08:00:00Z'),
	durationMin: 30,
	now
});
assert.ok(ics.includes('DTEND:20261120T083000Z\r\n'));
assert.ok(ics.includes('SUMMARY:Pass\\, Prüfung\\; Test\\nZeile\r\n'));
assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
assert.equal(ics.replace(/\r\n/g, '').includes('\r'), false);
for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
for (const line of foldLine('Ä'.repeat(100)).split('\r\n'))
	assert.ok(Buffer.byteLength(line) <= 75);
assert.ok(qrSvg(qrPayload('T-CHECK')).startsWith('<svg'));
assert.equal(qrPayload('T-CHECK'), 'MUSTERSTADT-TERMIN:T-CHECK');
console.log('Appointment date, availability, calendar, QR and ICS checks passed.');
