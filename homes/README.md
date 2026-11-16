# Barima Homes website

Static site, no build step. Open `index.html` in a browser to view it.

- `index.html`: the page (photo hero with a quick property finder, land & houses, photo gallery, why litigation-free, steps, FAQ, call band)
- `listings.html` + `js/listings.js`: the Listings page. Listings can come from a published Google Sheet: see `HOW-TO-ADD-LISTINGS.md` and the template `listings-template.csv`. Paste the sheet's CSV link into `SHEET_CSV_URL` at the top of `js/listings.js`. Until then (or if the sheet can't load) the page uses the `LISTINGS` array in the same file. Each listing has a status of "available" or "sold"; sold ones sort to the bottom. The current entries are placeholders.
- `css/styles.css`: styles (black, maroon, red and gold from the Barima Homes card)
- `js/main.js`: mobile menu, header on scroll, scroll animations, and the scroll effects. The hero finder sends type, area and budget to the Listings page, which filters by them (an optional `amount` in cedis on a listing lets the budget search apply to it)
- `assets/images/`: photos (sources and licences in `CREDITS.txt`, an internal record that is not linked from the site)
- The logo is redrawn as SVG inside `index.html` (symbol `#logo-mark`)

To deploy, upload the whole `homes/` folder to the subdomain's web root.
