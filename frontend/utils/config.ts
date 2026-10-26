import type { Config } from "../types/config.js"

/**
 * Load configuration from Vite environment variables.
 * Visual options (overlay, grayscale, playback rate) are chosen on the start screen.
 */
export async function loadConfig(): Promise<Config> {
	const youtubeThemesStr = import.meta.env.VITE_YOUTUBE_THEMES || ""
	const youtubeThemes = youtubeThemesStr
		.split(",")
		.map((theme) => theme.trim())
		.filter((theme) => theme.length > 0)

	const beatDetection = {
		energyThreshold: Number(import.meta.env.VITE_BEAT_DETECTION_ENERGY_THRESHOLD),
		bassThreshold: Number(import.meta.env.VITE_BEAT_DETECTION_BASS_THRESHOLD),
		beatCooldown: Number(import.meta.env.VITE_BEAT_DETECTION_BEAT_COOLDOWN),
		confidenceThreshold: Number(
			import.meta.env.VITE_BEAT_DETECTION_CONFIDENCE_THRESHOLD,
		),
	}

	const config: Config = {
		newVideoRequestDelay: Number(import.meta.env.VITE_NEW_VIDEO_REQUEST_DELAY),
		videoSwitchDelay: Number(import.meta.env.VITE_VIDEO_SWITCH_DELAY),
		youtubeThemes,
		apiHost: "http://api:8000",
		debug: import.meta.env.VITE_DEBUG === "true",
		overlayEffect: "vhs",
		grayscale: true,
		youtubePlaybackRate: 0.25,
		beatDetection,
	}

	console.log("Loaded config from environment variables:", config)
	return config
}
