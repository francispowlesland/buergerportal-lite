import type { ServiceSeed } from './types';

export const buergeramtServices: ServiceSeed[] = [
	{
		slug: 'meldebescheinigung',
		name: 'Meldebescheinigung beantragen',
		office: 'buergeramt',
		summary: 'Amtlicher Nachweis über Ihre aktuelle Meldeanschrift, sofort online abrufbar.',
		description:
			'Die Meldebescheinigung bestätigt, dass Sie mit Haupt- oder Nebenwohnsitz in Musterstadt gemeldet sind. Sie wird zum Beispiel für Arbeitgeber, Banken, Behörden oder Vermieter benötigt. Den Antrag stellen Sie online; die Bescheinigung erhalten Sie digital in Ihrem Postkorb oder auf Wunsch per Post.',
		lebenslagen: ['umzug', 'wohnen', 'geburt', 'heirat'],
		keywords: [
			'Meldebestätigung',
			'Wohnsitzbescheinigung',
			'Anmeldebestätigung',
			'Meldenachweis',
			'Bescheinigung Wohnort'
		],
		documents: ['Online-Ausweis (eID) oder BundID-Konto mit passendem Vertrauensniveau'],
		legalBasis: '§ 18 Bundesmeldegesetz (BMG)',
		feeCents: 500,
		feeNote: 'je Bescheinigung',
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'antrag',
		wizardSlug: 'meldebescheinigung'
	},
	{
		slug: 'anmeldung-wohnsitz',
		name: 'Wohnsitz anmelden',
		office: 'buergeramt',
		summary:
			'Anmeldung einer neuen Wohnung in Musterstadt innerhalb von zwei Wochen nach dem Einzug.',
		description:
			'Wer in eine Wohnung in Musterstadt einzieht, muss sich innerhalb von zwei Wochen beim Bürgeramt anmelden. Bringen Sie dazu die ausgefüllte Anmeldung und die Wohnungsgeberbestätigung mit. Die Anmeldung ist gebührenfrei, Sie erhalten die Meldebestätigung direkt vor Ort.',
		lebenslagen: ['umzug', 'wohnen', 'geburt', 'heirat'],
		keywords: ['Ummeldung', 'Anmeldung', 'Umzug melden', 'Hauptwohnsitz', 'Nebenwohnsitz', 'Zuzug'],
		documents: [
			'Gültiger Personalausweis oder Reisepass',
			'Wohnungsgeberbestätigung',
			'Geburts- oder Heiratsurkunde bei Familien (sofern vorhanden)'
		],
		legalBasis: '§ 17 Abs. 1 Bundesmeldegesetz (BMG)',
		feeCents: 0,
		processingTime: 'sofort bei Terminwahrnehmung',
		requiredTrust: 'basis',
		action: 'termin'
	},
	{
		slug: 'abmeldung-wohnsitz',
		name: 'Wegzug oder Auszug abmelden',
		office: 'buergeramt',
		summary: 'Abmeldung bei Wegzug ins Ausland oder Aufgabe einer Nebenwohnung.',
		description:
			'Ziehen Sie innerhalb Deutschlands um, genügt die Anmeldung am neuen Wohnort. Ziehen Sie ins Ausland oder geben Sie eine Nebenwohnung auf, müssen Sie sich abmelden. Die Abmeldung ist frühestens eine Woche vor dem Auszug möglich und kostenlos.',
		lebenslagen: ['umzug', 'wohnen'],
		keywords: ['Abmeldung', 'Auszug', 'Wegzug', 'Ausland', 'Nebenwohnung aufgeben'],
		documents: ['Gültiger Personalausweis oder Reisepass', 'Neue Anschrift im Ausland'],
		legalBasis: '§ 17 Abs. 2 Bundesmeldegesetz (BMG)',
		feeCents: 0,
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'personalausweis-beantragen',
		name: 'Personalausweis beantragen',
		office: 'buergeramt',
		summary: 'Neuer oder erstmaliger Personalausweis, auch bei Verlust oder Ablauf.',
		description:
			'Sie benötigen einen neuen Personalausweis, wenn Ihr Ausweis abläuft, verloren ging oder sich Angaben geändert haben. Der Antrag wird persönlich im Bürgeramt gestellt; Fingerabdrücke können freiwillig gespeichert werden. Die Bearbeitung durch die Bundesdruckerei dauert in der Regel etwa drei Wochen, Sie werden benachrichtigt.',
		lebenslagen: ['ausweise', 'umzug', 'geburt'],
		keywords: ['Perso', 'Ausweis', 'Identitätskarte', 'Ausweis verloren', 'Ausweis verlängern'],
		documents: [
			'Biometrisches Passfoto (35 × 45 mm)',
			'Bisheriger Ausweis oder Reisepass',
			'Geburtsurkunde bei Erstausstellung',
			'Verlustanzeige bei Verlust'
		],
		legalBasis: '§§ 1, 9 Personalausweisgesetz (PAuswG)',
		feeCents: 3700,
		feeNote: 'ab 24 Jahren; unter 24 Jahren 22,80 €',
		processingTime: 'ca. 3 Wochen',
		requiredTrust: 'basis',
		action: 'termin'
	},
	{
		slug: 'reisepass-beantragen',
		name: 'Reisepass beantragen',
		office: 'buergeramt',
		summary:
			'Neuer Reisepass für Reisen außerhalb des Schengen-Raums, auf Wunsch im Expressverfahren.',
		description:
			'Den Reisepass beantragen Sie persönlich im Bürgeramt. Fingerabdrücke werden ab dem sechsten Lebensjahr erfasst. Gegen einen Aufpreis ist ein Expressverfahren möglich, bei dem der Pass nach etwa vier Werktagen vorliegt.',
		lebenslagen: ['ausweise', 'geburt', 'kinder'],
		keywords: ['Pass', 'Reisepass verlängern', 'Urlaub', 'Auslandsreise', 'Kinderreisepass'],
		documents: [
			'Biometrisches Passfoto (35 × 45 mm)',
			'Bisheriger Reisepass oder Personalausweis',
			'Geburtsurkunde bei Erstausstellung',
			'Einverständnis der Sorgeberechtigten bei Minderjährigen'
		],
		legalBasis: '§ 6 Passgesetz (PassG)',
		feeCents: 6000,
		feeNote: 'ab 24 Jahren; Expressverfahren zzgl. 32 €',
		processingTime: 'ca. 4 Wochen, Express 4 Werktage',
		requiredTrust: 'basis',
		action: 'termin'
	},
	{
		slug: 'fuehrungszeugnis-beantragen',
		name: 'Führungszeugnis beantragen',
		office: 'buergeramt',
		summary: 'Auszug aus dem Bundeszentralregister, zum Beispiel für Arbeitgeber oder Ehrenämter.',
		description:
			'Das Führungszeugnis gibt Auskunft über Eintragungen im Bundeszentralregister. Es wird persönlich beim Bürgeramt oder online mit Online-Ausweis beantragt und vom Bundesamt für Justiz in Bonn erstellt. Das Zeugnis wird an Ihre Meldeanschrift gesendet.',
		lebenslagen: ['ausweise', 'kinder'],
		keywords: [
			'polizeiliches Führungszeugnis',
			'Leumundszeugnis',
			'erweitertes Führungszeugnis',
			'Zeugnis Bundesamt für Justiz'
		],
		documents: [
			'Gültiger Personalausweis oder Reisepass',
			'Aufforderung der Stelle, die das Zeugnis verlangt (bei erweitertem oder gebührenfreiem Antrag)'
		],
		legalBasis: '§ 30 Abs. 1 Bundeszentralregistergesetz (BZRG)',
		feeCents: 1300,
		feeNote: 'gebührenfrei für Ehrenamt auf Nachweis',
		processingTime: 'ca. 2 Wochen',
		requiredTrust: 'hoch',
		action: 'termin'
	},
	{
		slug: 'beglaubigung-dokumente',
		name: 'Beglaubigung von Dokumenten',
		office: 'buergeramt',
		summary: 'Amtliche Beglaubigung von Kopien und Unterschriften für den Gebrauch bei Behörden.',
		description:
			'Das Bürgeramt beglaubigt, dass eine Kopie mit dem vorgelegten Original übereinstimmt. Bringen Sie dazu das Original und die Kopie mit. Für Dokumente, die im Ausland verwendet werden sollen, ist eine Apostille oder Legalisation nötig, die hier nicht ausgestellt wird.',
		lebenslagen: ['ausweise', 'umzug', 'heirat'],
		keywords: ['beglaubigte Kopie', 'Kopie beglaubigen', 'Unterschrift beglaubigen', 'Amtssiegel'],
		documents: ['Originaldokument', 'Kopie des Dokuments', 'Gültiger Lichtbildausweis'],
		legalBasis: '§ 33 Verwaltungsverfahrensgesetz (VwVfG)',
		feeCents: 200,
		feeNote: 'je Beglaubigung, ab 2 €',
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'melderegisterauskunft',
		name: 'Melderegisterauskunft beantragen',
		office: 'buergeramt',
		summary: 'Einfache Auskunft über Namen und Anschrift einer Person aus dem Melderegister.',
		description:
			'Jede Person kann eine einfache Melderegisterauskunft über Name und Anschrift anderer Einwohner beantragen, sofern keine Auskunftssperre besteht. Betroffene werden nicht in jedem Fall informiert. Die Auskunft wird schriftlich erteilt.',
		lebenslagen: ['umzug', 'wohnen'],
		keywords: ['Adressauskunft', 'Einwohnermeldeamt Auskunft', 'Anschrift ermitteln'],
		documents: [
			'Vollständiger Name und Geburtsdatum oder letzte bekannte Anschrift der gesuchten Person'
		],
		legalBasis: '§§ 44, 45 Bundesmeldegesetz (BMG)',
		feeCents: 800,
		processingTime: '3–5 Werktage',
		requiredTrust: 'substanziell',
		action: 'info'
	},
	{
		slug: 'wohnungsgeberbestaetigung',
		name: 'Wohnungsgeberbestätigung',
		office: 'buergeramt',
		summary: 'Bestätigung des Vermieters über Ein- oder Auszug, nötig für jede Anmeldung.',
		description:
			'Der Wohnungsgeber, also Vermieter oder Eigentümer, muss den Einzug schriftlich bestätigen. Ein Vordruck steht als Formular bereit. Ohne diese Bestätigung kann die Anmeldung im Bürgeramt nicht abgeschlossen werden.',
		lebenslagen: ['umzug', 'wohnen'],
		keywords: [
			'Vermieterbescheinigung',
			'Einzugsbestätigung',
			'Mietbescheinigung',
			'Wohnungsgeber'
		],
		documents: ['Ausgefüllte Wohnungsgeberbestätigung mit Unterschrift des Wohnungsgebers'],
		legalBasis: '§ 19 Bundesmeldegesetz (BMG)',
		feeCents: 0,
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'info'
	}
];

