# Migration Checklist

Interactive checklist for migrating the **AI-NT-No-Problem** homelab workstation from ATX to SFF with a custom water-cooling loop.

## What

- **From:** ASRock X870 Pro-A WiFi (ATX) + 360mm AIO
- **To:** Asus ROG Strix X870-i (Mini-ITX) in Hardline Nexus Morph R2 + custom single-loop water cooling
- **CPU:** AMD Ryzen 9 9950X3D (16C/32T)
- **GPU:** NVIDIA RTX 5090 32GB

## Features

- 9 migration phases, 214 checkable items with sub-tasks
- Synced state via API — works across devices and agents
- localStorage fallback when offline
- Search/filter with text highlighting
- Collapsible sections with per-section progress bars
- Warning/danger callouts for critical steps
- Mobile-friendly — PWA-ready for iPhone home screen
- Dark theme, print mode
- Zero frontend dependencies — single HTML file

## API

Base URL: `https://migration-checklist.vercel.app`

### Read state

```bash
curl https://migration-checklist.vercel.app/api/checklist
```

Returns:
```json
{
  "checked": { "s1-i1": true, "s1-i1-sub1": true },
  "timestamps": { "s1-i1": "2025-06-18T...", "s1-i1-sub1": "2025-06-18T..." },
  "lastInteraction": "2025-06-18T..."
}
```

### Check off items

```bash
curl -X PATCH https://migration-checklist.vercel.app/api/checklist \
  -H "Content-Type: application/json" \
  -d '{"check": ["s1-i1", "s1-i1-sub1", "s1-i1-sub2"]}'
```

### Uncheck items

```bash
curl -X PATCH https://migration-checklist.vercel.app/api/checklist \
  -H "Content-Type: application/json" \
  -d '{"uncheck": ["s1-i1"]}'
```

### Replace full state

```bash
curl -X PUT https://migration-checklist.vercel.app/api/checklist \
  -H "Content-Type: application/json" \
  -d '{"checked": {}, "timestamps": {}, "lastInteraction": null}'
```

### Reset everything

```bash
curl -X PATCH https://migration-checklist.vercel.app/api/checklist \
  -H "Content-Type: application/json" \
  -d '{"reset": true}'
```

### Item ID scheme

Items follow the pattern `s{section}-i{item}` with optional `-sub{n}`:
- `s1-i1` = Section 1, Item 1 (top-level)
- `s1-i1-sub1` = Section 1, Item 1, Sub-item 1
- `s4-i11` = Section 4, Item 11 (Leak test)
- `s8-i1` = Section 8, Item 1 (Run post-migration thermal test)

### Sections

1. Pre-Migration — Backups & Documentation
2. Pre-Migration — Software Preparation
3. Hardware Disassembly (Old Case)
4. Custom Water-Cooling Loop Assembly
5. First Boot & BIOS Configuration
6. Linux Post-Migration
7. Windows Post-Migration
8. Post-Migration — Thermal Validation
9. Cleanup & Verification

## Deploy

Connected to Vercel. Push to `main` to redeploy.

Requires a Vercel KV (Upstash Redis) store linked to the project for API state persistence.

## Local

Open `index.html` in a browser. Checklist works offline with localStorage. API sync requires the Vercel deployment.
