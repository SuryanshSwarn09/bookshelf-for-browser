# 📚 Bookshelf

A beautiful, minimalist, and dynamic personal bookmark dashboard designed to serve as your browser's default start page. Organized, responsive, and tailored for daily workspace efficiency.

---

## Features

- **Custom Sections**: Group your shortcuts into custom categories (e.g., Work, Entertainment, Tech) to match your workflow.
- **Drag-and-Drop Sorting**: Seamlessly reorder bookmarks or move them between sections using fluid mouse/touch drag interactions powered by `@dnd-kit`.
- **Adjustable Icon Sizing**: Instantly toggle between **Small (S)**, **Medium (M)**, and **Large (L)** layouts. The grid automatically adjusts to optimize your screen density.
- **Smart Favicons**: Automatically fetches high-resolution site icons using Google's favicon API with an on-demand cache-busting refresh button.
- **Backup & Sync**: Import and export your data as a clean JSON backup file to move your bookshelf setup to any device.
- **Browser-Matched Themes**: Built-in responsive styling that aligns with your system’s light/dark settings.

---

## Running Locally

### Prerequisites

- **Node.js** (v18 or higher)

### Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Verify/Typecheck your code**:
   ```bash
   npm run lint
   ```

---

## Deployment (Vercel)

This application is ready to deploy directly to Vercel as a static Single Page Application (SPA).

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run the deployment setup from the project root:
   ```bash
   vercel
   ```

3. Push directly to production:
   ```bash
   vercel --prod
   ```

*Refer to [vercel.json](vercel.json) in the root directory for routing rewrite rules.*
