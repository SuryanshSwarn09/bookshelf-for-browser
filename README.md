## Features & Version History

### Core Functionality

* **Custom Categories:** Group shortcuts into custom workflow sections (e.g., Work, Entertainment, Tech).
* **Always-On Drag & Drop:** Reorder bookmarks or move them across sections anytime using `@dnd-kit`.
* **Adjustable Layouts:** Toggle icon grid density between Small (S), Medium (M), and Large (L).
* **Smart Favicons:** Auto-fetch high-resolution site icons via Google Favicon API with manual refresh support.
* **Backup & Sync:** Import/export data via JSON files.
* **Custom Wallpapers & Themes:** Supports system light/dark themes and custom background image URLs with opacity/blur controls.

### Recent UI & UX Enhancements

* **iOS Glassmorphism:** Implemented continuous squircle tiles (`rounded-[22.5%]`), ambient animated background mesh, and floating glass pill docks for controls and section navigation.
* **Jiggle Edit Mode:** Prominent Edit/Done toggle activates iOS-style tile jiggling with direct action badges for deletion (top-right) and favicon refresh (top-left).
* **Navigation & Typography:** Bookmarks default to opening in new tabs (`target="_blank"`). Global typography updated to Google Fonts Poppins.
* **Modal Accessibility & Contrast:** Redesigned popup modals with theme-matched container backgrounds, high-contrast input fields, keyboard `Esc` key dismissal, and backdrop click closing.
* **Dock Streamlining:** Removed the Pomodoro clock widget for a minimal layout.

## Setup & Deployment

### Local Development

```bash
npm install     # Install dependencies
npm run dev     # Start development server at http://localhost:3000
npm run lint    # Run code verification

```

### Vercel Deployment

```bash
npm install -g vercel   # Install Vercel CLI
vercel                  # Initial deployment setup
vercel --prod           # Deploy directly to production

```

## Technical Architecture & Overview

**Bookshelf** is an iOS-inspired, glassmorphic new tab dashboard and bookmark management engine built with React 19, TypeScript, and Vite. Designed to run both as a ultra-fast Web Application and as a Manifest V3 Browser Extension (Chrome, Edge, Firefox, Brave), Bookshelf provides drag-and-drop shortcut organization, custom category workflows, instant fuzzy search, and universal storage persistence.

---

## 1. Tech Stack Overview

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Framework & Runtime** | React 19, TypeScript 5.8 | Modern component architecture & strict compile-time type safety |
| **Build & Bundler** | Vite 6, Esbuild | Instant HMR dev server and optimized production assets bundler |
| **Styling & Aesthetics** | TailwindCSS v4, Vanilla CSS | Continuous squircle geometry, glassmorphism, ambient blob animations |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` | Accessibility-compliant, multi-sensor grid reordering |
| **Validation & Schema** | Zod 3 | Runtime validation for imported backup JSON structures |
| **Icons & Typography** | Lucide React, Google Fonts | Poppins font & vector micro-iconography |
| **Testing** | Vitest 4, JSDOM, `@testing-library/react` | Single-fork isolate unit and integration testing runner |
| **Extension Standard** | Chrome Manifest V3 | `chrome_url_overrides` for instant New Tab takeover |

---

## 2. System Architecture & Modular Design

Bookshelf uses a decoupled state-and-presentational pattern to keep UI rendering lightweight while centralizing data mutations:

```
                          ┌──────────────────────────┐
                          │   Browser / New Tab Page │
                          └────────────┬─────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │      App Composition        │
                        │        (src/App.tsx)        │
                        └──────┬──────────────┬───────┘
                               │              │
        ┌──────────────────────▼──┐        ┌──▼──────────────────────┐
        │     useBookmarks Hook   │        │     useSettings Hook    │
        │ - Bookmarks / Sections  │        │ - Layout (Grid Size)    │
        │ - Drag-and-Drop Handler │        │ - Wallpaper, Opacity    │
        │ - Backup Import/Export  │        │ - Active Category Tab   │
        └──────────────┬──────────┘        └──────────┬──────────────┘
                       │                              │
                       └──────────────┬───────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │   Universal Storage Adapter │
                       │    (chrome.storage / LS)    │
                       └─────────────────────────────┘
