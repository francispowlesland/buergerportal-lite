<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path configured; links are root-relative */
	import { project } from '#lib/geo.ts';
	import type { DefectCategory, DefectStatus } from '#lib/server/db/schema.ts';
	import { DEFECT_CATEGORY } from '#lib/labels.ts';

	export type MapPin = {
		id: number;
		reference: string;
		title: string;
		category: DefectCategory;
		status: DefectStatus;
		address: string;
		lat: number;
		lng: number;
	};

	let {
		pins = [],
		selectedId = null,
		onSelectPin
	}: {
		pins: MapPin[];
		selectedId?: number | null;
		onSelectPin?: (id: number) => void;
	} = $props();

	// Group/project pins
	const projectedPins = $derived(
		pins.map((pin) => {
			const pos = project(pin.lat, pin.lng);
			// Clamping between 4% and 96% to keep pins visually inside the map boundary
			const clampedX = Math.max(4, Math.min(96, pos.x));
			const clampedY = Math.max(4, Math.min(96, pos.y));
			return {
				...pin,
				x: clampedX,
				y: clampedY
			};
		})
	);

	function getStatusColor(status: DefectStatus): { bg: string; border: string; text: string } {
		switch (status) {
			case 'gemeldet':
				return { bg: 'bg-[#fbebcb]', border: 'border-[#8a4f00]', text: 'text-[#8a4f00]' };
			case 'in_bearbeitung':
				return { bg: 'bg-[#eaf1f8]', border: 'border-[#00467f]', text: 'text-[#00467f]' };
			case 'behoben':
				return { bg: 'bg-[#def0e5]', border: 'border-[#115630]', text: 'text-[#115630]' };
		}
	}
</script>

<div
	class="relative w-full overflow-hidden border-2 border-ink bg-[#e6ede9] select-none"
	style="aspect-ratio: 16/9; min-height: 320px;"
	role="region"
	aria-label="Übersichtskarte Musterstadt"
