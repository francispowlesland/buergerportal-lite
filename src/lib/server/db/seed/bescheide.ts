import { bescheide } from '../schema';
import { daysAgoAt, idOf, type Db, type Ids } from './util';

export async function seedBescheide(
	db: Db,
	user: Ids,
	application: Ids,
	message: Ids
): Promise<number> {
	const issuedAt = daysAgoAt(14, 11, 20);

	await db.insert(bescheide).values({
		applicationId: idOf(application, 'MS-2026-004711', 'application'),
		messageId: idOf(message, 'max-mb-bescheid', 'message'),
		decision: 'bewilligt',
		number: 'B-2026-004711',
		verificationCode: '7KQ2-M9XD-41LP',
		bodyText: [
			'Bescheid über die Erteilung einer einfachen Meldebescheinigung',
			'',
			'Aktenzeichen des Antrags: MS-2026-004711',
			'Bescheidnummer: B-2026-004711',
			'',
			'Sehr geehrter Herr Mustermann,',
			'',
			'auf Ihren online gestellten Antrag wird Ihnen nach § 18 des Bundesmeldegesetzes (BMG) eine einfache Meldebescheinigung erteilt.',
			'',
			'Ergebnis der Prüfung:',
			'Herr Max Mustermann, geboren am 12.03.1985, ist in der Stadt Musterstadt mit Hauptwohnsitz gemeldet unter der Anschrift Lindenallee 14, 12345 Musterstadt.',
			'',
			'Verwendungszweck: Vorlage beim Arbeitgeber. Anzahl der Ausfertigungen: 1.',
			'',
			'Begründung:',
			'Die Voraussetzungen für die Erteilung einer Meldebescheinigung liegen vor. Die Identität wurde über das Vertrauensniveau „hoch“ (Online-Ausweis) festgestellt. Die Angaben beruhen auf dem Melderegister der Stadt Musterstadt.',
			'',
			'Gebühren:',
			'Für diesen Bescheid wird nach der Verwaltungsgebührensatzung der Stadt Musterstadt eine Gebühr von 5,00 EUR festgesetzt.',
			'',
			'Die Echtheit dieses Bescheids können Sie mit dem Prüfcode 7KQ2-M9XD-41LP im Bürgerportal Musterstadt bestätigen lassen.',
			'',
			'Dieser Bescheid wurde maschinell erstellt und ist ohne Unterschrift gültig.',
			'',
			'Mit freundlichen Grüßen',
			'Stadt Musterstadt',
			'Der Bürgermeister',
			'Im Auftrag Hans Schmidt, Sachbearbeiter Bürgeramt'
		].join('\n'),
		rechtsbehelf:
			'Rechtsbehelfsbelehrung: Gegen diesen Bescheid kann innerhalb eines Monats nach seiner Bekanntgabe Widerspruch erhoben werden. Der Widerspruch ist schriftlich oder zur Niederschrift bei der Stadt Musterstadt, Bürgeramt, Hauptstraße 12, 12345 Musterstadt, einzulegen. Er kann auch in elektronischer Form mit qualifizierter elektronischer Signatur oder über das Bürgerportal Musterstadt mit Vertrauensniveau „hoch“ eingelegt werden. Maßgeblich für die Fristwahrung ist der Eingang bei der Stadt Musterstadt.',
		issuedById: idOf(user, 'hans', 'user'),
		issuedAt
	});
	return 1;
}
