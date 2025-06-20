/// <reference path="../types/youtube.ts" />
import type { Config, Video } from "../types/config.js"
import { debugLog } from "../utils/helpers.js"
import { getTheme, getVideoFromAPI } from "./vj-api.js"

export class YouTubePlayerManager {
	private player1: YT.Player
	private player2: YT.Player
	private player3: YT.Player
	private player1ready = false
	private player2ready = false
	private player3ready = false
	private currentDisplayPlayer = 1 // Currently displayed player
	private loadingPlayer = 3 // Player currently loading
	private isInitialized = false // Track if initial setup is complete
	private config: Config | null = null
	private playerLoaded: Set<number> = new Set() // Track which players have loaded videos
	private playerThemes: Map<number, string> = new Map() // Track theme for each player
	private onBeatSwitchCallback: (() => void) | null = null

	constructor(config: Config) {
		this.config = config
		this.loadYouTubeAPI()
	}

	private loadYouTubeAPI(): void {
		const tag = document.createElement("script")
		tag.src = "https://www.youtube.com/iframe_api"
		const firstScriptTag = document.getElementsByTagName("script")[0]
		firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
	}

	initializePlayers(): void {
		this.player1 = new window.YT.Player("player1", {
			playerVars: { autoplay: 1, controls: 0, mute: 1 },
			events: {
				onReady: this.onPlayerReady.bind(this),
				onStateChange: this.onPlayerStateChange.bind(this),
			},
		})

		this.player2 = new window.YT.Player("player2", {
			playerVars: { autoplay: 1, controls: 0, mute: 1 },
			events: {
				onReady: this.onPlayerReady.bind(this),
				onStateChange: this.onPlayerStateChange.bind(this),
			},
		})

		this.player3 = new window.YT.Player("player3", {
			playerVars: { autoplay: 1, controls: 0, mute: 1 },
			events: {
				onReady: this.onPlayerReady.bind(this),
				onStateChange: this.onPlayerStateChange.bind(this),
			},
		})
	}

	private onPlayerReady(event: YT.PlayerEvent): void {
		// debugLog(`Player ${event.target.id} ready`, this.config)

		if (event.target.id === 1) {
			this.player1ready = true
		} else if (event.target.id === 2) {
			this.player2ready = true
		} else if (event.target.id === 3) {
			this.player3ready = true
		}

		if (this.player1ready && this.player2ready && this.player3ready) {
			this.startVideoLoop()
		}
	}

	private async startVideoLoop(): Promise<void> {
		// Load first two videos
		try {
			// Load video on player 1
			const ytTheme1 = await getTheme(this.config?.youtubeThemes)
			debugLog(
				`Loading new video on theme "${ytTheme1}" on player 1...`,
				this.config,
			)
			const video1 = await getVideoFromAPI(this.config?.apiHost, ytTheme1)
			this.startVideo(this.player1, video1)
			this.playerThemes.set(1, ytTheme1)

			// Load video on player 2
			const ytTheme2 = await getTheme(this.config?.youtubeThemes)
			debugLog(
				`Loading new video on theme "${ytTheme2}" on player 2...`,
				this.config,
			)
			const video2 = await getVideoFromAPI(this.config?.apiHost, ytTheme2)
			this.startVideo(this.player2, video2)
			this.playerThemes.set(2, ytTheme2)

			// Start with player 1 displayed
			this.currentDisplayPlayer = 1
			this.loadingPlayer = 3
			this.isInitialized = true

			// Note: Players 1 and 2 will be added to playerLoaded when their onPlayerStateChange fires
			debugLog(
				"Initial setup complete. Waiting for videos to load...",
				this.config,
			)

			// Show initial player
			this.switchToPlayer(1)
			this.updateDebugOverlay()
		} catch (error) {
			debugLog("❌ Error loading initial videos:", this.config, error)
		}

		// Set up interval for requesting new videos
		setInterval(async () => {
			// Remove the loading player from loaded set since it's starting to load new video
			this.playerLoaded.delete(this.loadingPlayer)
			debugLog(
				`Player ${this.loadingPlayer} removed from loaded set - starting to load new video`,
				this.config,
			)

			// Load new video on the loading player
			try {
				const ytTheme = await getTheme(this.config?.youtubeThemes)
				debugLog(
					`Loading new video on theme "${ytTheme}" on player ${this.loadingPlayer}...`,
					this.config,
				)
				const video = await getVideoFromAPI(this.config?.apiHost, ytTheme)
				this.startVideo(this.getPlayer(this.loadingPlayer), video)
				this.playerThemes.set(this.loadingPlayer, ytTheme)
			} catch (error) {
				debugLog(
					`❌ Error loading video on player ${this.loadingPlayer}:`,
					this.config,
					error,
				)
			}
		}, this.config?.newVideoRequestDelay * 1000)

		debugLog(
			`Video request interval started (every ${this.config?.newVideoRequestDelay}s)`,
			this.config,
		)
	}

