# Group card

A group greeting card — the sort of thing you make for a retirement, a
milestone birthday, a farewell — that is free to run, takes photos, and asks
nothing of the people writing in it. No account, no app, no password. They tap a
link, write, attach a photo if they want one, and press Send.

Built because the paid services cap how many people can sign, and because the
free alternatives make everyone create an account first. If the people you are
collecting messages from are in their eighties, that second thing loses you most
of them.

Messages land in a Google Sheet you own. Photos land in a free Cloudinary
account. Nothing is stored anywhere you cannot reach, and you take it down by
deleting it.

- `index.html` — the board: every message, with a slideshow for the day itself
- `add.html` — the one screen people write on
- `config.js` — the only file you need to edit
- `style.css` — how it all looks; every colour is a variable at the top
- `apps-script/Code.gs` — the Sheet's half of the job

---

## Why it is built this way

The obvious approach is a Google Form writing to a Sheet. That works for text
and falls apart the moment you want photos: **a Google Form containing a File
upload question requires every respondent to sign in to a Google account**, and
no setting turns that off. For a general audience that is where you lose people.

So the writing page is hand-written and posts to a small Apps Script web app
deployed with "Who has access: Anyone". Photos go to Cloudinary through an
unsigned upload preset, which is the only way to take a photo from a stranger's
phone without a login.

---

## Setting it up

About twenty minutes, once.

### 1. Make the Sheet

Make a new Google Sheet. This is where every message arrives, and it stays
private to you.

### 2. Add the script and publish it

**Extensions → Apps Script**. Paste in everything from `apps-script/Code.gs`,
save, then pick `setup` from the function dropdown and **Run**. Authorise it when
asked — that is the script asking permission to write to your own Sheet.

Then **Deploy → New deployment**, gear icon → **Web app**:

- **Execute as:** Me
- **Who has access:** **Anyone**

"Anyone" is the setting that matters. The other option, *Anyone with a Google
account*, quietly reintroduces the sign-in wall this exists to avoid. It does not
make your Sheet public — the script is the only thing reachable, and it only ever
returns messages.

Copy the **Web app URL**. It ends in `/exec`.

> If you edit `Code.gs` later, you must **Deploy → Manage deployments → edit →
> Version: New version**. Saving alone changes nothing.

**If you hit "Access blocked: Authorization Error — invalid_client"**, sign out
of your other Google accounts, or use a window signed into one account only.
Several simultaneous logins send the authorisation to the wrong account.

### 3. Set up photos

Cloudinary's free tier is far more than a card will use.

1. Free account at cloudinary.com — your **Cloud name** is on the dashboard
2. **Settings → Upload → Upload presets → Add upload preset**
   (direct: `https://console.cloudinary.com/app/settings/upload/presets`)
3. **Signing mode: Unsigned**
4. Optional but worth it: set **Asset folder** to keep uploads together, turn on
   **Disallow public ID** so nobody can overwrite an existing photo, and set
   **Allowed formats** to `jpg,png`
5. Leave **Access control** and **Delivery type** alone — the photos have to be
   publicly viewable or they will not show on the board

Copy the preset name.

### 4. Fill in config.js

Title, the `/exec` URL, and the two Cloudinary values. That is the only file you
touch.

### 5. Put it online

Drag this folder onto **app.netlify.com/drop**. Free, instant, no account needed
to start — though you should make one afterwards and claim the site, or you may
not be able to update it.

If you keep this in a git repository, do not drag the repository folder itself:
that uploads `.git` along with it, and a published `.git` lets anyone reconstruct
your history from the live site. Drag a copy with no `.git` inside.

### 6. Replace the link preview

`preview.jpg` is what shows when the link lands in a text or an email, and it
matters more than it sounds — an unfamiliar link with no preview is exactly what
people are taught to treat as a scam. Replace it with your own 1200x630 image. A
photo of the person works well.

The `og:` tags in `index.html` and `add.html` carry **absolute** URLs, because
link scrapers do not run JavaScript and so cannot read `config.js`. Find
`YOUR-SITE.netlify.app` in both files and replace it with your real address.

---

## Running it

**Hiding a message.** Type `hidden` in that row's Status column in the Sheet. It
leaves the board within ninety seconds. Nothing is deleted.

**Fixing a typo for someone.** Edit it in the Sheet. If you see two messages from
the same person, the second is usually the one they meant — people resend rather
than ask.

**On the day.** Open the board and press **Play as a slideshow**: eight seconds a
message, arrow keys and Escape work. The board also refreshes every ninety
seconds, so messages arriving during the event appear on their own.

**Printing it.** Print the board from the browser — the buttons drop away and it
lays out as a clean two-column keepsake. "Save as PDF" gives you something to
post to anyone who would rather have paper.

**Afterwards.** The Sheet is the record. Download it and you have everything.

---

## Notes

**Photos are resized in the browser** before they are sent, to 1600px on the long
edge. A photo straight off a modern phone is 4–6 MB, which is exactly where
uploads stall on a weak connection. Change `photoMaxEdge` in `config.js`.

**iPhone HEIC photos** are converted to JPEG by iOS itself when picked through a
web page, so nobody has to think about it.

**A failed send never clears what someone typed.** The page keeps it on screen
and asks them to press Send again. Retyping is where people give up.

**There is no login**, so anyone with the link can write on the board. For a
family or a workplace that is the point. The Status column is how you deal with
it if the link travels further than you meant.

**Accessibility.** Body text is 18px and up, tap targets 56px and up, and the
colours were picked for contrast — white on the emerald banner is about 8.5:1.
If you change the palette, keep small text off coloured backgrounds.

---

## Design

The palette lives at the top of `style.css`:

| Variable | What it paints |
| --- | --- |
| `--emerald` | the banner |
| `--forest` | buttons, names, the slideshow background |
| `--paper` | the page behind the cards |
| `--coral`, `--blush`, `--sage` | the botanical accents |

The botanical divider is plain inline SVG, not borrowed artwork, so it is yours
to change or delete.
