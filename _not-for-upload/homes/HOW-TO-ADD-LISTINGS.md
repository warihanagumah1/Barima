# How to add and update Barima Homes listings

The Listings page can read its properties straight from a Google Sheet.
Once it's set up, you add, edit, mark as sold or delete a property in the
sheet, and the website updates by itself. You don't need to touch any code.

## One-time setup (about 5 minutes)

1. Open Google Sheets and create a blank spreadsheet. Name it "Barima Homes listings".
2. Go to **File → Import → Upload** and choose `listings-template.csv` from this folder.
   Pick **Replace spreadsheet** and click **Import data**. You'll see the column
   names and the current listing (The Belvoir), one row per property.
3. Go to **File → Share → Publish to web**.
   - Under "Link", choose the sheet (tab) with the listings, then choose
     **Comma-separated values (.csv)**.
   - Click **Publish** and copy the link it gives you.
4. Send that link to your web person (or paste it between the quotes on the line
   `var SHEET_CSV_URL = "";` near the top of `js/listings.js`) and upload the
   site once. That's it.

After that, changes you make in the sheet appear on the website within about
5 minutes (Google refreshes published sheets every few minutes).

## The columns

Keep the first row (the column names) exactly as it is. One row = one property.

| Column    | What to put in it | Example |
|-----------|-------------------|---------|
| ref       | Your own reference code. It's included in the WhatsApp message. | BH-H06 |
| status    | `available` or `sold`. Sold ones go to the bottom and look faded. | available |
| type      | `house`, `apartment` or `land` | house |
| title     | Short name shown on the card | 4-bedroom house with pool |
| location  | Area and town | East Legon, Accra |
| price     | What visitors see | GH₵ 1,200,000 or Price on request |
| amount    | Optional. The price as a plain number, so the budget search works when the price says "Price on request". | 1200000 |
| bedrooms  | Optional | 4 |
| size      | Optional, mainly for land | 100 x 70 ft |
| features  | Optional. Separate them with a `\|` | Pool \| Boys' quarters \| Gated |
| description | Optional. A short paragraph shown when a visitor opens the listing. | Newly finished 4-bedroom home… |
| image     | The main photo, shown first on the card (see Photos below) | house-1.jpg |
| photos    | Optional extra photos, separated by `\|`. Cards with extra photos get arrows. | interior-1.jpg \| kitchen.jpg |
| videos    | Optional videos, separated by `\|` (see Videos below). | https://youtu.be/abc123XYZ00 \| tour.mp4 |

Rows with no title or an unknown type are skipped, and so are rows with no photo and no video.
If a listing has a video but no photo, the video's picture is used on the card.

## Photos

You can use either way, and mix them:

- **Google Drive (easiest).** Upload the photo to Google Drive, right-click it,
  choose **Share**, set "General access" to **Anyone with the link**, click
  **Copy link** and paste that link into the `image` or `photos` column.
- **Website folder.** Put the photo in `homes/assets/images/` on the website and
  type just its file name (for example `east-legon-house.jpg`) in the sheet.

Landscape photos at least 1200 pixels wide look best.

## Videos

Listings with a video get a **Watch video** button on the card. Visitors click a
card to open the full listing, where photos and videos sit together in one
gallery and the video plays right on the page. You can use any of these, and mix
them:

- **YouTube (best for long or large videos).** Upload the video to YouTube (it
  can be set to **Unlisted** so it only shows on your site), click **Share**,
  copy the link and paste it into the `videos` column. Normal links, `youtu.be`
  links and Shorts all work.
- **Google Drive.** Upload the video, share it as **Anyone with the link**, copy
  the link and paste it in. Drive can take a few minutes to get a new video ready.
- **Website folder.** Put the video file in `homes/assets/videos/` on the website
  and type just its file name (for example `belvoir-tour.mp4`). Use **.mp4** and
  keep it under about 50 MB so it loads quickly on phones. Videos sent through
  WhatsApp are usually already the right size.

### Keep photos and videos small

Big files make the page slow on phones and fill up the hosting space. Before
adding files to the website folder:

- **Photos:** about 1280 pixels wide is plenty. Save them as **.webp** (or .jpg at
  about 80% quality). A photo should usually be **under 200 KB**. Free tools:
  [squoosh.app](https://squoosh.app) (drag the photo in, pick WebP, download).
- **Videos:** MP4, 720p or 960 pixels wide, **under about 20 MB** for a 2-minute
  tour. Free tool: [HandBrake](https://handbrake.fr) with the "Fast 720p30" preset.
  For anything longer than about 3 minutes, use YouTube instead.
- **Cover picture for a video:** put a .webp with the same name next to the video
  (for example `tour.mp4` + `tour.webp`). Visitors see that picture first, and the
  video only downloads when they press play. Without one, the listing's main photo
  is used.

The Belvoir's files were compressed this way: the video went from 14.5 MB to 7 MB
and the photos from about 860 KB to 380 KB in total, with no visible loss.

Tip: a nice still from the video makes a good main photo. Your web person can
pull clean frames out of a video for you (that's how The Belvoir's photos were made).

## Sharing one listing

Each listing has its own link: add `#` and the ref to the page address, for example
`https://homes.barimaholdings.com/listings.html#BH-H01`. Opening it goes straight
to that listing with its photos and video.

## If the sheet can't be reached

If the link is missing or Google is unreachable, the page falls back to the
listings written in `js/listings.js`. If there are no listings at all, the page
shows a "New listings coming soon" message with your call and WhatsApp buttons.