export const standesamtServices: ServiceSeed[] = [
	{
		slug: 'eheschliessung-anmelden',
		name: 'Eheschließung anmelden',
		office: 'standesamt',
		summary: 'Anmeldung Ihrer Eheschließung beim Standesamt und Terminabstimmung für die Trauung.',
		description:
			'Die Anmeldung der Eheschließung erfolgt gemeinsam im Standesamt, frühestens sechs Monate vor dem geplanten Termin. Dabei prüfen wir die Ehefähigkeit und besprechen Namensführung, Trauzeugen und gewünschte Trauorte. Planen Sie für das Gespräch etwa 30 Minuten ein.',
		lebenslagen: ['heirat'],
		keywords: ['Hochzeit', 'Trauung', 'heiraten', 'Standesamt Anmeldung', 'Ehe schließen'],
		documents: [
			'Gültige Personalausweise oder Reisepässe beider Partner',
			'Aktuelle beglaubigte Abschrift aus dem Geburtenregister',
			'Aktuelle Meldebescheinigung',
			'Bei Scheidung: rechtskräftiges Scheidungsurteil'
		],
		legalBasis: '§ 12 Personenstandsgesetz (PStG), § 1310 BGB',
		feeCents: 8000,
		feeNote: 'inklusive Trauung zu regulären Zeiten',
		processingTime: 'Anmeldung 30 Minuten, Trauung nach Terminvereinbarung',
		requiredTrust: 'basis',
		action: 'termin'
	},
	{
		slug: 'geburtsurkunde-beantragen',
		name: 'Geburtsurkunde beantragen',
		office: 'standesamt',
		summary: 'Beglaubigte Abschrift oder Urkunde aus dem Geburtenregister.',
		description:
			'Eine Geburtsurkunde benötigen Sie unter anderem für Elterngeld, Kindergeld, Schule, Heirat oder Rentenanträge. Berechtigt sind die Person selbst, Ehepartner, Eltern und Kinder. Haben wir die Geburt beurkundet, erhalten Sie die Urkunde sofort, andernfalls fordern wir sie beim zuständigen Standesamt an.',
		lebenslagen: ['geburt', 'kinder', 'heirat', 'ausweise'],
		keywords: ['Geburtsurkunde', 'Urkunde Geburt', 'Abstammungsurkunde', 'Zweitschrift'],
		documents: [
			'Gültiger Lichtbildausweis',
			'Angaben zu Geburtsdatum, Geburtsort und Eltern',
			'Nachweis des rechtlichen Interesses bei entfernter Verwandtschaft'
		],
		legalBasis: '§ 59 Personenstandsgesetz (PStG)',
		feeCents: 1000,
		feeNote: 'je Ausfertigung',
		processingTime: 'sofort bis 5 Werktage',
		requiredTrust: 'basis',
		action: 'termin'
	},
	{
		slug: 'sterbeurkunde-beantragen',
		name: 'Sterbeurkunde beantragen',
		office: 'standesamt',
		summary: 'Sterbeurkunde für Angehörige, zum Beispiel für Bank, Versicherung oder Rentenstelle.',
		description:
			'Nach einem Todesfall stellt das Standesamt die Sterbeurkunde aus. Sie benötigen sie für Nachlassgericht, Banken, Versicherungen und Rentenversicherung. Antragsberechtigt sind Angehörige und Personen mit rechtlichem Interesse. Wir empfehlen, mehrere Ausfertigungen zu bestellen.',
		lebenslagen: ['tod'],
		keywords: ['Todesbescheinigung', 'Todesfall', 'Urkunde Tod', 'Beerdigung', 'Erbfall'],
		documents: [
			'Gültiger Lichtbildausweis der antragstellenden Person',
			'Nachweis der Verwandtschaft oder des rechtlichen Interesses',
			'Ärztliche Todesbescheinigung (bei Anzeige des Sterbefalls)'
		],
		legalBasis: '§ 60 Personenstandsgesetz (PStG)',
		feeCents: 1000,
		feeNote: 'je Ausfertigung',
		processingTime: '2–3 Werktage',
		requiredTrust: 'substanziell',
		action: 'termin'
	},
	{
		slug: 'geburt-anzeigen',
		name: 'Geburt eines Kindes anzeigen',
		office: 'standesamt',
		summary: 'Anzeige der Geburt innerhalb einer Woche und Beurkundung im Geburtenregister.',
		description:
			'Die Geburt eines Kindes muss innerhalb einer Woche beim Standesamt angezeigt werden. Bei Geburten im Krankenhaus übernimmt meist die Klinik die Meldung; Eltern ergänzen Namenswahl und Urkundenwünsche. Anschließend erhalten Sie die Geburtsurkunden für Elterngeld und Kindergeld.',
		lebenslagen: ['geburt', 'kinder'],
		keywords: [
			'Neugeborenes',
			'Baby anmelden',
			'Namensgebung',
			'Geburtsanzeige',
			'Geburtsanmeldung'
		],
		documents: [
			'Geburtsbescheinigung der Klinik oder Hebamme',
			'Personalausweise der Eltern',
			'Heiratsurkunde oder Vaterschaftsanerkennung, sofern vorhanden'
		],
		legalBasis: '§ 18 Personenstandsgesetz (PStG)',
		feeCents: 0,
		processingTime: '1–3 Werktage',
		requiredTrust: 'substanziell',
		action: 'info'
	},
	{
		slug: 'namensaenderung',
		name: 'Namensänderung beantragen',
		office: 'standesamt',
		summary: 'Öffentlich-rechtliche Änderung des Vor- oder Familiennamens aus wichtigem Grund.',
		description:
			'Ein Name kann nur aus wichtigem Grund geändert werden, etwa bei untragbaren oder stark belastenden Namen. Der Antrag wird schriftlich gestellt und von der Namensänderungsbehörde sorgfältig geprüft. Stellen Sie sich auf eine Bearbeitungszeit von mehreren Wochen ein.',
		lebenslagen: ['heirat', 'kinder', 'ausweise'],
		keywords: ['Name ändern', 'Familienname ändern', 'Vorname ändern', 'Namenswechsel'],
		documents: [
			'Begründung des Antrags',
			'Geburtsurkunde',
			'Gültiger Lichtbildausweis',
			'Aktuelles polizeiliches Führungszeugnis'
		],
		legalBasis: '§ 3 Namensänderungsgesetz (NamÄndG)',
		feeCents: 2500,
		feeNote: 'Rahmengebühr je nach Aufwand, bis ca. 1.000 €',
		processingTime: '6–12 Wochen',
		requiredTrust: 'hoch',
		action: 'info'
	},
	{
		slug: 'kirchenaustritt',
		name: 'Kirchenaustritt erklären',
		office: 'standesamt',
		summary: 'Austrittserklärung aus einer Religionsgemeinschaft des öffentlichen Rechts.',
		description:
			'Den Austritt erklären Sie persönlich im Standesamt zur Niederschrift. Er wird mit Zugang der Erklärung wirksam; die Kirchensteuerpflicht endet mit Ablauf des Monats. Eine Bescheinigung über den Austritt erhalten Sie sofort.',
		lebenslagen: ['heirat', 'ausweise'],
		keywords: ['Kirche verlassen', 'austreten', 'Kirchensteuer', 'Religionsgemeinschaft'],
		documents: ['Gültiger Lichtbildausweis'],
		legalBasis: 'Art. 4 Abs. 1 GG; Kirchenaustrittsgesetz (KiAustrG) des Landes',
		feeCents: 3000,
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'info'
	}
];