```

### Core Modules:

1. **Custom Hooks Layer ([`src/hooks/`](file:///e:/bookshelf-for-browser/src/hooks)):**
   * [`useBookmarks`](file:///e:/bookshelf-for-browser/src/hooks/useBookmarks.ts): Encapsulates bookmark creation, section filtering, broken favicon detection/repair, drag-and-drop reordering via `@dnd-kit`, and JSON backup validation.
   * [`useSettings`](file:///e:/bookshelf-for-browser/src/hooks/useSettings.ts): Manages layout preferences (grid density `sm`/`md`/`lg`), wallpaper backdrop filters (opacity/blur), search query state, and edit mode.

2. **Presentational Components ([`src/components/`](file:///e:/bookshelf-for-browser/src/components)):**
   * [`Header`](file:///e:/bookshelf-for-browser/src/components/Header.tsx): Top glass dock containing workspace title, search input (`Cmd+K`), import/export triggers, icon size control, new section modal trigger, and edit mode toggle.
   * [`CategoryTabs`](file:///e:/bookshelf-for-browser/src/components/CategoryTabs.tsx): Segmented tab control with live bookmark counter badges per category.
   * [`SortableBookmark`](file:///e:/bookshelf-for-browser/src/components/SortableBookmark.tsx): Individual shortcut tile wrapped in `@dnd-kit`'s `useSortable` hook. Supports iOS-style tile jiggle in Edit Mode.
   * [`AddBookmarkModal`](file:///e:/bookshelf-for-browser/src/components/AddBookmarkModal.tsx), [`SectionModal`](file:///e:/bookshelf-for-browser/src/components/SectionModal.tsx), [`WallpaperModal`](file:///e:/bookshelf-for-browser/src/components/WallpaperModal.tsx): Accessible modal dialogs (`role="dialog"`, `aria-modal="true"`) for user operations.

---

## 3. Key Technical Features

### A. Universal Storage Abstraction ([`storageAdapter`](file:///e:/bookshelf-for-browser/src/utils.ts#L72-L124))
Bookshelf seamlessly operates across both browser extensions and web deployments through an abstraction layer:
* **Extension Mode:** Interacts asynchronously with `chrome.storage.sync` (syncing user bookmarks across Chrome profiles) or `chrome.storage.local`.
* **Web Mode Fallback:** Automatically falls back to standard `window.localStorage` when running outside an extension runtime context.

### B. Drag-and-Drop Engine
Implemented using `@dnd-kit/core` with `PointerSensor` (configured with a 5px activation threshold to allow crisp click navigation) and `KeyboardSensor` (for full accessibility keyboard navigation).

### C. Smart Favicon Fetching & Auto-Healing
Favicons are generated dynamically via Google's high-resolution Favicon API (`https://www.google.com/s2/favicons?domain=...&sz=128`).
* **Auto-Healing:** If an icon fails to load, `SortableBookmark` registers the broken ID. The user can repair all broken icons in 1 click using the `FIX` trigger in the header, which appends cache-busting timestamps (`&cb=TIMESTAMP`).

### D. Data Integrity & Schema Validation ([`validateBackup`](file:///e:/bookshelf-for-browser/src/utils.ts#L63-L65))
Imported JSON backups undergo strict runtime verification via **Zod** (`BackupDataSchema`). Malformed or corrupted upload files are safely caught before mutating state.

---

## 4. Manifest V3 Extension Specification

Bookshelf includes a Manifest V3 declaration in [`public/manifest.json`](file:///e:/bookshelf-for-browser/public/manifest.json):
```json
{
  "manifest_version": 3,
  "name": "Bookshelf - Glassmorphic Startpage Dashboard",
  "version": "1.0.0",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [
    "storage"
  ]
}
```
This allows building a single output bundle (`npm run build`) that works as a hosted web app (e.g. on Vercel/Netlify) and as an offline Chrome Web Store `.zip` extension bundle.

---

## 5. Performance & Build Profile

* **Production Bundle Size:** ~98 kB gzipped JS / 8 kB gzipped CSS.
* **Build Time:** < 17 seconds via Vite and Esbuild.
* **Type Checking:** 100% strict mode compliance via `tsc --noEmit`.
* **Testing:** Automated Vitest test suite executing in isolated single-fork mode.

## License

This project is licensed under the [MIT License](LICENSE).