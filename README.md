# Veritaz Consulting Services — Website

Static multi-page site (HTML, CSS, vanilla JS). No build step, so it deploys to Vercel as is.

## Pages
- `index.html` — Home
- `about.html` — About
- `services.html` — All 10 services, with category filter
- `contact.html` — Contact details, call/WhatsApp panel and map
- `404.html` — Not-found page

## Deploy on Vercel
1. Push this folder to a GitHub repo (or run `npx vercel` inside it).
2. In Vercel: Add New Project → import the repo → Framework Preset: **Other** → leave Build Command and Output Directory empty → Deploy.
3. Project Settings → Domains → add `www.veritazconsultingservices.com` and follow the DNS instructions.

`vercel.json` enables clean URLs (`/about` instead of `/about.html`) and adds security and cache headers.

## Editing
- Colours and fonts: variables at the top of `css/style.css`.
- Contact number and WhatsApp link: search for `94778211496`.
- For sharper logos on large screens, replace `assets/logo-mark@2x.png` with a higher-resolution transparent PNG or SVG of the emblem.
