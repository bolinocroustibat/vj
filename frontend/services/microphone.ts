import type { AudioMetrics, MicrophoneStatus } from "../types/audio.js"
import { debugError, debugLog } from "../utils/helpers.js"

export class MicrophoneManager {
	private audioContext: AudioContext | null = null
	private analyser: AnalyserNode | null = null
	private microphone: MediaStreamAudioSourceNode | null = null
	private dataArray: Uint8Array | null = null
	private isListening = false
	private animationId: number | null = null
	private onAudioDataCallback: ((metrics: AudioMetrics) => void) | null = null
	private config: any = null // We'll need to pass config from parent

	async requestMicrophoneAccess(): Promise<boolean> {
		try {
			debugLog("🎤 Requesting microphone access...", this.config)

			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false,
				},
			})

			debugLog("✅ Microphone access granted!", this.config)
			this.setupAudioAnalysis(stream)
			return true
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "NotAllowedError") {
					debugLog("❌ User denied microphone permission", this.config)
				} else if (error.name === "NotFoundError") {
					debugLog("❌ No microphone found on this device", this.config)
				} else {
					debugLog("❌ Microphone error:", this.config, error.message)
				}
			}
			return false
		}
	}

	private setupAudioAnalysis(stream: MediaStream): void {
		this.audioContext = new AudioContext()
		this.microphone = this.audioContext.createMediaStreamSource(stream)
		this.analyser = this.audioContext.createAnalyser()

		this.analyser.fftSize = 256
		this.analyser.smoothingTimeConstant = 0.8

		this.microphone.connect(this.analyser)
		this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

		debugLog("🎵 Audio analysis setup complete", this.config)
		debugLog(
			`📊 Frequency bins: ${this.analyser.frequencyBinCount}`,
			this.config,
		)
		debugLog(`🎚️ Sample rate: ${this.audioContext.sampleRate}Hz`, this.config)

		this.startAnalysis()
	}

	onAudioData(callback: (metrics: AudioMetrics) => void): void {
		this.onAudioDataCallback = callback
	}

	private startAnalysis(): void {
		if (!this.analyser || !this.dataArray) {
			debugLog("❌ Audio analysis not initialized", this.config)
			return
		}

		this.isListening = true
		debugLog("🎧 Starting audio analysis...", this.config)

		const analyzeAudio = () => {
			if (!this.isListening || !this.analyser || !this.dataArray) {
				return
			}

			this.analyser.getByteFrequencyData(this.dataArray)

			const totalEnergy = this.dataArray.reduce((sum, value) => sum + value, 0)
			const averageEnergy = totalEnergy / this.dataArray.length
			const maxEnergy = Math.max(...this.dataArray)

			const bassRange = this.dataArray.slice(0, 20)
			const bassEnergy = bassRange.reduce((sum, value) => sum + value, 0)
			const bassAverage = bassEnergy / bassRange.length

			const metrics: AudioMetrics = {
				totalEnergy: Math.round(totalEnergy),
				averageEnergy: Math.round(averageEnergy),
				maxEnergy: Math.round(maxEnergy),
				bassEnergy: Math.round(bassEnergy),
				bassAverage: Math.round(bassAverage),
				timestamp: new Date().toISOString(),
			}

			// Call the callback if set
			if (this.onAudioDataCallback) {
				this.onAudioDataCallback(metrics)
			}

			// Only log if energy is significant (for debugging)
			// Commented out to focus on beat detection - can be useful later
			// if (totalEnergy > 100) {
			// 	debugLog("🔊 Audio Data:", this.config, metrics)
			// }

			this.animationId = requestAnimationFrame(analyzeAudio)
		}

		analyzeAudio()
	}

	stopListening(): void {
		this.isListening = false

		if (this.animationId) {
			cancelAnimationFrame(this.animationId)
			this.animationId = null
		}

		if (this.audioContext) {
			this.audioContext.close()
			this.audioContext = null
		}

		debugLog("🔇 Audio analysis stopped", this.config)
	}

	getStatus(): MicrophoneStatus {
		return {
			isListening: this.isListening,
			hasPermission: this.audioContext !== null,
		}
	}
}
