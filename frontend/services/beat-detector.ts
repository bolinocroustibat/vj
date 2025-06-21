import type { AudioMetrics, BeatEvent } from "../types/audio.js"
import type { Config } from "../types/config.js"
import { debugLog } from "../utils/helpers.js"
import { MicrophoneManager } from "./microphone.js"

export class BeatDetector {
	private microphone: MicrophoneManager
	private config: Config
	private lastBeatTime = 0
	private isDetecting = false
	private onBeatCallback: ((beat: BeatEvent) => void) | null = null

	constructor(config: Config) {
		this.microphone = new MicrophoneManager()
		this.config = config
	}

	async start(): Promise<boolean> {
		debugLog("🎵 Starting beat detection...", this.config)

		// Set up audio data callback
		this.microphone.onAudioData((metrics) => {
			this.processAudioData(metrics)
		})

		const success = await this.microphone.requestMicrophoneAccess()
		if (success) {
			this.isDetecting = true
			debugLog("✅ Beat detection started", this.config)
		} else {
			debugLog(
				"❌ Failed to start beat detection - no microphone access",
				this.config,
			)
		}

		return success
	}

	onBeat(callback: (beat: BeatEvent) => void): void {
		this.onBeatCallback = callback
	}

	private processAudioData(metrics: AudioMetrics): void {
		if (!this.isDetecting || !this.config.beatDetection) return

		if (this.isBeat(metrics)) {
			const confidence = this.calculateBeatConfidence(metrics)

			// Only trigger beat if confidence is above threshold
			if (
				confidence >= (this.config.beatDetection.confidenceThreshold || 0.3)
			) {
				const beatEvent: BeatEvent = {
					timestamp: Date.now(),
					energy: metrics.totalEnergy,
					bassEnergy: metrics.bassEnergy,
					confidence: confidence,
				}

				// Call the beat callback
				if (this.onBeatCallback) {
					this.onBeatCallback(beatEvent)
				}

				this.lastBeatTime = Date.now()
			}
		}
	}

	private isBeat(metrics: AudioMetrics): boolean {
		if (!this.config.beatDetection) return false

		const now = Date.now()
		const timeSinceLastBeat = now - this.lastBeatTime

		// Check if enough time has passed since last beat
		if (timeSinceLastBeat < this.config.beatDetection.beatCooldown) {
			return false
		}

		// Beat detection logic
		const hasHighEnergy =
			metrics.totalEnergy > this.config.beatDetection.energyThreshold
		const hasStrongBass =
			metrics.bassEnergy > this.config.beatDetection.bassThreshold
		const isSignificantBeat =
			metrics.averageEnergy > this.config.beatDetection.energyThreshold * 0.7

		return hasHighEnergy && (hasStrongBass || isSignificantBeat)
	}

	private calculateBeatConfidence(metrics: AudioMetrics): number {
		if (!this.config.beatDetection) return 0

		// Calculate how much the thresholds were exceeded (0-1 range)
		const energyExcess = Math.min(
			1.0,
			(metrics.totalEnergy - this.config.beatDetection.energyThreshold) /
				this.config.beatDetection.energyThreshold,
		)
		const bassExcess = Math.min(
			1.0,
			(metrics.bassEnergy - this.config.beatDetection.bassThreshold) /
				this.config.beatDetection.bassThreshold,
		)

		// Average the excess ratios to get confidence
		return (energyExcess + bassExcess) / 2
	}

	stop(): void {
		this.isDetecting = false
		this.microphone.stopListening()
		debugLog("🔇 Beat detection stopped", this.config)
	}

	updateConfig(newConfig: Partial<Config>): void {
		this.config = { ...this.config, ...newConfig }
		debugLog("⚙️ Beat detection config updated:", this.config, this.config)
	}
}
