import type { Video } from "../types/config.js"

export async function getTheme(
	ytThemes: (string | null)[],
): Promise<string | null> {
	let ytTheme: string | null = null
	if (ytThemes.length !== 0) {
		ytTheme = ytThemes[Math.floor(Math.random() * ytThemes.length)]
	}
	return ytTheme
}

export async function getVideoFromAPI(
	_apiHost: string,
	ytTheme: string | null,
): Promise<Video> {
	let url: URL
	if (ytTheme !== null) {
		url = new URL(`/api/videos/theme/${ytTheme}`, window.location.origin)
	} else {
		url = new URL("/api/videos", window.location.origin)
	}

	return fetch(url)
		.then((response) => {
			if (response.ok) {
				return response.json()
			}

			if (response.status === 404) {
				throw new Error(`No video available with theme "${ytTheme}" in API now`)
			}
			throw new Error("Unknown API error")
		})
		.then((json: Video) => {
			return json
		})
}
