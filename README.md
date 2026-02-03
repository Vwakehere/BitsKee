# BitsKee

A retro-terminal styled web app for creating pixel art and ASCII drawings.

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## Live Demo
Try the hosted demo: https://vwakehere.github.io/BitsKee/

## Features

### 🎨 Pixelate Mode
Convert any image to pixel art with customizable settings:
- **Pixel Size**: 2-32px blocks
- **Color Modes**: Full Color, 16 Colors, 8 Colors, Grayscale, 1-Bit
- **Grid Overlay**: Toggle pixel grid visibility
- **Export**: Download as PNG or copy to clipboard

### ✏️ Draw Mode  
Freehand ASCII art drawing with a built-in character keyboard:
- 60+ ASCII characters including symbols, blocks, and line-drawing chars
- Adjustable canvas dimensions
- Export as TXT or copy to clipboard

### 💻 Retro Terminal UI
- CRT scanlines and glow effects
- Monospace typography (Fira Code)
- Dark high-contrast theme

## Quick Start

```bash
# Clone the repo
git clone https://github.com/vwakehere/bitskee.git
cd bitskee

# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling with CSS variables, Grid, Flexbox
- **Vanilla JavaScript** - No frameworks, no dependencies

## Project Structure

```
bitskee/
├── index.html
├── README.md
├── styles/
│   ├── main.css      # Core styles
│   └── crt.css       # Retro effects
└── scripts/
    ├── pixelate.js   # Image processing
    ├── canvas.js     # Drawing logic
    └── app.js        # Main controller
```

## License

MIT © [vwakehere](https://github.com/vwakehere)
# BitsKee
