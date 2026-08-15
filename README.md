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

---