	private getPlayer(playerId: number): YT.Player {
		switch (playerId) {
			case 1:
				return this.player1
			case 2:
				return this.player2
			case 3:
				return this.player3
			default:
				throw new Error(`Invalid player ID: ${playerId}`)
		}
	}

	private startVideo(player: YT.Player, video: Video): void {
		const ytID = video.youtubeId
		let start: number

		if (video.videoDuration) {
			const minStart = 5
			const maxStart = video.videoDuration - 5
			start = Math.random() * (maxStart - minStart) + minStart
		} else {
			start = Math.random() * (60 - 2) + 2
		}

		player.loadVideoById(ytID, start)
		player.setPlaybackRate(this.config?.youtubePlaybackRate || 0.25)
	}

	private onPlayerStateChange(event: YT.OnStateChangeEvent): void {
		if (event.data === 1 && this.isInitialized) {
			const playerId = event.target.id

			// Mark this player as having a loaded video
			this.playerLoaded.add(playerId)
			debugLog(
				`Player ${playerId} video loaded. Loaded players: ${Array.from(this.playerLoaded).join(", ")}`,
				this.config,
			)

			// Hide countdown if it's still showing
			const countdownElement = document.getElementById("countdown")
			if (countdownElement) {
				countdownElement.style.display = "None"
			}

			// Wait a bit for YouTube title overlay to disappear before switching
			setTimeout(
				() => {
					// Find the next available player with a loaded video
					const availablePlayers = Array.from(this.playerLoaded).filter(
						(p) => p !== this.currentDisplayPlayer,
					)

					if (availablePlayers.length === 0) {
						debugLog(
							"⚠️ No other players with loaded videos available",
							this.config,
						)
						return
					}

					// Switch to the first available player
					const nextPlayer = availablePlayers[0]
					this.switchToPlayer(nextPlayer)

					// Update player roles for next cycle
					this.currentDisplayPlayer = nextPlayer
					this.loadingPlayer = this.getNextLoadingPlayer()

					debugLog(
						`Switched to player ${this.currentDisplayPlayer}. Loading: ${this.loadingPlayer}`,
						this.config,
					)
					this.updateDebugOverlay()
				},
				(this.config?.videoSwitchDelay || 2) * 1000,
			)
		}
	}

	private switchToPlayer(playerId: number): void {
		debugLog(`Switching to player ${playerId} now.`, this.config)

		// Hide all players instantly (no fade)
		const player1Element = document.getElementById("player1")
		const player2Element = document.getElementById("player2")
		const player3Element = document.getElementById("player3")

		if (player1Element) player1Element.style.opacity = "0"
		if (player2Element) player2Element.style.opacity = "0"
		if (player3Element) player3Element.style.opacity = "0"

		// Show the target player instantly (no fade)
		const targetElement = document.getElementById(`player${playerId}`)
		if (targetElement) targetElement.style.opacity = "1"

		this.currentDisplayPlayer = playerId
	}

	private getNextLoadingPlayer(): number {
		// Find the next player that is NOT the current display player
		// Cycle through: 1 -> 2 -> 3 -> 1, but skip the current display player
		let nextPlayer = this.loadingPlayer
		do {
			nextPlayer = nextPlayer === 3 ? 1 : nextPlayer + 1
		} while (nextPlayer === this.currentDisplayPlayer)

		return nextPlayer
	}

	private updateDebugOverlay(): void {
		// Only show debug overlay if debug is enabled in config
		if (!this.config?.debug) {
			// Remove debug overlay if it exists and debug is disabled
			const existingOverlay = document.getElementById("debug-overlay")
			if (existingOverlay) {
				existingOverlay.remove()
			}
			return
		}

		// Create or update debug overlay
		let overlay = document.getElementById("debug-overlay")
		if (!overlay) {
			overlay = document.createElement("div")
			overlay.id = "debug-overlay"
			document.body.appendChild(overlay)
		}

		overlay.textContent = `Player ${this.currentDisplayPlayer} - Theme: ${this.playerThemes.get(this.currentDisplayPlayer) || "Unknown"}`
	}

	// Add method to trigger beat-based switching
	onBeatSwitch(callback: () => void): void {
		this.onBeatSwitchCallback = callback
	}

	// Method to trigger immediate switch on beat
	triggerBeatSwitch(): void {
		if (!this.isInitialized) return

		// Find the next available player with a loaded video
		const availablePlayers = Array.from(this.playerLoaded).filter(
			(p) => p !== this.currentDisplayPlayer,
		)

		if (availablePlayers.length === 0) {
			debugLog(
				"⚠️ No other players with loaded videos available for beat switch",
				this.config,
			)
			return
		}

		// Switch to the first available player immediately
		const nextPlayer = availablePlayers[0]
		this.switchToPlayer(nextPlayer)

		// Update player roles for next cycle
		this.currentDisplayPlayer = nextPlayer
		this.loadingPlayer = this.getNextLoadingPlayer()

		debugLog(
			`🥁 Beat switch to player ${this.currentDisplayPlayer}. Loading: ${this.loadingPlayer}`,
			this.config,
		)
		this.updateDebugOverlay()
	}
}
