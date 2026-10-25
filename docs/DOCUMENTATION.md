# Bookshelf Documentation

## Table of Contents
- [1. Overview & Core Mission](#1-overview--core-mission)
- [2. Feature Inventory](#2-feature-inventory)
  - [2.1 Interactive Bookmark Management](#21-interactive-bookmark-management)
  - [2.2 Intelligent Favicon Resolution Engine](#22-intelligent-favicon-resolution-engine)
  - [2.3 Visual Design & Theming System](#23-visual-design--theming-system)
  - [2.4 Productivity & Navigation](#24-productivity--navigation)
  - [2.5 Data Portability & Schema Validation](#25-data-portability--schema-validation)
- [3. System Architecture & Component Hierarchy](#3-system-architecture--component-hierarchy)
- [4. Storage Persistence & Runtime Abstraction](#4-storage-persistence--runtime-abstraction)
- [5. Engineering Improvements & Changelog](#5-engineering-improvements--changelog)
  - [5.1 Anti-Vibe Aesthetic Overhaul](#51-anti-vibe-aesthetic-overhaul)
  - [5.2 Whitespace & Density Compaction](#52-whitespace--density-compaction)
  - [5.3 Favicon Resolution Pipeline](#53-favicon-resolution-pipeline)
  - [5.4 Theme Contrast & Dark Mode Synchronization](#54-theme-contrast--dark-mode-synchronization)
  - [5.5 GitHub Repository Integration](#55-github-repository-integration)
- [6. Development & Verification Guide](#6-development--verification-guide)
- [7. Privacy, Security & License](#7-privacy-security--license)

---

## 1. Overview & Core Mission

**Bookshelf** is a focused, distraction-free browser dashboard and personal startpage. Built with React 19, TypeScript, and Vite, it serves as both an instant-loading Progressive Web Application and a Chromium Manifest V3 browser extension that overrides `chrome://newtab`.

Bookshelf is engineered around three foundational tenets:
1. **Local-First Privacy:** All user data (shortcuts, categories, visual settings) stays strictly within the user's browser runtime. There are no tracking scripts, external database dependencies, or remote telemetry collectors.
2. **Tactile, Professional Aesthetics:** The interface adheres to clean glassmorphism with continuous squircle geometry (`rounded-[22.5%]`), monochromatic grain textures, and structured typographic hierarchy. It avoids purple neon gradients, pill buttons, fake vanity counters, or artificial scroll gimmicks.
3. **Speed & Resilience:** Keyboard-driven shortcuts, zero-latency local lookups, and multi-tier network fallbacks ensure bookmarks remain instantly accessible and visually crisp under all network conditions.

---

## 2. Feature Inventory

### 2.1 Interactive Bookmark Management
- **Continuous Squircle Geometry:** Bookmarks are rendered as precision squircles with smooth curvature, providing an ergonomic, tactile touch target.
- **Always-On Drag-and-Drop:** Bookmarks can be reordered within a category or transferred across sections at any time using `@dnd-kit`.
- **Sensory Interaction:** Includes a 5px activation threshold on pointer sensors to differentiate between direct link navigation and drag gestures.
- **Workflow Sections:** Categorize links into dedicated workflow spaces (e.g., Work, Engineering, Reading, Media) with live counter badges.
- **Jiggle Edit Mode:** Toggling the Edit control activates visual feedback allowing direct in-place deletion and single-item favicon refresh.
- **Density Control:** Switch between Small (`sm`, 48px), Medium (`md`, 56px), and Large (`lg`, 68px) grid densities depending on screen size and visual preference.

### 2.2 Intelligent Favicon Resolution Engine
- **Multi-Tier Resolution Cascade:**
  1. *Tier 1:* Google S2 Favicon API (`https://www.google.com/s2/favicons?domain={domain}&sz=128`) requesting 128px high-resolution artwork.
  2. *Tier 2:* DuckDuckGo Favicon Service (`https://icons.duckduckgo.com/ip3/{domain}.ico`).
  3. *Tier 3:* Direct origin favicon probe (`https://{domain}/favicon.ico`).
  4. *Fallback:* Procedural letter monogram avatar derived from the bookmark title.
- **16px Generic Globe Rejection:** Google S2 returns HTTP 200 with an unhelpful 16x16 px gray globe placeholder when an icon is missing. Bookshelf inspects `naturalWidth <= 16 && naturalHeight <= 16` on image load, immediately rejecting the placeholder and advancing to Tier 2.
- **Adaptive Dark-Mode Luminescence:** Dark monochrome logos (such as GitHub, Notion, X, and Vercel) often disappear against dark glass backdrops. Bookshelf applies an adaptive white perimeter halo filter (`dark:[filter:drop-shadow(0_0_1.5px_rgba(255,255,255,0.7))]`) to keep transparent silhouettes legible without tinting colored icons.
- **Persistent Auto-Caching:** When a higher-tier fallback successfully resolves, its verified URL is automatically written to persistent storage, bypassing redundant network waterfalls on future visits.
- **One-Click Batch Repair:** The navigation dock displays a repair indicator if any icons are broken, providing a single trigger to bust stale browser caches with timestamp salts (`&cb={timestamp}`).

### 2.3 Visual Design & Theming System
- **Curated Theme Presets:**
  - *Default Glass:* Balanced slate translucency with deep ambient shadows.
  - *OLED:* Pure `#000000` pitch black backdrop optimized for OLED displays.
  - *Nordic:* Subtle deep slate-blue evoking sub-zero Scandinavian minimalism.
  - *Sunset:* Warm graphite with subtle dusty rose undertones.
  - *Graphite:* Muted charcoal carbon for understated productivity.
  - *Porcelain:* Clean `#f5f5f0` off-white theme tailored for bright daylight viewing.
- **Dynamic Dark-Mode Synchronization:** Eliminates Tailwind CSS v4 media query collisions where OS dark mode forced white-on-white text in light themes. The document element synchronizes `.dark` dynamically based on theme preset rules.
- **Custom Wallpaper Backdrops:** Supports external wallpaper image URLs with fine-grained opacity and backdrop blur sliders.
- **Monochromatic Grain:** Subtle SVG noise filter provides surface tactility without distracting neon colors.

### 2.4 Productivity & Navigation
- **Instant Search:** Fuzzy search across all bookmark titles and URLs with an automatic `Cmd+K` / `Ctrl+K` keyboard shortcut and instant `Esc` dismissal.
- **GitHub Repository Navigation:** Direct header icon linking to the official GitHub repository for source code inspection, issue reporting, and release notes.
- **Authentic Legal Dialogs:** Built-in modal dialogs for the Privacy Policy and Terms of Service, detailing local data handling without external legalese.

### 2.5 Data Portability & Schema Validation
- **JSON Backup & Restore:** Complete export and import capabilities for all bookmark records, categories, and custom preferences.
- **Zod Runtime Verification:** Imported backup files are validated against a strict Zod schema (`BackupDataSchema`) before applying state changes, preventing data corruption from malformed files.

---

## 3. System Architecture & Component Hierarchy

Bookshelf employs a decoupled state-and-presentation architecture:

```
                            +--------------------------+
                            |      Root Component      |
                            |       (src/App.tsx)      |
                            +------------+-------------+
                                         |
             +---------------------------+---------------------------+
             |                                                       |
+------------v------------+                             +------------v------------+
|    useBookmarks Hook    |                             |    useSettings Hook     |
| - Bookmark collection   |                             | - Active theme & mode   |
| - Category management   |                             | - Grid icon size (S/M/L)|
| - Drag-and-drop sort    |                             | - Wallpaper / blur      |
| - Favicon cache updates |                             | - Search query filter   |
+------------+------------+                             +------------+------------+
             |                                                       |
             +---------------------------+---------------------------+
                                         |
                            +------------v------------+
                            | Universal Storage API   |
                            | (Chrome Sync / Local)   |
                            +-------------------------+
```

### Component Breakdown
- `src/App.tsx`: Central coordinator managing active dialog states, keyboard listeners, and layout structure.
- `src/components/Header.tsx`: Top floating glass dock housing the search input, import/export buttons, density toggles, section creator, wallpaper settings, GitHub repository link, and edit mode toggle.
- `src/components/CategoryTabs.tsx`: Filter rail allowing category switching with numeric bookmark tallies.
- `src/components/SortableBookmark.tsx`: Sortable squircle tile utilizing `@dnd-kit`'s `useSortable` hook, supporting touch gestures, multi-tier favicon fallback handling, and jiggle animation.
- `src/components/AddBookmarkModal.tsx`: Accessible dialog for adding or editing bookmarks with auto-suggested favicons and real-time validation.
- `src/components/SectionModal.tsx`: Creation modal for custom categories.
- `src/components/WallpaperModal.tsx`: Customization panel for themes, custom background images, opacity, and blur parameters.
- `src/components/LegalModals.tsx`: Accessible Privacy Policy and Terms of Service dialogs.

---

## 4. Storage Persistence & Runtime Abstraction

Bookshelf utilizes an abstraction layer (`storageAdapter` in `src/utils.ts`) that detects the current runtime environment:
- **Chrome Extension Runtime:** If `chrome?.storage?.sync` is available, bookmarks and preferences sync across the user's signed-in browser profiles. If synchronization storage quotas are exceeded, it gracefully falls back to `chrome.storage.local`.
- **Web Application Runtime:** If running as a standard web page (e.g., hosted on Vercel or locally), it persists directly to `window.localStorage` with the same key-value interface.

```typescript
// Runtime detection pattern
export const storageAdapter = {
  get: async <T>(key: string, fallback: T): Promise<T> => {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      const data = await chrome.storage.sync.get(key);
      return data[key] ?? fallback;
    }
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      await chrome.storage.sync.set({ [key]: value });
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }
};
```

---

## 5. Engineering Improvements & Changelog

### 5.1 Anti-Vibe Aesthetic Overhaul
- Eliminated generic purple gradients and neon drop-shadows in favor of subtle monochromatic glassmorphism.
- Replaced pill-shaped buttons (`rounded-full`) with balanced geometric radiuses (`rounded-lg` and `rounded-xl`).
- Removed all simulated reviews, fake social proof metrics, and artificial customer counters.
- Purged all emoji icons, em-dashes, and AI marketing labels.

### 5.2 Whitespace & Density Compaction
- Tightened outer viewport vertical padding (`py-6 sm:py-8` reduced to `py-3 sm:py-4`) to eliminate dead space on compact laptops.
- Condensed the header dock height, search field footprint, and action icon padding.
- Compacted the bookmark grid layout gap (`gap-4` to `gap-2.5 sm:gap-3`) and category rail tabs for improved information density.
- Reduced modal dialog internal paddings from `p-6` to `p-4.5` and input field margins from `mb-4` to `mb-2.5`.

### 5.3 Favicon Resolution Pipeline
- Built a multi-tier fallback pipeline resolving domains through Google S2 (128px), DuckDuckGo, and direct origin `/favicon.ico`.
- Integrated an automated inspection step that catches Google's 16x16 generic gray globe placeholder image on load, bypassing it immediately.
- Implemented an adaptive white silhouette glow (`drop-shadow`) for dark transparent icons (GitHub, Notion, X) against dark themes.
- Added persistent auto-caching of verified fallback icon URLs into bookmark storage to eliminate repeated waterfall queries.

### 5.4 Theme Contrast & Dark Mode Synchronization
- Diagnosed and rectified a contrast failure in the Porcelain light theme (`#f5f5f0`) where Tailwind CSS v4's media query activated `dark:text-...` classes under OS dark mode, rendering text white-on-white.
- Configured `@custom-variant dark (&:where(.dark, .dark *));` in `src/index.css`.
- Synchronized the root document `.dark` class dynamically inside `useSettings` based on the active theme preset, guaranteeing crisp contrast across all operating systems.

### 5.5 GitHub Repository Integration
- Added an official GitHub mark button to the top floating dock header.
- Configured secure external navigation (`target="_blank" rel="noopener noreferrer"`) directly to the project repository.
- Styled the trigger to match surrounding glassmorphism controls with focus-visible keyboard outlines and tooltip accessibility labels.

---

## 6. Development & Verification Guide

### Prerequisites
- Node.js 18+
- npm 9+

### Commands
```bash
# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Run TypeScript compiler typecheck
npm run lint

# Execute automated Vitest test suite
npm run test

# Build production bundle (Web + Extension)
npm run build
```

### Build Output
Running `npm run build` generates a standalone `dist/` directory containing:
- Bundled and minified HTML, CSS, and JS assets.
- `manifest.json` configured for Chrome Manifest V3 `chrome_url_overrides.newtab`.
- Complete offline capability ready for hosting on static edge networks or packaging as an unpacked browser extension.

---

## 7. Privacy, Security & License

- **Zero Data Collection:** Bookshelf does not collect, log, transmit, or monetize browsing history or bookmarks.
- **Offline First:** Operates entirely without an external backend server.
- **License:** Distributed under the permissive [MIT License](https://github.com/SuryanshSwarn09/bookshelf-for-browser/blob/main/LICENSE).
