import { BeatDetector } from "./services/beat-detector.js"
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

// Initialize the application
async function initializeApp(): Promise<void> {
	// Load config first
	try {
		config = await loadConfig()
	} catch (error) {
		console.error("Failed to load config:", error)
		return
	}

	// Initialize YouTube player manager
	youtubeManager = new YouTubePlayerManager()

	// Initialize beat detector with main config
	beatDetector = new BeatDetector(config)

	// Set up beat callback to trigger video switching
	beatDetector.onBeat((beat) => {
		debugLog(
			`🥁 Beat detected! Energy: ${beat.energy}, Confidence: ${beat.confidence.toFixed(2)}`,
			config,
		)

		// Trigger immediate video switch on beat
		youtubeManager.triggerBeatSwitch()
	})

	// Start beat detection
	await beatDetector.start()
}

// YouTube API callback (global function)
function onYouTubeIframeAPIReady(): void {
	debugLog("YouTube API ready, initializing players...", config)
	youtubeManager.initializePlayers()
}

// Attach the callback to window for YouTube API
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp)
