import type { ServiceSeed } from './types';

export const ordnungsamtServices: ServiceSeed[] = [
	{
		slug: 'anwohnerparkausweis',
		name: 'Anwohnerparkausweis beantragen',
		office: 'ordnungsamt',
		summary: 'Bevorrechtigtes Parken in Ihrer Parkzone für Anwohnerinnen und Anwohner.',
		description:
			'Mit dem Anwohnerparkausweis dürfen Sie in Ihrer Bewohnerparkzone ohne Parkscheibe oder Parkschein parken. Den Ausweis erhalten Sie nur für das Fahrzeug, das auf Ihre Meldeanschrift zugelassen ist. Beantragen Sie ihn online und laden Sie die Zulassungsbescheinigung Teil I hoch.',
		lebenslagen: ['wohnen', 'auto', 'umzug'],
		keywords: [
			'Bewohnerparkausweis',
			'Parkausweis',
			'Parkvignette',
			'Anwohnerparken',
			'Parkzone',
			'Parken Innenstadt'
		],
		documents: [
			'Zulassungsbescheinigung Teil I (Fahrzeugschein)',
			'Gültiger Personalausweis mit Meldeanschrift in der Parkzone',
			'Bei abweichendem Halter: Nutzungsbestätigung des Halters'
		],
		legalBasis: '§ 45 Abs. 1b Satz 1 Nr. 2a Straßenverkehrs-Ordnung (StVO)',
		feeCents: 3000,
		feeNote: 'pro Jahr',
		processingTime: '3–5 Werktage',
		requiredTrust: 'basis',
		action: 'antrag',
		wizardSlug: 'anwohnerparkausweis'
	},
	{
		slug: 'hundesteuer-anmelden',
		name: 'Hund anmelden und Hundesteuer zahlen',
		office: 'ordnungsamt',
		summary: 'Anmeldung eines Hundes innerhalb von zwei Wochen nach Anschaffung oder Zuzug.',
		description:
			'Hundehalter müssen ihren Hund innerhalb von zwei Wochen bei der Stadt anmelden. Für die Anmeldung werden Rasse, Geburtsdatum und Chipnummer benötigt. Sie erhalten daraufhin Hundemarke und Steuerbescheid; für Listenhunde gelten höhere Steuersätze und besondere Auflagen.',
		lebenslagen: ['hund', 'wohnen', 'umzug'],
		keywords: [
			'Hundemarke',
			'Hund anschaffen',
			'Welpe',
			'Hundehalter',
			'Steuer Hund',
			'Chipnummer'
		],
		documents: [
			'Chipnummer oder Tätowiernummer des Hundes',
			'Impfpass bzw. EU-Heimtierausweis',
			'Kaufvertrag oder Abgabebescheinigung'
		],
		legalBasis: 'Hundesteuersatzung der Stadt Musterstadt; Kommunalabgabengesetz des Landes (KAG)',
		feeCents: 0,
		feeNote: 'Hundesteuer 96 € jährlich für den ersten Hund',
		processingTime: '5–7 Werktage',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'hund-ummelden',
		name: 'Hund ummelden oder abmelden',
		office: 'ordnungsamt',
		summary: 'Mitteilung bei Umzug, Verkauf, Abgabe oder Tod Ihres Hundes.',
		description:
			'Verändert sich Ihre Situation, etwa durch Umzug innerhalb der Stadt, Verkauf oder Tod des Tieres, melden Sie dies dem Ordnungsamt. Nur so endet die Steuerpflicht rechtzeitig. Teilen Sie uns das Datum der Veränderung schriftlich oder per E-Mail mit.',
		lebenslagen: ['hund', 'umzug'],
		keywords: ['Hund abmelden', 'Hund verstorben', 'Hund verkauft', 'Hundemarke zurückgeben'],
		documents: ['Hundemarke', 'Nachweis über Verkauf, Abgabe oder tierärztliche Bescheinigung'],
		legalBasis: 'Hundesteuersatzung der Stadt Musterstadt',
		feeCents: 0,
		processingTime: '5 Werktage',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'sperrmuell-anmelden',
		name: 'Sperrmüll anmelden',
		office: 'ordnungsamt',
		summary: 'Abholung sperriger Haushaltsgegenstände zu einem festen Termin.',
		description:
			'Sperrmüll holen wir zweimal im Jahr kostenlos bei Ihnen ab. Melden Sie die Abholung mindestens zehn Tage vorher an und stellen Sie die Gegenstände am Abholtag bis 6 Uhr an den Straßenrand. Elektrogeräte, Bauschutt und Gefahrstoffe sind ausgeschlossen.',
		lebenslagen: ['wohnen', 'umwelt', 'umzug'],
		keywords: ['Sperrmüll', 'Sperrgut', 'Möbel entsorgen', 'Abfuhr', 'Entrümpelung'],
		documents: ['Angaben zu Art und Menge des Sperrguts'],
		legalBasis: '§ 20 Kreislaufwirtschaftsgesetz (KrWG); Abfallsatzung der Stadt Musterstadt',
		feeCents: 0,
		feeNote: 'zwei Abholungen je Haushalt und Jahr kostenfrei',
		processingTime: 'Abholung innerhalb von 14 Tagen',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'fundsache-melden',
		name: 'Fundsache melden oder abholen',
		office: 'ordnungsamt',
		summary: 'Fundbüro: Gefundene Sachen abgeben und verlorene Gegenstände suchen.',
		description:
			'Gefundene Gegenstände im Wert von über 10 Euro müssen beim Fundbüro abgegeben werden. Verlorene Sachen können Sie mit einer genauen Beschreibung melden und nach Ablauf der Bearbeitung abholen. Nach sechs Monaten fällt das Eigentum an den Finder oder die Stadt.',
		lebenslagen: ['wohnen'],
		keywords: [
			'Fundbüro',
			'verloren',
			'Handy gefunden',
			'Schlüssel',
			'Portemonnaie',
			'Fahrrad gefunden'
		],
		documents: ['Gültiger Lichtbildausweis', 'Beschreibung des Gegenstands, Ort und Zeitpunkt'],
		legalBasis: '§§ 965–978 Bürgerliches Gesetzbuch (BGB)',
		feeCents: 0,
		feeNote: 'Gebühr bei Abholung nach Wert des Fundstücks',
		processingTime: 'sofort',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'gewerbeanmeldung',
		name: 'Gewerbe anmelden',
		office: 'ordnungsamt',
		summary: 'Anmeldung, Ummeldung und Abmeldung eines Gewerbebetriebs.',
		description:
			'Wer ein Gewerbe beginnt, muss dies bei der Stadt anzeigen. Wir leiten Ihre Anmeldung automatisch an Finanzamt, Handwerkskammer oder IHK und Berufsgenossenschaft weiter. Für erlaubnispflichtige Gewerbe benötigen Sie zusätzlich eine Genehmigung.',
		lebenslagen: ['wohnen'],
		keywords: [
			'Selbstständigkeit',
			'Gewerbeschein',
			'Kleingewerbe',
			'Existenzgründung',
			'Gewerbe ummelden'
		],
		documents: [
			'Gültiger Personalausweis',
			'Gewerbliche Anschrift und Beschreibung der Tätigkeit',
			'Ggf. Handwerkskarte oder Handelsregisterauszug'
		],
		legalBasis: '§ 14 Gewerbeordnung (GewO)',
		feeCents: 2000,
		feeNote: 'je nach Gewerbeart 15–60 €',
		processingTime: 'sofort bis 3 Werktage',
		requiredTrust: 'substanziell',
		action: 'info'
	},
	{
		slug: 'sondernutzungserlaubnis',
		name: 'Sondernutzungserlaubnis für öffentliche Straßen',
		office: 'ordnungsamt',
		summary:
			'Erlaubnis für Warenauslagen, Gastronomieflächen und Werbeaufsteller auf öffentlichem Grund.',
		description:
			'Wer öffentlichen Straßenraum über den Gemeingebrauch hinaus nutzen will, braucht eine Sondernutzungserlaubnis. Dazu zählen zum Beispiel Außengastronomie, Verkaufsstände und Baugerüste. Reichen Sie den Antrag mindestens vier Wochen vor Beginn der Nutzung mit Lageplan ein.',
		lebenslagen: ['bauen', 'wohnen'],
		keywords: ['Außengastronomie', 'Warenauslage', 'Verkaufsstand', 'Baugerüst', 'Werbeaufsteller'],
		documents: [
			'Lageplan mit Maßangaben',
			'Beschreibung der geplanten Nutzung',
			'Gewerbeanmeldung'
		],
		legalBasis: '§ 8 Bundesfernstraßengesetz (FStrG) bzw. Straßengesetz des Landes',
		feeCents: 5000,
		feeNote: 'zzgl. Nutzungsgebühr nach Satzung',
		processingTime: '2–4 Wochen',
		requiredTrust: 'substanziell',
		action: 'info'
	},
	{
		slug: 'strassenfest-anmelden',
		name: 'Straßenfest oder Veranstaltung anmelden',
		office: 'ordnungsamt',
		summary: 'Anzeige von Straßenfesten, Flohmärkten und Veranstaltungen im öffentlichen Raum.',
		description:
			'Für Nachbarschaftsfeste, Flohmärkte oder Umzüge im öffentlichen Raum benötigen Sie in der Regel eine Erlaubnis. Das Ordnungsamt prüft Sperrungen, Lärmschutz, Hygiene und Sicherheit. Melden Sie Ihr Vorhaben mindestens sechs Wochen im Voraus an.',
		lebenslagen: ['wohnen', 'umwelt'],
		keywords: ['Straßenfest', 'Straßensperrung', 'Flohmarkt', 'Hoffest', 'Veranstaltungsanmeldung'],
		documents: [
			'Veranstaltungsbeschreibung mit Zeitraum und erwarteter Besucherzahl',
			'Lageplan',
			'Sicherheits- und Hygienekonzept bei größeren Veranstaltungen'
		],
		legalBasis: '§ 29 Abs. 2 Straßenverkehrs-Ordnung (StVO)',
		feeCents: 3500,
		processingTime: '2–6 Wochen',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'gaststaettenerlaubnis',
		name: 'Gaststättenerlaubnis beantragen',
		office: 'ordnungsamt',
		summary: 'Erlaubnis zum Betrieb einer Gaststätte, eines Cafés oder einer Bar.',
		description:
			'Wer Alkohol ausschenken oder eine Gaststätte betreiben möchte, braucht eine Gaststättenerlaubnis. Wir prüfen Zuverlässigkeit, Räumlichkeiten und Brandschutz. Bei vorübergehenden Anlässen kann eine Gestattung nach Landesgaststättengesetz genügen.',
		lebenslagen: ['bauen', 'wohnen'],
		keywords: ['Kneipe', 'Restaurant eröffnen', 'Café', 'Schankerlaubnis', 'Gaststättenkonzession'],
		documents: [
			'Gewerbeanmeldung',
			'Führungszeugnis zur Vorlage bei Behörden',
			'Unterrichtungsnachweis der IHK',
			'Grundrisszeichnung der Räume'
		],
		legalBasis: 'Landesgaststättengesetz; § 2 Gaststättengesetz (GastG)',
		feeCents: 15000,
		feeNote: 'je nach Umfang 150–600 €',
		processingTime: '4–8 Wochen',
		requiredTrust: 'substanziell',
		action: 'info'
	},
	{
		slug: 'laermschutz-beschwerde',
		name: 'Lärmbelästigung melden',
		office: 'ordnungsamt',
		summary: 'Beschwerde über ruhestörenden Lärm, Baulärm oder gewerbliche Emissionen.',
		description:
			'Anhaltender oder nächtlicher Lärm kann gegen die Nachtruhe oder Immissionsschutzvorschriften verstoßen. Schildern Sie uns Ort, Zeiten und Art der Störung. Wir prüfen den Sachverhalt und leiten bei Bedarf ein Verfahren gegen den Verursacher ein.',
		lebenslagen: ['wohnen', 'umwelt'],
		keywords: ['Ruhestörung', 'Nachbarschaftslärm', 'Baulärm', 'Lärmbeschwerde', 'Nachtruhe'],
		documents: ['Lärmprotokoll mit Datum, Uhrzeit und Art der Störung'],
		legalBasis: '§ 22 Bundes-Immissionsschutzgesetz (BImSchG); Landes-Immissionsschutzgesetz',
		feeCents: 0,
		processingTime: 'Rückmeldung innerhalb von 10 Werktagen',
		requiredTrust: 'basis',
		action: 'info'
	}
];

