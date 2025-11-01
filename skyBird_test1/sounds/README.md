# SkyBird Game Audio

This directory contains all audio files for the SkyBird game.

## Audio Files

### Sound Effects
- `jump.mp3` - Bird flap/jump sound
- `score.mp3` - Point scoring sound
- `hit.mp3` - Collision/game over sound
- `whoosh.mp3` - Pipe passing sound (optional)

### Music
- `background.mp3` - Background music (optional)
- `menu.mp3` - Menu background music (optional)

## Audio Implementation

The game uses the Web Audio API when available, with fallback to HTML5 Audio elements. Audio files should be:

- **Format**: MP3 (primary), OGG (fallback)
- **Sample Rate**: 44.1kHz
- **Bit Depth**: 16-bit
- **File Size**: Keep under 100KB per file for mobile performance

## Usage in Game

Audio is loaded and managed through the Utils.audio utilities in `js/utils.js`. Sounds are triggered by game events:

- Jump sound: When player taps/clicks
- Score sound: When passing through pipes
- Hit sound: On collision/game over

## Mobile Considerations

- Audio autoplay is restricted on mobile browsers
- First user interaction enables audio context
- Audio files are preloaded during the loading screen
- Volume controls should be provided for user preference
