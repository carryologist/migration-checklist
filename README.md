# Migration Checklist

Interactive checklist for migrating the **AI-NT-No-Problem** homelab workstation from ATX to SFF with a custom water-cooling loop.

## What

- **From:** ASRock X870 Pro-A WiFi (ATX) + 360mm AIO
- **To:** Asus ROG Strix X870-i (Mini-ITX) in Hardline Nexus Morph R2 + custom single-loop water cooling
- **CPU:** AMD Ryzen 9 9950X3D (16C/32T)
- **GPU:** NVIDIA RTX 5090 32GB

## Features

- 9 migration phases, 80+ checklist items with sub-tasks
- Progress tracking with localStorage persistence (survives refresh/close)
- Search/filter with text highlighting
- Collapsible sections with per-section progress bars
- Warning/danger callouts for critical steps (leak testing, DDU, etc.)
- Before/after hardware comparison card
- Mobile-friendly — designed for iPhone use during the build
- Dark theme
- Print mode
- Zero dependencies — single HTML file, no build step

## Deploy

Deployed on Vercel. Push to `main` to redeploy.

```bash
vercel --prod
```

## Local

Just open `index.html` in a browser. Everything is self-contained.

## Related

- Thermal test harness & baseline results: `carryologist/the-vibe-coder-content`
- Post-migration test: `~/thermal-test.sh --output-dir ~/thermal-tests/after`
