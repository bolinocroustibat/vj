// Audio-related types
export interface AudioMetrics {
	totalEnergy: number
	averageEnergy: number
	maxEnergy: number
	bassEnergy: number
	bassAverage: number
	timestamp: string
}

export interface MicrophoneStatus {
	isListening: boolean
	hasPermission: boolean
}

// Beat detection types
export interface BeatEvent {
	timestamp: number
	energy: number
	bassEnergy: number
	confidence: number
}

export interface BeatDetectionConfig {
	energyThreshold: number
	bassThreshold: number
	beatCooldown: number
	debug: boolean
}
