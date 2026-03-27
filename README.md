# Drum Metronome

A web-based metronome designed specifically for drummers with support for sticking patterns and accents.

**Live Demo:** https://drum-metronome.pages.dev

## Features

- **Sticking Patterns** - Enter custom patterns using L (left), R (right), and ! (accent)
- **Quick Presets** - Single Stroke, Double Stroke, Paradiddle, Triplets, Flam Accent, Single Seven
- **Visual Beat Indicator** - Animated circles showing current beat with accent highlighting (purple for accents)
- **Italian Tempo Markings** - Click on Largo, Adagio, Andante, Moderato, Allegro, Presto, or Prestissimo to set BPM
- **Tap Tempo** - Tap to set the tempo
- **Dark/Light Mode** - Automatically follows system preference

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Format and lint with Biome
pnpm format
pnpm lint
```

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- SCSS
- Web Audio API for precise timing
- Biome for formatting and linting

## License

MIT
