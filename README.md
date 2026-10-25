# MEIS Seniors '27: how to publish and edit

You do not need to code. You only ever edit **content.js** (text) and drop photos into folders.

## What is in the folder
- `index.html`, `style.css`, `app.js`: the website. Do not edit these.
- `content.js`: ALL your text, dates, names and trips. Edit this one.
- `photos/`, `people/`, `trips/`: your pictures.
- `Code.gs`: the secret-mail "post office". It goes into Google (steps below), not onto the website.

## PART A: Put the website online (free, Vercel + GitHub)
1. Make a free account at **github.com** (Sign up).
2. Click **+** (top right) > **New repository**. Name it `meis-seniors-2027`. Choose **Public**. Click **Create repository**.
3. On the next page click **uploading an existing file**. Open the unzipped `meis-site` folder on your computer, select EVERYTHING inside it (index.html, style.css, app.js, content.js, the three folders, Code.gs, README.md) and drag it all into the page. Click **Commit changes**.
4. Make a free account at **vercel.com** using **Continue with GitHub**.
5. Click **Add New > Project**, find `meis-seniors-2027`, click **Import**, then **Deploy**. Leave every setting as it is.
6. After ~30 seconds you get a link like `meis-seniors-2027.vercel.app`. Open it on your phone. That's your site.
7. **Short permanent link for the QR code:** in Vercel open the project > **Settings > Domains**. Edit the free `.vercel.app` name to something short like `meis27` (it must be free). Test it. Once it works, make the QR code from that link and never rename it again. Keep your Vercel and GitHub accounts forever.

**To change anything later:** edit the file or add photos on GitHub (open the folder, **Add file > Upload files**, drop them, **Commit changes**). The site updates by itself in about 30 seconds. The link never changes.

## PART B: Connect the secret mail (Google Sheets, free)
8. Go to **sheets.google.com**, create a blank spreadsheet, name it `MEIS Post Office`.
9. Click **Extensions > Apps Script**. Delete everything there. Open `Code.gs`, copy ALL of it, paste it in, click the save icon. Close that tab.
10. Back in the sheet, refresh the page. A new menu **MEIS** appears. Click **MEIS > 1) Create the tabs**. Allow permission when Google asks (Advanced > Go to project > Allow). Run it once more if it says nothing happened.
11. Open the **People** tab. Put every name in column A (copy them from `content.js`, **spelled exactly the same**). Then click **MEIS > 2) Make codes for empty rows**. Column B now has each person's 5-digit code. Send each person their code on WhatsApp.
12. Open the **Settings** tab. Cell B1 is the **manager code**. Keep it secret.
13. Click **Deploy > New deployment**. Click the gear > **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Click **Deploy**, copy the **Web app URL** (ends with `/exec`).
14. Open `content.js`, paste the URL between the quotes in `mailApi: ""`, save it and upload it again (see "To change anything later").

**Manager:** on the Secret Mail page open **My mailbox > I'm the manager**, enter the manager code from Settings B1, and you see every letter with a **delete** button. You can also just delete rows in the **Messages** tab.
**See and manage:** People tab = names and codes, Messages tab = every letter. Change a code by typing a new number in column B.
If you edit the Apps Script code later: **Deploy > Manage deployments > edit > New version > Deploy**.

## WHERE THE PHOTOS GO
- **Gallery (Photo Spin):** put photos in `photos/` named `1.jpg`, `2.jpg`, `3.jpg`... (small letters, `.jpg`). They show up by themselves. The group photo for the home page is `photos/group.jpg`.
  Want captions or other file names? Add a line in `content.js` under `photos:` like `["beach.jpg", "the day the sand won"],`
- **People:** put photos in `people/`. Name = person in small letters with dashes. Their photo `eyad-taha.jpg`, baby photo `eyad-taha-baby.jpg`. No photo yet? A funny placeholder shows.

| Name | Photo file | Baby file |
|---|---|---|
| Eyad Taha | eyad-taha.jpg | eyad-taha-baby.jpg |
| Sodfa | sodfa.jpg | sodfa-baby.jpg |
| Jamila Amr | jamila-amr.jpg | jamila-amr-baby.jpg |
| Mohamed Alaa | mohamed-alaa.jpg | mohamed-alaa-baby.jpg |
| Khalid | khalid.jpg | khalid-baby.jpg |
| Ahmed Mahmoud | ahmed-mahmoud.jpg | ahmed-mahmoud-baby.jpg |
| Eyad Ashraf | eyad-ashraf.jpg | eyad-ashraf-baby.jpg |
| Mohamed Essam | mohamed-essam.jpg | mohamed-essam-baby.jpg |
| Nabil | nabil.jpg | nabil-baby.jpg |
| Fares | fares.jpg | fares-baby.jpg |
| Bedo | bedo.jpg | bedo-baby.jpg |
| Abdullah Mansour | abdullah-mansour.jpg | abdullah-mansour-baby.jpg |
| Youssef Zaky | youssef-zaky.jpg | youssef-zaky-baby.jpg |
| Lojy | lojy.jpg | lojy-baby.jpg |
| Rodine | rodine.jpg | rodine-baby.jpg |
| Yahya Wael | yahya-wael.jpg | yahya-wael-baby.jpg |
| Youssef Wael | youssef-wael.jpg | youssef-wael-baby.jpg |
| Youssef Sayed | youssef-sayed.jpg | youssef-sayed-baby.jpg |
| Ahmed Younis | ahmed-younis.jpg | ahmed-younis-baby.jpg |
| Menna | menna.jpg | menna-baby.jpg |
| Zeina Ahmed | zeina-ahmed.jpg | zeina-ahmed-baby.jpg |
| Sandy | sandy.jpg | sandy-baby.jpg |
| Youssef Tarek | youssef-tarek.jpg | youssef-tarek-baby.jpg |
| Ayten | ayten.jpg | ayten-baby.jpg |
| Jumana | jumana.jpg | jumana-baby.jpg |
| Retaj | retaj.jpg | retaj-baby.jpg |
| Fajr | fajr.jpg | fajr-baby.jpg |
| Abdullah Hesham | abdullah-hesham.jpg | abdullah-hesham-baby.jpg |
| Mohamed Elsayed | mohamed-elsayed.jpg | mohamed-elsayed-baby.jpg |
| Maisan | maisan.jpg | maisan-baby.jpg |
| Karim | karim.jpg | karim-baby.jpg |
| Yassin Nader | yassin-nader.jpg | yassin-nader-baby.jpg |

- **Trips:** every trip in `content.js` has a `folder` (example `first-trip`). Put its photos in `trips/first-trip/` named `1.jpg`, `2.jpg`...
- **Tip:** make photos small first (about 1200 px wide, for example at squoosh.app) so the site stays fast on phones.

## WHAT TO EDIT IN content.js
Dates (final exam, graduation), the oval button text, welcome lines, jokes, the warning line, the sticky-note rules, the scrolling band, excuses, names, trips. **The final exam date is a placeholder. Change it.**
