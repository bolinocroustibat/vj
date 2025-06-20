# Video Jockey

A stylized random Video Jockey webapp playing randomly selected YouTube video clips with automatic smooth transitions between them. Features microphone-based beat detection for enhanced video switching control.

## Configuration

Copy `config.example.json` to `config.json` and modify the settings as needed.

### Configuration Options

- `apiHost`: _string_ (URL). The full URL of the API providing an unlimited amount of YouTube IDs. Prefer one that doesn't deplete the YouTube API quota.

- `newVideoRequestDelay`: _integer_ (seconds), how often to request new videos from the API. The actual video switching happens automatically when videos finish loading.

- `videoSwitchDelay`: _integer_ (seconds), delay after a video finishes loading before switching to it. This allows YouTube's title overlay to disappear for a smoother experience.

- `youtubeThemes`: _list_ of _string_. Themes of the requested videos. Also accepts `null` as element of list if you want a completely randomly selected video.

- `debug`: _boolean_ (optional), enables debug overlay and additional console logging.

- `beatDetection`: _object_ (optional), configuration for microphone-based beat detection:
  - `energyThreshold`: _integer_, minimum audio energy level to consider a beat (default: 200)
  - `bassThreshold`: _integer_, minimum bass frequency energy to consider a beat (default: 150)
  - `beatCooldown`: _integer_ (milliseconds), minimum time between detected beats (default: 200)

## Features

- **Three-Player System**: Uses three YouTube players to ensure smooth transitions with one player always loading the next video
- **Beat Detection**: Microphone-based audio analysis to detect beats in real-time
- **VHS Effects**: Shader-based visual effects for a retro aesthetic
- **Automatic Transitions**: Seamless switching between videos when they finish loading
- **Theme-Based Selection**: Request videos based on specific themes or completely random selection

## Development

To lint and format the codebase (excluding vendor files):

```bash
bun run check
```

This will run `biome check --write .` which formats and lints only your source code, ignoring the `vhs/` vendor folder.

## Run

Run `index.html` as a normal static webpage. The app will request microphone permission for beat detection functionality.

## Beat Detection

The app includes real-time beat detection using your device's microphone. When enabled:

1. Click the microphone button to grant permission
2. The system analyzes audio input to detect beats
3. Beat events are logged to the console (when debug is enabled)
4. Future versions will use beats to trigger video switching

Beat detection parameters can be tuned in the configuration file to match your audio environment and preferences.
