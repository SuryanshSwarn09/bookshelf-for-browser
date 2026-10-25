# Bookshelf

A focused, distraction-free browser start page and bookmark dashboard built with React 19, TypeScript, and Vite. Designed to run both as a responsive web application and as a Chromium Manifest V3 browser extension overriding the new tab experience.

> **Full Documentation:** For deep-dive architectural specifications, component breakdown, and complete engineering changelog, visit the [Bookshelf Documentation Guide](docs/DOCUMENTATION.md).

---

## Key Features

- **Tactile Squircle Geometry:** Bookmarks formatted with continuous squircle curves (`rounded-[22.5%]`) and subtle monochromatic glassmorphism.
- **Multi-Tier Favicon Resolution:** 3-stage fallback pipeline (Google S2 128px, DuckDuckGo, direct origin `/favicon.ico`, and letter monogram avatars).
- **16px Generic Globe Rejection:** Automatically detects and rejects Google's generic 16px gray globe placeholders, cascading directly to alternative high-res providers.
- **Adaptive Dark-Mode Silhouette Filter:** Renders a subtle white luminance halo (`drop-shadow`) for dark transparent monochrome icons (GitHub, Notion, X, Vercel) against dark glass surfaces.
- **Persistent Icon Auto-Caching:** High-resolution icons resolved via fallbacks are automatically cached back to persistent storage.
- **Curated Theme Engine:** 6 bespoke themes (Default Glass, OLED Pitch Black, Nordic Slate, Sunset Rose, Graphite Carbon, and Porcelain Warm White) with synchronized `.dark` state for accurate contrast.
- **Always-On Drag & Drop:** Multi-sensor spatial reordering via `@dnd-kit` with touch and pointer activation thresholds.
- **Instant Search:** Fuzzy search across all titles and URLs via `Cmd+K` / `Ctrl+K` shortcut with `Esc` clear.
- **Direct GitHub Navigation:** Instant access to the project repository directly from the top floating dock.
- **Local-First & Zod-Validated:** Universal storage abstraction supporting `chrome.storage.sync`, `chrome.storage.local`, and `localStorage` with runtime JSON backup schema verification.
- **Anti-Vibe Design Philosophy:** Strict absence of purple neon gradients, pill buttons, fake reviews, vanity metrics, emoji icons, or AI marketing labels.

---

## Recent Engineering Improvements

1. **Anti-Vibe Codebase Overhaul:** Removed neon gradients and pill shapes; introduced clean typography, tactile squircle radiuses, and authentic Privacy Policy / Terms dialogs.
2. **Whitespace & Density Compaction:** Streamlined viewport padding, header scale, bookmark grid spacing, and modal dialog forms across 3 atomic commits.
3. **Resilient Favicon Pipeline:** Deployed multi-tier icon resolution, 16px globe rejection, dark silhouette halo filters, and persistent auto-caching across 3 atomic commits.
4. **Porcelain Theme Contrast Rectification:** Resolved Tailwind CSS v4 `@media (prefers-color-scheme: dark)` conflict by binding `@custom-variant dark` to a synchronized `.dark` class, ensuring legible typography on off-white backdrops.
5. **Floating Dock GitHub Navigation:** Embedded an official SVG GitHub mark button into the header dock with focus-visible accessibility outlines.

*Detailed historical notes are available in [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md#5-engineering-improvements--changelog).*

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework & Language** | React 19, TypeScript 5.8 | Modern component architecture and strict compile-time safety |
| **Bundler & Build Tool** | Vite 6, Esbuild | Fast Hot Module Replacement and production bundling |
| **Styling & Layout** | TailwindCSS v4, Vanilla CSS | Squircle geometry, custom dark-mode variants, glassmorphism |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` | Accessible pointer and keyboard sensor reordering |
| **Validation** | Zod 3 | Runtime validation for imported backup JSON structures |
| **Testing** | Vitest 4, JSDOM, `@testing-library/react` | Single-fork isolate unit and integration test suite |
| **Extension Standard** | Chrome Manifest V3 | `chrome_url_overrides.newtab` for browser extension deployment |

---

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server at http://localhost:3000
npm run dev

# Run TypeScript typecheck
npm run lint

# Run automated tests
npm run test
```

### Production Build

```bash
npm run build
```

This compiles optimized assets to `dist/`, including `manifest.json` for Chrome Manifest V3.

### Installing as a Chrome Extension

1. Run `npm run build`.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the upper right corner.
4. Click **Load unpacked** and select the generated `dist/` directory.
5. Open a new tab to experience Bookshelf.

---

## Production Bundle Size & Performance Profile

| Asset | Type | Raw Size | Transfer Size (Gzip) |
| :--- | :--- | :--- | :--- |
| `index-[hash].js` | JavaScript Bundle | **371.32 kB** (~362.6 KiB) | **106.36 kB** |
| `index-[hash].css` | Stylesheet (Tailwind CSS v4) | **78.17 kB** (~76.3 KiB) | **13.90 kB** |
| `index.html` | HTML Entry Shell | **0.99 kB** | **0.57 kB** |
| Static Assets | Manifest & Icons (`svg`/`png`) | **~1.43 kB** | **~1.00 kB** |
| **Total** | **Full Application Payload** | **~451.9 kB** | **~120.8 kB** |

- **Over-the-Wire Network Cost:** **~120.8 kB gzipped** total payload for first-page load on cold web connections.
- **Extension Cold-Start:** Sub-**10ms** load times on new tabs with 100% offline asset availability.

---

## Documentation

For full technical specifications, component hierarchy, storage mechanics, and contribution guidelines, refer to the [Bookshelf Documentation](docs/DOCUMENTATION.md).

---

## License

This project is licensed under the [MIT License](LICENSE).