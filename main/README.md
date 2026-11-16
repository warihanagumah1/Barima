# Barima Holdings: main website

Static site, no build step. Open `index.html` in a browser to view it.

- `index.html`: the Barima Holdings homepage (hero, three company cards, where we operate, about, the Barima promise, contact directory per company)
- `css/styles.css`: styles (clean white layout in Barima blue #0b1f4b and red #d6202e; logo is live text: "Barima" in Yellowtail script, red with a blue offset, over HOLDINGS)
- `js/main.js`: mobile menu, header on scroll, scroll animations
- `assets/favicon.svg`: script "B" icon
- `assets/images/`: `automobile.jpg` (from the automobile site), `homes.jpg` (Wikimedia Commons, Kwameghana, CC BY-SA 4.0: needs a visible credit before launch), `cuisine.jpg` (Barima Cuisine's own photo; confirm the client owns it)

Links to the sister sites are relative (`../automobile/index.html`, `../homes/index.html`) so they work locally.
When the domain is known, replace them with the subdomains (e.g. `https://automobile.<domain>`, `https://homes.<domain>`).
Barima Cuisine links to its existing site, https://barimacuisine.com/.

To deploy, upload the contents of `main/` to the parent domain's web root.
