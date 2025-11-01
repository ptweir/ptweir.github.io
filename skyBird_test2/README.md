# SkyBird Game 🐦

A mobile-first HTML5 canvas game inspired by Flappy Bird, optimized for touch devices and modern web browsers.

## 🚀 Features

- **Mobile-First Design**: Optimized for phone screens with touch controls
- **Responsive Layout**: Works on all screen sizes and orientations
- **Progressive Web App**: Can be installed on mobile devices
- **High Performance**: Smooth 60fps gameplay with optimized rendering
- **Touch-Friendly UI**: Large buttons and intuitive controls
- **Local Storage**: Saves high scores locally
- **Cross-Platform**: Works on iOS, Android, and desktop browsers

## 📱 Mobile Optimizations

- Viewport meta tags for proper mobile scaling
- Touch event handling with prevented defaults
- Safe area support for notched devices (iPhone X+)
- Orientation change handling
- Prevents zooming and text selection during gameplay
- Optimized for mobile browsers (Safari, Chrome Mobile)

## 🎮 How to Play

1. Tap the screen to make the bird fly
2. Avoid hitting the green pipes
3. Score points by flying through gaps
4. Try to beat your high score!

## 🛠️ Project Structure

```
skybird-game/
├── index.html          # Main HTML file with mobile meta tags
├── css/
│   ├── reset.css       # Mobile-first CSS reset
│   └── styles.css      # Game styles and responsive design
├── js/
│   ├── utils.js        # Utility functions and mobile helpers
│   ├── game.js         # Core game logic and physics
│   └── main.js         # Application controller and UI management
├── assets/
│   ├── images/         # Game sprites and graphics
│   └── icons/          # App icons and favicons
├── sounds/             # Audio files
└── README.md           # This file
```

## 🔧 Technical Details

### Technologies Used
- **HTML5 Canvas** for game rendering
- **Vanilla JavaScript** (ES6+) for game logic
- **CSS3** with custom properties and modern features
- **Web Audio API** for sound (with HTML5 Audio fallback)
- **Local Storage API** for persistent data

### Performance Features
- RequestAnimationFrame for smooth animation
- Canvas optimization for mobile devices
- Efficient collision detection
- Memory-conscious object pooling
- Debounced resize handling

### Mobile Web App Features
- App manifest for PWA installation
- Service worker ready (can be added)
- Apple touch icon support
- Theme color for browser UI
- Fullscreen app experience

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open index.html** in a web browser
3. **For development**: Use a local server (e.g., `python -m http.server` or Live Server extension)
4. **For mobile testing**: Access via your local network IP

### Development Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then visit http://localhost:8000
```

### Mobile Testing
1. Find your computer's local IP address
2. Start a development server
3. Access the game from your mobile device using `http://[YOUR-IP]:8000`

## 📋 Browser Support

- **iOS Safari** 12+
- **Chrome Mobile** 70+
- **Firefox Mobile** 65+
- **Samsung Internet** 10+
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)

## 🎨 Customization

### Adding Assets
1. Add image files to `assets/images/`
2. Add audio files to `sounds/`
3. Update the game code to use new assets

### Modifying Game Physics
Edit values in `js/game.js`:
- `gravity`: Bird fall speed
- `jumpForce`: Bird jump strength
- `gameSpeed`: Pipe movement speed
- `pipeGap`: Gap between pipes

### Styling Changes
Modify CSS custom properties in `css/styles.css`:
- Colors and gradients
- Button styles and sizes
- Layout and spacing
- Animations and transitions

## 🔊 Audio Setup

1. Add audio files to the `sounds/` directory
2. Implement audio loading in the game initialization
3. Trigger sounds on game events (jump, score, collision)

## 📱 PWA Installation

To make this a full Progressive Web App:
1. Add a `manifest.json` file
2. Implement a service worker for offline functionality
3. Add app icons in various sizes

## 🐛 Known Issues

- Audio autoplay restrictions on some mobile browsers
- iOS Safari viewport height quirks (handled with CSS)
- Android Chrome address bar behavior (handled with dvh units)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test on multiple devices
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- [ ] Add particle effects
- [ ] Implement power-ups
- [ ] Add multiple bird characters
- [ ] Create different game modes
- [ ] Add social sharing features
- [ ] Implement leaderboards
- [ ] Add sound effects and background music
- [ ] Create animated sprites
- [ ] Add day/night cycle backgrounds

---

**Happy Flying! 🐦✨**
