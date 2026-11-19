import { browser } from '$app/env';

/** Accessibility preferences (Leichte Sprache, hoher Kontrast, dunkler Modus). Persisted in localStorage. */
class A11y {
	leicht = $state(false);
	contrast = $state(false);
	dark = $state(false);

	/** Call once on the client after hydration. */
	init() {
		if (!browser) return;
		const html = document.documentElement;
		this.leicht = html.dataset.leicht === 'on';
		this.contrast = html.dataset.contrast === 'high';
		this.dark = html.dataset.theme === 'dark';
	}

	toggleLeicht() {
		this.leicht = !this.leicht;
		this.#apply();
	}

	toggleContrast() {
		this.contrast = !this.contrast;
		this.#apply();
	}

	toggleDark() {
		this.dark = !this.dark;
		this.#apply();
	}

	#apply() {
		const html = document.documentElement;
		if (this.leicht) html.dataset.leicht = 'on';
		else delete html.dataset.leicht;
		if (this.contrast) html.dataset.contrast = 'high';
		else delete html.dataset.contrast;
		if (this.dark) html.dataset.theme = 'dark';
		else delete html.dataset.theme;
		localStorage.setItem(
			'bp-a11y',
			JSON.stringify({ leicht: this.leicht, contrast: this.contrast, dark: this.dark })
		);
	}
}

export const a11y = new A11y();