export const bauamtServices: ServiceSeed[] = [
	{
		slug: 'baugenehmigung-beratung',
		name: 'Beratung zur Baugenehmigung',
		office: 'bauamt',
		summary: 'Persönliche Erstberatung vor Neubau, Anbau oder Nutzungsänderung.',
		description:
			'In der Bauberatung klären wir, ob Ihr Vorhaben genehmigungspflichtig ist und welche Unterlagen Sie benötigen. Bringen Sie Lageplan und erste Skizzen mit. Die Beratung ist kostenlos; der Bauantrag selbst wird anschließend über das Land-Portal gestellt.',
		lebenslagen: ['bauen', 'wohnen'],
		keywords: ['Bauantrag', 'Neubau', 'Anbau', 'Carport', 'Dachausbau', 'Bauberatung'],
		documents: ['Amtlicher Lageplan', 'Skizzen oder Entwürfe', 'Grundbuchauszug (Kopie)'],
		legalBasis: '§§ 29 ff. Baugesetzbuch (BauGB); Landesbauordnung (LBO)',
		feeCents: 0,
		processingTime: 'Beratungstermin 30 Minuten',
		requiredTrust: 'basis',
		action: 'termin'
	},
	{
		slug: 'bauvoranfrage',
		name: 'Bauvoranfrage stellen',
		office: 'bauamt',
		summary: 'Verbindliche Vorabklärung einzelner Fragen zu Ihrem Bauvorhaben.',
		description:
			'Mit der Bauvoranfrage klären Sie vor dem teuren Bauantrag grundsätzliche Fragen, etwa ob ein Grundstück bebaubar ist. Der positive Bauvorbescheid bindet die Behörde für drei Jahre. Reichen Sie Lageplan und eine kurze Beschreibung ein.',
		lebenslagen: ['bauen', 'wohnen'],
		keywords: ['Bauvorbescheid', 'Grundstück bebaubar', 'Vorbescheid', 'Bebauungsplan'],
		documents: ['Amtlicher Lageplan', 'Baubeschreibung', 'Konkrete Fragestellung'],
		legalBasis: 'Landesbauordnung (LBO), Bauvorbescheid; § 29 BauGB',
		feeCents: 15000,
		feeNote: 'nach Bauwert, mindestens 150 €',
		processingTime: '4–8 Wochen',
		requiredTrust: 'substanziell',
		action: 'info'
	},
	{
		slug: 'wohngeld',
		name: 'Wohngeld beantragen',
		office: 'bauamt',
		summary: 'Staatlicher Zuschuss zu Miete oder Belastung bei selbst genutztem Wohneigentum.',
		description:
			'Wohngeld erhalten Haushalte mit geringem Einkommen, die keine Transferleistungen beziehen. Die Höhe hängt von Haushaltsgröße, Einkommen und Miete ab. In Musterstadt nutzen wir hierfür das Online-Verfahren des Landes, bei dem Sie Ihren Antrag digital einreichen.',
		lebenslagen: ['wohnen', 'kinder'],
		keywords: ['Mietzuschuss', 'Lastenzuschuss', 'Wohnkosten', 'Zuschuss Miete', 'Wohngeldantrag'],
		documents: [
			'Mietvertrag oder Nachweis der Belastung',
			'Einkommensnachweise aller Haushaltsmitglieder',
			'Gültiger Personalausweis',
			'Meldebescheinigung'
		],
		legalBasis: '§ 1 Wohngeldgesetz (WoGG)',
		feeCents: 0,
		processingTime: '4–8 Wochen',
		requiredTrust: 'substanziell',
		action: 'efa',
		efaProvider: 'Land Musterland – Wohngeld digital',
		efaUrl: 'https://wohngeld.musterland.example/antrag'
	},
	{
		slug: 'wohnberechtigungsschein',
		name: 'Wohnberechtigungsschein beantragen',
		office: 'bauamt',
		summary: 'Nachweis für den Bezug einer öffentlich geförderten Sozialwohnung.',
		description:
			'Der Wohnberechtigungsschein (WBS) berechtigt zum Bezug einer geförderten Wohnung, wenn Ihr Einkommen bestimmte Grenzen nicht überschreitet. Er gilt in der Regel ein Jahr. Bitte reichen Sie aktuelle Einkommensnachweise ein.',
		lebenslagen: ['wohnen', 'umzug', 'kinder'],
		keywords: [
			'WBS',
			'Sozialwohnung',
			'geförderte Wohnung',
			'Wohnberechtigung',
			'bezahlbarer Wohnraum'
		],
		documents: [
			'Einkommensnachweise der letzten 12 Monate',
			'Meldebescheinigung',
			'Personalausweise aller Haushaltsmitglieder',
			'Mietvertrag der aktuellen Wohnung (sofern vorhanden)'
		],
		legalBasis: '§ 27 Wohnraumförderungsgesetz (WoFG)',
		feeCents: 0,
		processingTime: '3–4 Wochen',
		requiredTrust: 'substanziell',
		action: 'info'
	},
	{
		slug: 'baumfaellung-genehmigung',
		name: 'Baumfällung genehmigen lassen',
		office: 'bauamt',
		summary: 'Genehmigung zur Fällung geschützter Bäume auf Ihrem Grundstück.',
		description:
			'Bäume ab einem bestimmten Stammumfang stehen nach der Baumschutzsatzung unter Schutz und dürfen nur mit Genehmigung gefällt werden. Wir prüfen, ob ein Ersatz gepflanzt werden muss. In akuten Gefahrensituationen kann die Fällung vorab angezeigt werden.',
		lebenslagen: ['umwelt', 'bauen', 'wohnen'],
		keywords: ['Baum fällen', 'Baumschutz', 'Baumschutzsatzung', 'Ersatzpflanzung', 'Gartenbaum'],
		documents: [
			'Foto des Baums',
			'Lageplan des Grundstücks',
			'Begründung der Fällung, ggf. Gutachten'
		],
		legalBasis: '§ 29 Bundesnaturschutzgesetz (BNatSchG); Baumschutzsatzung Musterstadt',
		feeCents: 4000,
		processingTime: '3–6 Wochen',
		requiredTrust: 'basis',
		action: 'info'
	}
];

