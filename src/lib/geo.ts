/** Fictional Musterstadt map extent. All locations and defects must fall inside it. */
export const MAP_BOUNDS = { north: 51.062, south: 51.038, west: 9.982, east: 10.022 } as const;

export const MAP_CENTER = {
	lat: (MAP_BOUNDS.north + MAP_BOUNDS.south) / 2,
	lng: (MAP_BOUNDS.west + MAP_BOUNDS.east) / 2
} as const;

/** Project lat/lng to percentages (0–100) inside the mock map. x → left, y → top. */
export function project(lat: number, lng: number): { x: number; y: number } {
	return {
		x: ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100,
		y: ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100
	};
}

/** Inverse of {@link project}. */
export function unproject(x: number, y: number): { lat: number; lng: number } {
	return {
		lat: MAP_BOUNDS.north - (y / 100) * (MAP_BOUNDS.north - MAP_BOUNDS.south),
		lng: MAP_BOUNDS.west + (x / 100) * (MAP_BOUNDS.east - MAP_BOUNDS.west)
	};
}
