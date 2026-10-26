import { BeatDetector } from "./services/beat-detector.js"
import { loadOverlayEffect } from "./services/overlay-effect.js"
import { waitForStart } from "./services/start-screen.js"
import { YouTubePlayerManager } from "./services/youtube-player.js"
import type { Config } from "./types/config.js"
import { loadConfig } from "./utils/config.js"
import { debugLog } from "./utils/helpers.js"

// Extend Window interface for YouTube API callback
declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void
	}
}

// Global instances
let youtubeManager: YouTubePlayerManager
let beatDetector: BeatDetector
let config: Config | null = null

function applyGrayscale(config: Config): void {
	const grayscaleValue = config.grayscale ? "1" : "0"
	document.documentElement.style.setProperty(
		"--grayscale-filter",
		grayscaleValue,
	)
	debugLog(
		`Grayscale filter ${config.grayscale ? "enabled" : "disabled"}`,
		config,
	)
}

async function initializeApp(): Promise<void> {
	try {
		config = await loadConfig()
	} catch (error) {
		console.error("Failed to load config:", error)
		return
	}

	// Start loading YouTube videos behind the start screen
	youtubeManager = new YouTubePlayerManager(config)

	const choices = await waitForStart()
	config.overlayEffect = choices.overlayEffect
	config.grayscale = choices.grayscale
	config.youtubePlaybackRate = choices.youtubePlaybackRate

	youtubeManager.applyStartChoices(config)
	applyGrayscale(config)
	await loadOverlayEffect(config)

	const countdown = document.getElementById("countdown")
	if (countdown) {
		// Skip the countdown if videos are already ready
		countdown.hidden = youtubeManager.hasLoadedVideos()
	}

	beatDetector = new BeatDetector(config)
	beatDetector.onBeat((beat) => {
		debugLog(
			`🥁 Beat detected! Energy: ${beat.energy}, Confidence: ${beat.confidence.toFixed(2)}`,
			config,
		)
		youtubeManager.triggerBeatSwitch()
	})
	await beatDetector.start()
}

function onYouTubeIframeAPIReady(): void {
	debugLog("YouTube API ready, initializing players...", config)
	youtubeManager.initializePlayers()
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

document.addEventListener("DOMContentLoaded", initializeApp)
