# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG DEBUG
ARG FRONTEND_NEW_VIDEO_REQUEST_DELAY
ARG FRONTEND_VIDEO_SWITCH_DELAY
ARG FRONTEND_YOUTUBE_THEMES
ARG FRONTEND_VHS_EFFECT
ARG FRONTEND_GRAYSCALE
ARG FRONTEND_YOUTUBE_PLAYBACK_RATE
ARG FRONTEND_BEAT_DETECTION_ENERGY_THRESHOLD
ARG FRONTEND_BEAT_DETECTION_BASS_THRESHOLD
ARG FRONTEND_BEAT_DETECTION_BEAT_COOLDOWN
ARG FRONTEND_BEAT_DETECTION_CONFIDENCE_THRESHOLD

# Build the application with environment variables
RUN VITE_DEBUG=${DEBUG} \
    VITE_NEW_VIDEO_REQUEST_DELAY=${FRONTEND_NEW_VIDEO_REQUEST_DELAY} \
    VITE_VIDEO_SWITCH_DELAY=${FRONTEND_VIDEO_SWITCH_DELAY} \
    VITE_YOUTUBE_THEMES=${FRONTEND_YOUTUBE_THEMES} \
    VITE_VHS_EFFECT=${FRONTEND_VHS_EFFECT} \
    VITE_GRAYSCALE=${FRONTEND_GRAYSCALE} \
    VITE_YOUTUBE_PLAYBACK_RATE=${FRONTEND_YOUTUBE_PLAYBACK_RATE} \
    VITE_BEAT_DETECTION_ENERGY_THRESHOLD=${FRONTEND_BEAT_DETECTION_ENERGY_THRESHOLD} \
    VITE_BEAT_DETECTION_BASS_THRESHOLD=${FRONTEND_BEAT_DETECTION_BASS_THRESHOLD} \
    VITE_BEAT_DETECTION_BEAT_COOLDOWN=${FRONTEND_BEAT_DETECTION_BEAT_COOLDOWN} \
    VITE_BEAT_DETECTION_CONFIDENCE_THRESHOLD=${FRONTEND_BEAT_DETECTION_CONFIDENCE_THRESHOLD} \
    bun run build

# Expose port 4173 (Vite preview default)
EXPOSE 4173

# Serve the built application
CMD ["bun", "run", "preview", "--host", "0.0.0.0"]
