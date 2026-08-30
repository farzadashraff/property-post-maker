# Property Post Maker

Fill 4 fields, get a ready-to-share, branded property post — no design work needed.

**Live:** https://farzadashraff.github.io/property-post-maker/

## What it does

Enter:
- **Property & Type** — e.g. "4 BHK Luxury Villa, Ansal Golf City"
- **Location** — e.g. "Sushant Golf City, Lucknow"
- **Price** — e.g. "₹2.5 Cr onwards"
- **Highlights** — e.g. "3000 sq.ft · Corner plot · Ready to move"

The tool renders a 1080×1350 portrait creative live on an HTML5 canvas: hero band with price, wrapped headline, location with a pin icon, highlight chips, and a brand strip with logo, name, and contact — all added automatically. Click **Download Post (PNG)** to export.

## Stack

Vite + React + TypeScript + Tailwind CSS. Post rendering is plain Canvas 2D — no server, no image API, fully client-side.

## Development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Builds and pushes `dist/` to the `gh-pages` branch, served by GitHub Pages.
