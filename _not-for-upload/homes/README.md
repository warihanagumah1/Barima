# Barima Homes website

Static site, no build step. Open `index.html` in a browser to view it.

- `index.html`: the page (photo hero with a quick property finder, land & houses, photo gallery, why litigation-free, steps, FAQ, call band)
- `listings.html` + `js/listings.js`: the Listings page. Listings can come from a published Google Sheet: see `HOW-TO-ADD-LISTINGS.md` and the template `listings-template.csv`. Paste the sheet's CSV link into `SHEET_CSV_URL` at the top of `js/listings.js`. Until then (or if the sheet can't load) the page uses the `LISTINGS` array in the same file. Each listing has a status of "available" or "sold"; sold ones sort to the bottom. Listings can have photos and videos (YouTube, Vimeo, Google Drive or .mp4 files in `assets/videos/`); clicking a card opens a detail view with a photo/video gallery, and `listings.html#<ref>` links straight to one listing. With no listings the page shows a "coming soon" panel. Sample listings were removed on 2026-11-26 (old files in `../_backups/`).
- `css/styles.css`: styles. Brand colours sampled from the Barima Homes flyer: black #010101, red #DA0417, gold #F7BB09 (text gold #F3C912), white
- `js/main.js`: mobile menu, header on scroll, scroll animations, and the scroll effects. The hero finder sends type, area and budget to the Listings page, which filters by them (an optional `amount` in cedis on a listing lets the budget search apply to it)
- `assets/images/`: photos (sources and licences in `CREDITS.txt`, an internal record that is not linked from the site)
- Logo: the actual artwork cut out of the Barima Homes flyer (same shapes and colours), with the black background made transparent: `assets/logo-full.webp/.png` (stacked, as on the flyer, used in the footer), `assets/logo-mark.*` + `assets/logo-word.*` (the same artwork split in two for the one-line header). Favicons: `favicon-32.png`, `apple-touch-icon.png`, `favicon-512.png`. Made for dark backgrounds. Older redrawn SVG versions (`logo*.svg`, `favicon.svg`) are kept as a fallback. Source flyer in `assets/source/flyer.jpg`.

To deploy, upload the whole `homes/` folder to the subdomain's web root.