export const jugendamtServices: ServiceSeed[] = [
	{
		slug: 'elterngeld',
		name: 'Elterngeld beantragen',
		office: 'jugendamt',
		summary: 'Finanzielle Unterstützung für Eltern in den ersten Lebensmonaten ihres Kindes.',
		description:
			'Elterngeld gleicht einen Teil des Einkommensverlustes aus, wenn Sie nach der Geburt Ihr Kind betreuen. Basiselterngeld, ElterngeldPlus und Partnerschaftsbonus lassen sich flexibel kombinieren. Der Antrag wird online über ein Verfahren des Landes Bremen gestellt, das Musterstadt mitnutzt.',
		lebenslagen: ['geburt', 'kinder'],
		keywords: ['Elterngeldantrag', 'Elternzeit', 'ElterngeldPlus', 'Basiselterngeld', 'Babyzeit'],
		documents: [
			'Geburtsurkunde des Kindes (für Elterngeld)',
			'Einkommensnachweise der letzten 12 Monate vor der Geburt',
			'Bescheinigung der Krankenkasse über Mutterschaftsgeld',
			'Gültiger Personalausweis'
		],
		legalBasis: '§ 1 Bundeselterngeld- und Elternzeitgesetz (BEEG)',
		feeCents: 0,
		processingTime: '4–6 Wochen',
		requiredTrust: 'hoch',
		action: 'efa',
		efaProvider: 'Land Bremen – ElterngeldDigital',
		efaUrl: 'https://elterngelddigital.bremen.example/antrag'
	},
	{
		slug: 'kita-platz-anmelden',
		name: 'Kita-Platz anmelden',
		office: 'jugendamt',
		summary:
			'Vormerkung für Krippe, Kindergarten oder Tagespflege über das gemeinsame Kita-Portal.',
		description:
			'Eltern können ihr Kind frühzeitig für einen Betreuungsplatz in Musterstadt und Umgebung vormerken. Im Kita-Portal wählen Sie Wunscheinrichtungen und den gewünschten Betreuungsbeginn. Ab dem ersten Geburtstag besteht ein Rechtsanspruch auf einen Betreuungsplatz.',
		lebenslagen: ['kinder', 'geburt'],
		keywords: ['Kindergarten', 'Krippe', 'Betreuungsplatz', 'Kindertagesstätte', 'Tagesmutter'],
		documents: [
			'Geburtsurkunde oder Geburtsdatum des Kindes',
			'Meldebescheinigung der Eltern',
			'Nachweis über Berufstätigkeit (bei Bedarf)'
		],
		legalBasis: '§ 24 Sozialgesetzbuch Achtes Buch (SGB VIII)',
		feeCents: 0,
		processingTime: 'Rückmeldung vor Betreuungsbeginn',
		requiredTrust: 'substanziell',
		action: 'efa',
		efaProvider: 'Kita-Portal Musterland',
		efaUrl: 'https://kita-portal.musterland.example/vormerkung'
	},
	{
		slug: 'unterhaltsvorschuss',
		name: 'Unterhaltsvorschuss beantragen',
		office: 'jugendamt',
		summary:
			'Staatliche Leistung für Kinder Alleinerziehender, wenn kein oder zu wenig Unterhalt gezahlt wird.',
		description:
			'Alleinerziehende können für Kinder bis zum 18. Lebensjahr Unterhaltsvorschuss erhalten, wenn der andere Elternteil keinen oder zu wenig Unterhalt zahlt. Das Jugendamt prüft die Voraussetzungen und fordert den Unterhalt beim anderen Elternteil zurück. Beachten Sie Mitwirkungspflichten bei der Feststellung des Barunterhalts.',
		lebenslagen: ['kinder', 'wohnen'],
		keywords: ['Unterhalt', 'Alleinerziehend', 'Kindesunterhalt', 'Unterhaltsleistung', 'UVG'],
		documents: [
			'Geburtsurkunde des Kindes',
			'Nachweis über Unterhaltszahlungen',
			'Meldebescheinigung',
			'Angaben zum anderen Elternteil'
		],
		legalBasis: 'Unterhaltsvorschussgesetz (UVG)',
		feeCents: 0,
		processingTime: '4–8 Wochen',
		requiredTrust: 'hoch',
		action: 'info'
	},
	{
		slug: 'vaterschaftsanerkennung',
		name: 'Vaterschaft anerkennen',
		office: 'jugendamt',
		summary: 'Kostenlose öffentliche Beurkundung der Vaterschaftsanerkennung und Beistandschaft.',
		description:
			'Sind die Eltern bei der Geburt nicht verheiratet, kann der Vater seine Vaterschaft beim Jugendamt anerkennen. Die Beurkundung ist kostenlos, die Mutter muss zustimmen. Auf Wunsch beraten wir zur gemeinsamen Sorge und zum Namensrecht des Kindes.',
		lebenslagen: ['geburt', 'kinder'],
		keywords: [
			'Vaterschaftsanerkennung',
			'Sorgerecht',
			'gemeinsames Sorgerecht',
			'Vater eintragen'
		],
		documents: [
			'Gültige Personalausweise beider Elternteile',
			'Mutterpass oder Geburtsurkunde des Kindes',
			'Ggf. Geburtsurkunde des Vaters'
		],
		legalBasis: '§§ 1592 Nr. 2, 1597 BGB; § 59 SGB VIII',
		feeCents: 0,
		processingTime: 'Beurkundung sofort bei Terminwahrnehmung',
		requiredTrust: 'hoch',
		action: 'info'
	}
];

