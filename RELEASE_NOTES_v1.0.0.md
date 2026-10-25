# Bookshelf v1.0.0 — Initial Production Release

**Bookshelf** is a focused, distraction-free browser dashboard and personal startpage built with React 19, TypeScript, and Vite. Designed to run as both a high-speed Progressive Web Application and an offline Chromium Manifest V3 browser extension overriding `chrome://newtab`.

---

## Highlights in v1.0.0

### 1. Tactile Glassmorphism & Continuous Squircles
- Precision continuous squircle curvature (`rounded-[22.5%]`) for all bookmark shortcuts.
- Monochromatic grain textures and structured glass surfaces without purple gradients or neon glows.
- Spatial drag-and-drop workspace organization with `@dnd-kit`, multi-sensor touch/pointer activation, and Jiggle Edit mode.
- Density control toggle between Small (`sm`), Medium (`md`), and Large (`lg`) icon grids.

### 2. Multi-Tier High-Resolution Favicon Engine
- 3-tier resolution cascade: Google S2 128px API → DuckDuckGo Favicon Service → direct origin `/favicon.ico` → procedural letter monograms.
- **16px Generic Globe Rejection:** Automatically detects and rejects Google's unhelpful gray globe placeholders, immediately cascading to alternative high-res providers.
- **Adaptive Dark-Mode Silhouette Filter:** Renders a subtle white luminance halo (`drop-shadow`) for dark transparent monochrome icons (GitHub, Notion, X, Vercel) on dark glass backdrops.
- **Persistent Icon Auto-Caching:** Automatically writes verified fallback URLs to local storage to eliminate redundant network roundtrips.

### 3. Curated Theme Engine & Dynamic Dark Synchronization
- 6 curated theme presets: *Default Glass*, *OLED Pitch Black*, *Nordic Slate*, *Sunset Rose*, *Graphite Carbon*, and *Porcelain Warm White*.
- Dynamic `@custom-variant dark` synchronization ensuring zero contrast bugs or white-on-white text in light themes regardless of operating system dark mode settings.
- Custom wallpaper background image URL support with granular blur and opacity sliders.

### 4. Productivity, Search & Data Portability
- Instant fuzzy search across titles and URLs with global `Cmd+K` / `Ctrl+K` shortcut and `Esc` dismissal.
- JSON backup export and import with strict Zod runtime schema validation (`BackupDataSchema`).
- Dedicated GitHub repository button in the floating header controls dock.
- Built-in accessible Privacy Policy and Terms of Service dialogs.

### 5. Production Bundle Profile
- **Transfer Size (Gzip):** **~120.8 kB** total network transfer for the full application.
- **JavaScript Bundle:** 371.32 kB raw / 106.36 kB gzipped.
- **CSS Stylesheet:** 78.17 kB raw / 13.90 kB gzipped.
- **Cold-Start Performance:** Sub-**10ms** load times as a Chrome Manifest V3 new tab extension.

---

## Assets & Downloads
- **Source Code:** [v1.0.0.zip](https://github.com/SuryanshSwarn09/bookshelf-for-browser/archive/refs/tags/v1.0.0.zip) | [v1.0.0.tar.gz](https://github.com/SuryanshSwarn09/bookshelf-for-browser/archive/refs/tags/v1.0.0.tar.gz)
- **Chrome Extension Package:** `bookshelf-v1.0.0-extension.zip` (119.4 KB) compiled directly from `dist/` ready to load unpacked or publish to the Chrome Web Store.