export const kfzServices: ServiceSeed[] = [
	{
		slug: 'kfz-ummeldung',
		name: 'Fahrzeug ummelden',
		office: 'kfz-zulassung',
		summary:
			'Ummeldung bei Umzug, Halterwechsel oder Fahrzeugkauf innerhalb der Zulassungsbehörde.',
		description:
			'Nach einem Umzug oder dem Kauf eines gebrauchten Fahrzeugs muss die Zulassung auf die neue Anschrift oder den neuen Halter geändert werden. Bringen Sie das Fahrzeug nicht mit; die Plaketten werden vor Ort ausgegeben. Bei Zulassung im selben Bezirk bleibt das Kennzeichen oft erhalten.',
		lebenslagen: ['auto', 'umzug'],
		keywords: [
			'Halterwechsel',
			'Fahrzeug anmelden',
			'Auto ummelden',
			'Zulassungsbescheinigung',
			'Kennzeichen behalten'
		],
		documents: [
			'Zulassungsbescheinigung Teil I und Teil II',
			'Gültiger Personalausweis',
			'Aktuelle eVB-Nummer der Kfz-Versicherung',
			'Nachweis der Hauptuntersuchung (HU)',
			'SEPA-Lastschriftmandat für die Kfz-Steuer'
		],
		legalBasis: '§ 13 Fahrzeug-Zulassungsverordnung (FZV)',
		feeCents: 2900,
		feeNote: 'zzgl. Kennzeichenschilder',
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'termin'
	},
	{
		slug: 'i-kfz-internetbasierte-zulassung',
		name: 'Fahrzeug online zulassen (i-Kfz)',
		office: 'kfz-zulassung',
		summary: 'Zulassung, Wiederzulassung und Abmeldung von Fahrzeugen vollständig online.',
		description:
			'Mit der internetbasierten Zulassung (i-Kfz) melden Sie Ihr Fahrzeug von zu Hause an oder ab. Sie benötigen den Online-Ausweis, die Sicherheitscodes auf Ihren Fahrzeugpapieren und eine eVB-Nummer. Das Verfahren wird zentral vom Kraftfahrt-Bundesamt betrieben, nicht von Musterstadt.',
		lebenslagen: ['auto'],
		keywords: [
			'online zulassen',
			'iKFZ',
			'Auto online anmelden',
			'Fahrzeug online abmelden',
			'Wiederzulassung'
		],
		documents: [
			'Online-Ausweis (eID) mit PIN',
			'Zulassungsbescheinigung Teil I und II mit freigerubbelten Sicherheitscodes',
			'eVB-Nummer der Kfz-Versicherung',
			'Kennzeichen mit Sicherheitscode'
		],
		legalBasis: '§§ 15a ff. Fahrzeug-Zulassungsverordnung (FZV)',
		feeCents: 2900,
		feeNote: 'Gebühren abhängig vom Vorgang',
		processingTime: 'meist sofort, Plakette per Post nach 3–5 Werktagen',
		requiredTrust: 'hoch',
		action: 'efa',
		efaProvider: 'Kraftfahrt-Bundesamt – i-Kfz-Portal',
		efaUrl: 'https://ikfz.kba.example/zulassung'
	},
	{
		slug: 'kfz-ausserbetriebsetzung',
		name: 'Fahrzeug abmelden',
		office: 'kfz-zulassung',
		summary: 'Vorübergehende oder endgültige Stilllegung Ihres Fahrzeugs.',
		description:
			'Wird ein Fahrzeug nicht mehr genutzt, muss es abgemeldet werden, damit keine Steuer und Versicherung weiterlaufen. Sie können die Stilllegung vor Ort oder online mit Online-Ausweis vornehmen. Ein Fahrzeug darf nach der Abmeldung nicht auf öffentlichen Straßen abgestellt werden.',
		lebenslagen: ['auto'],
		keywords: [
			'Auto abmelden',
			'Fahrzeug stilllegen',
			'Saisonkennzeichen',
			'Verschrottung',
			'Verkauf Auto'
		],
		documents: [
			'Zulassungsbescheinigung Teil I und Teil II',
			'Kennzeichenschilder',
			'Gültiger Personalausweis'
		],
		legalBasis: '§ 14 Fahrzeug-Zulassungsverordnung (FZV)',
		feeCents: 1000,
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'fuehrerschein-umtausch',
		name: 'Führerschein umtauschen',
		office: 'kfz-zulassung',
		summary: 'Pflichtumtausch alter Führerscheine in das EU-Kartenformat.',
		description:
			'Führerscheine, die vor dem 19. Januar 2013 ausgestellt wurden, müssen nach einem festen Stufenplan in den EU-Kartenführerschein umgetauscht werden. Die Fahrerlaubnisklassen bleiben erhalten, es ist keine neue Prüfung nötig. Die neue Karte wird in der Bundesdruckerei produziert und Ihnen zur Abholung bereitgestellt.',
		lebenslagen: ['auto', 'ausweise'],
		keywords: ['Führerschein erneuern', 'Fahrerlaubnis', 'Kartenführerschein', 'grauer Lappen'],
		documents: [
			'Gültiger Personalausweis',
			'Aktueller bisheriger Führerschein',
			'Biometrisches Passfoto',
			'Karteikartenabschrift des früheren Wohnorts (falls auswärts ausgestellt)'
		],
		legalBasis: '§ 24a Fahrerlaubnis-Verordnung (FeV)',
		feeCents: 2530,
		processingTime: 'ca. 4 Wochen',
		requiredTrust: 'basis',
		action: 'info'
	}
];
