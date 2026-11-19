<script lang="ts">
	import { project, unproject, MAP_BOUNDS, MAP_CENTER } from '#lib/geo.ts';

	let {
		lat = $bindable(MAP_CENTER.lat),
		lng = $bindable(MAP_CENTER.lng),
		onLocationChange
	}: {
		lat: number;
		lng: number;
		onLocationChange?: (coords: { lat: number; lng: number }) => void;
	} = $props();

	const pos = $derived(project(lat ?? MAP_CENTER.lat, lng ?? MAP_CENTER.lng));
	const clampedX = $derived(Math.max(2, Math.min(98, pos.x)));
	const clampedY = $derived(Math.max(2, Math.min(98, pos.y)));

	function setFromPercentage(pctX: number, pctY: number) {
		const cleanX = Math.max(0, Math.min(100, pctX));
		const cleanY = Math.max(0, Math.min(100, pctY));
		const coords = unproject(cleanX, cleanY);
		lat = Number(coords.lat.toFixed(5));
		lng = Number(coords.lng.toFixed(5));
		if (onLocationChange) {
			onLocationChange({ lat, lng });
		}
	}

	function handleMapClick(e: MouseEvent) {
		if (e.detail === 0) return;
		const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		setFromPercentage(x, y);
	}

	function handleMapKeyDown(e: KeyboardEvent) {
		// Step sizes for arrow key movement (roughly 5% per press, faster with shift)
		const step = e.shiftKey ? 10 : 3;
		let newX = clampedX;
		let newY = clampedY;

		if (e.key === 'ArrowUp') {
			newY -= step;
			e.preventDefault();
		} else if (e.key === 'ArrowDown') {
			newY += step;
			e.preventDefault();
		} else if (e.key === 'ArrowLeft') {
			newX -= step;
			e.preventDefault();
		} else if (e.key === 'ArrowRight') {
			newX += step;
			e.preventDefault();
		} else {
			return;
		}

		setFromPercentage(newX, newY);
	}

	// Preset landmarks for fast, accessible jumping
	const PRESETS = [
		{ name: 'Marktplatz / Altstadt', lat: 51.0508, lng: 10.0035 },
		{ name: 'Hauptbahnhof', lat: 51.0398, lng: 10.0005 },
		{ name: 'Stadtpark', lat: 51.049, lng: 9.996 },
		{ name: 'Gewerbering', lat: 51.043, lng: 10.02 },
		{ name: 'Nordviertel / Hauptstraße', lat: 51.055, lng: 10.015 }
	];
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-end justify-between gap-2">
		<div>
			<span class="field-label" id="map-picker-heading">
				Standort auf der Stadtkarte auswählen
			</span>
			<p class="field-hint" id="map-picker-hint">
				Klicken Sie auf den Schadensort oder nutzen Sie die Pfeiltasten auf der Karte zur
				Feinausrichtung.
			</p>
		</div>
		<div class="flex flex-wrap gap-1 text-xs">
			<span class="self-center font-bold text-ink-soft">Schnellwahl:</span>
			{#each PRESETS as preset (preset.name)}
				<button
					type="button"
					class="btn btn-ghost btn-sm px-1.5 py-0.5 text-xs text-amt-700 underline"
					onclick={() => {
						lat = preset.lat;
						lng = preset.lng;
						if (onLocationChange) onLocationChange({ lat, lng });
					}}
				>
					{preset.name}
				</button>
			{/each}
		</div>
	</div>

	<!-- Interactive Map Button/Region Surface -->
	<button
		type="button"
		aria-labelledby="map-picker-heading"
		aria-describedby="map-picker-hint map-coords-live"
		class="relative block w-full cursor-crosshair overflow-hidden border-2 border-ink bg-[#e6ede9] p-0 text-left select-none focus:ring-4 focus:ring-[#00467f] focus:outline-none"
		style="aspect-ratio: 16/9; min-height: 280px;"
		onclick={handleMapClick}
		onkeydown={handleMapKeyDown}
	>
		<!-- Stylized SVG city map background -->
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

			<!-- Parks -->
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

			<!-- Streets -->
			<path d="M 0,180 L 1000,180" stroke="#fbfcfb" stroke-width="14" />
			<path d="M 0,180 L 1000,180" stroke="#8c9c98" stroke-width="1.5" />
			<path d="M 0,187 L 1000,187" stroke="#8c9c98" stroke-width="1.5" />

			<path d="M 480,0 L 480,562" stroke="#fbfcfb" stroke-width="12" />
			<path d="M 474,0 L 474,562" stroke="#8c9c98" stroke-width="1.5" />
			<path d="M 486,0 L 486,562" stroke="#8c9c98" stroke-width="1.5" />

			<path d="M 120,562 L 850,0" stroke="#fbfcfb" stroke-width="10" />

			<!-- Secondary streets -->
			<path
				d="M 220,60 L 220,500 M 740,60 L 740,520 M 60,380 L 940,380 M 80,80 L 920,80"
				stroke="#d5deda"
				stroke-width="5"
			/>

			<!-- Train Station -->
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

			<text
				x="480"
				y="160"
				font-size="14"
				fill="#14212c"
				font-family="sans-serif"
				font-weight="bold"
				text-anchor="middle"
			>
				Marktplatz
			</text>
		</svg>

		<!-- Selected Pin Marker (Animated Target Ring) -->
		<div
			class="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
			style="left: {clampedX}%; top: {clampedY}%;"
		>
			<div class="relative flex items-center justify-center">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-sheet bg-signal-600 text-white shadow-md"
				>
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
						/>
					</svg>
				</div>
				<!-- Pin label -->
				<span
					class="absolute top-9 border border-[#14212c] bg-[#14212c] px-1.5 py-0.5 font-display text-[11px] font-bold whitespace-nowrap text-white shadow"
				>
					Schadensort
				</span>
			</div>
		</div>

		<!-- Coordinates Overlay HUD -->
		<div
			class="pointer-events-none absolute bottom-2 left-2 border border-ink bg-sheet/95 px-2 py-1 text-xs font-bold text-ink"
		>
			<span class="aktenzeichen">
				Lat: {lat?.toFixed(5) ?? '—'} | Lng: {lng?.toFixed(5) ?? '—'}
			</span>
		</div>
	</button>

	<!-- Screen reader / Keyboard operable coordinate input fields fallback -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div>
			<label for="coord-lat-input" class="field-label">Breitengrad (Lat)</label>
			<input
				id="coord-lat-input"
				name="lat"
				type="number"
				step="0.00001"
				min={MAP_BOUNDS.south}
				max={MAP_BOUNDS.north}
				bind:value={lat}
				class="input font-mono"
				aria-describedby="map-coords-live"
			/>
		</div>
		<div>
			<label for="coord-lng-input" class="field-label">Längengrad (Lng)</label>
			<input
				id="coord-lng-input"
				name="lng"
				type="number"
				step="0.00001"
				min={MAP_BOUNDS.west}
				max={MAP_BOUNDS.east}
				bind:value={lng}
				class="input font-mono"
				aria-describedby="map-coords-live"
			/>
		</div>
	</div>

	<p id="map-coords-live" class="visually-hidden" aria-live="polite">
		Ausgewählter Standort: Breitengrad {lat}, Längengrad {lng}.
	</p>
</div>