>
	<!-- Stylized SVG city map background (streets, river, districts) -->
	<svg
		class="pointer-events-none absolute inset-0 h-full w-full"
		viewBox="0 0 1000 562"
		preserveAspectRatio="none"
		aria-hidden="true"
	>
		<!-- River "Muster" -->
		<path
			d="M 0,210 Q 250,280 500,220 T 1000,260 L 1000,310 Q 750,270 500,270 T 0,260 Z"
			fill="#cadbe9"
			stroke="#9cb9d3"
			stroke-width="2"
		/>

		<!-- Green areas / parks -->
		<!-- Stadtpark -->
		<rect
			x="360"
			y="240"
			width="160"
			height="120"
			rx="4"
			fill="#d3e4d7"
			stroke="#b1ceb8"
			stroke-width="1.5"
		/>
		<text
			x="440"
			y="305"
			font-size="14"
			fill="#3c6e49"
			font-family="sans-serif"
			font-weight="bold"
			text-anchor="middle"
		>
			Stadtpark
		</text>

		<!-- Waldgebiet / Stadtwald -->
		<polygon
			points="760,40 960,30 980,180 820,160"
			fill="#d3e4d7"
			stroke="#b1ceb8"
			stroke-width="1.5"
		/>
		<text
			x="880"
			y="100"
			font-size="14"
			fill="#3c6e49"
			font-family="sans-serif"
			font-weight="bold"
			text-anchor="middle"
		>
			Stadtwald
		</text>

		<!-- Main Arteries / Streets -->
		<!-- B42 Hauptstraße (West-East) -->
		<path d="M 0,180 L 1000,180" stroke="#fbfcfb" stroke-width="14" />
		<path d="M 0,180 L 1000,180" stroke="#b9c3c0" stroke-width="14" stroke-dasharray="2 12" />
		<path d="M 0,173 L 1000,173" stroke="#8c9c98" stroke-width="1.5" />
		<path d="M 0,187 L 1000,187" stroke="#8c9c98" stroke-width="1.5" />

		<!-- Bahnhofstraße / Allee (North-South) -->
		<path d="M 480,0 L 480,562" stroke="#fbfcfb" stroke-width="12" />
		<path d="M 474,0 L 474,562" stroke="#8c9c98" stroke-width="1.5" />
		<path d="M 486,0 L 486,562" stroke="#8c9c98" stroke-width="1.5" />

		<!-- Ringstraße (Diagonal) -->
		<path d="M 120,562 L 850,0" stroke="#fbfcfb" stroke-width="10" />
		<path d="M 120,562 L 850,0" stroke="#8c9c98" stroke-width="1.5" />

		<!-- Secondary streets grid -->
		<path
			d="M 220,60 L 220,500 M 740,60 L 740,520 M 60,380 L 940,380 M 80,80 L 920,80"
			stroke="#d5deda"
			stroke-width="5"
		/>

		<!-- Railway Line + Train Station -->
		<path d="M 0,460 L 1000,460" stroke="#4a5966" stroke-width="3" stroke-dasharray="10 8" />
		<!-- Hauptbahnhof icon/rect -->
		<rect x="420" y="440" width="120" height="36" fill="#14212c" rx="2" />
		<text
			x="480"
			y="463"
			font-size="12"
			fill="#ffffff"
			font-family="sans-serif"
			font-weight="bold"
			text-anchor="middle"
		>
			Hauptbahnhof
		</text>

		<!-- District labels -->
		<text
			x="180"
			y="140"
			font-size="13"
			fill="#697a75"
			font-family="sans-serif"
			font-weight="bold"
			letter-spacing="1"
		>
			MUSTERSTADT-NORD
		</text>
		<text
			x="480"
			y="160"
			font-size="14"
			fill="#14212c"
			font-family="sans-serif"
			font-weight="bold"
			text-anchor="middle"
		>
			Altstadt / Marktplatz
		</text>
		<text
			x="760"
			y="430"
			font-size="13"
			fill="#697a75"
			font-family="sans-serif"
			font-weight="bold"
			letter-spacing="1"
		>
			GEWERBEGEBIET OST
		</text>
		<text
			x="180"
			y="430"
			font-size="13"
			fill="#697a75"
			font-family="sans-serif"
			font-weight="bold"
			letter-spacing="1"
		>
			SÜDVIERTEL
		</text>

		<!-- Map scale indicator -->
		<g transform="translate(20, 520)">
			<rect x="0" y="0" width="100" height="6" fill="#14212c" />
			<rect x="50" y="0" width="50" height="6" fill="#ffffff" stroke="#14212c" stroke-width="1" />
			<text x="0" y="22" font-size="11" fill="#14212c" font-family="sans-serif" font-weight="bold">
				0
			</text>
			<text x="50" y="22" font-size="11" fill="#14212c" font-family="sans-serif" font-weight="bold">
				500 m
			</text>
			<text
				x="100"
				y="22"
				font-size="11"
				fill="#14212c"
				font-family="sans-serif"
				font-weight="bold"
			>
				1 km
			</text>
		</g>
	</svg>

	<!-- Interactive Pins -->
	<div class="absolute inset-0">
		{#each projectedPins as pin (pin.id)}
			{@const colors = getStatusColor(pin.status)}
			{@const isSelected = selectedId === pin.id}
			<a
				href="/maengelmelder/{pin.reference}"
				class="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
				style="left: {pin.x}%; top: {pin.y}%; z-index: {isSelected ? 30 : 10};"
				aria-label="Meldung {pin.reference}: {pin.title} ({DEFECT_CATEGORY[
					pin.category
				]}, Status: {pin.status})"
				onclick={(e) => {
					if (onSelectPin) {
						e.preventDefault();
						onSelectPin(pin.id);
					}
				}}
			>
				<!-- Pin badge -->
				<div
					class="flex items-center gap-1.5 border-2 px-2 py-1 font-display text-xs font-black shadow-none transition-transform group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-[#00467f] {colors.bg} {colors.border} {colors.text} {isSelected
						? 'scale-115 ring-2 ring-[#14212c] ring-offset-2'
						: ''}"
					style="border-radius: 2px;"
				>
					<span
						class="inline-block h-2 w-2 rounded-full {pin.status === 'behoben'
							? 'bg-[#115630]'
							: pin.status === 'in_bearbeitung'
								? 'bg-[#00467f]'
								: 'bg-[#8a4f00]'}"
						aria-hidden="true"
					></span>
					<span class="aktenzeichen">{pin.reference}</span>
				</div>

				<!-- Tooltip on hover/focus -->
				<div
					class="pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 border border-ink bg-sheet px-2 py-1 text-xs font-bold whitespace-nowrap text-ink shadow-sm group-hover:block group-focus:block"
					style="border-radius: 2px; z-index: 40;"
					role="tooltip"
				>
					<p class="font-bold">{pin.title}</p>
					<p class="text-[11px] font-normal text-ink-soft">{pin.address}</p>
				</div>
			</a>
		{/each}
	</div>

	<!-- Compass Rose / North Indicator -->
	<div
		class="pointer-events-none absolute top-3 right-3 flex flex-col items-center border border-ink bg-sheet/90 px-2 py-1 text-xs font-black text-ink"
		aria-hidden="true"
	>
		<span>▲</span>
		<span>N</span>
	</div>
</div>