export const wahlamtServices: ServiceSeed[] = [
	{
		slug: 'briefwahl',
		name: 'Briefwahl beantragen',
		office: 'wahlamt',
		summary: 'Wahlschein und Briefwahlunterlagen für die bevorstehende Wahl online anfordern.',
		description:
			'Wenn Sie am Wahltag nicht ins Wahllokal gehen können oder wollen, wählen Sie per Brief. Sie erhalten Wahlschein, Stimmzettel und Rücksendeumschlag nach Hause oder an eine abweichende Anschrift. Die Unterlagen müssen spätestens am Wahltag um 18 Uhr beim Wahlamt eingehen.',
		lebenslagen: ['wahl'],
		keywords: [
			'Wahlschein',
			'Briefwahlunterlagen',
			'Wahl per Post',
			'Wahlbenachrichtigung',
			'Stimmabgabe'
		],
		documents: ['Wahlbenachrichtigung (mit Nummer)', 'Gültiges BundID-Konto'],
		legalBasis: '§ 36 Bundeswahlgesetz (BWahlG); § 27 Bundeswahlordnung (BWO)',
		feeCents: 0,
		processingTime: 'Versand innerhalb von 2–3 Werktagen',
		requiredTrust: 'basis',
		action: 'antrag',
		wizardSlug: 'briefwahl'
	},
	{
		slug: 'wahlhelfer-werden',
		name: 'Wahlhelferin oder Wahlhelfer werden',
		office: 'wahlamt',
		summary: 'Ehrenamtliche Mitarbeit im Wahlvorstand mit Erfrischungsgeld.',
		description:
			'Wahlhelfer sichern, dass Wahlen ordnungsgemäß und transparent ablaufen. Sie arbeiten im Wahlvorstand mit, zählen Stimmen aus und erhalten ein Erfrischungsgeld. Sie können sich für ein bestimmtes Wahllokal oder flexibel einsetzen lassen.',
		lebenslagen: ['wahl'],
		keywords: ['Wahlvorstand', 'Ehrenamt Wahl', 'Auszählung', 'Erfrischungsgeld'],
		documents: ['Name, Anschrift und Geburtsdatum', 'Einsatzwünsche (Wahllokal, Zeit)'],
		legalBasis: '§ 9 Bundeswahlgesetz (BWahlG)',
		feeCents: 0,
		processingTime: 'Rückmeldung vor der Wahl',
		requiredTrust: 'basis',
		action: 'info'
	},
	{
		slug: 'waehlerverzeichnis-einspruch',
		name: 'Einspruch gegen das Wählerverzeichnis',
		office: 'wahlamt',
		summary: 'Wählerverzeichnis einsehen und bei Fehlern Einspruch einlegen.',
		description:
			'Jede wahlberechtigte Person darf das Wählerverzeichnis zu den Öffnungszeiten einsehen. Fehlen Sie dort oder sind Angaben falsch, können Sie bis zum Ende der Einsichtsfrist Einspruch einlegen. Das Wahlamt entscheidet unverzüglich.',
		lebenslagen: ['wahl'],
		keywords: ['Wählerverzeichnis', 'Wahlberechtigung', 'nicht im Verzeichnis', 'Einspruch Wahl'],
		documents: ['Gültiger Personalausweis', 'Begründung des Einspruchs'],
		legalBasis: '§ 22 Bundeswahlordnung (BWO)',
		feeCents: 0,
		processingTime: 'Entscheidung unverzüglich',
		requiredTrust: 'basis',
		action: 'info'
	}
];
