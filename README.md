# Video Editor Portfolio — template

Three files, with no build step and no libraries:

- `index.html`: all your content. Search for `[` to find every placeholder, and `EDIT:` for the notes.
- `style.css`: the look. Change `--accent` at the top to recolor the whole site.
- `script.js`: menu, showreel, project filters, video lightbox, contact form, scroll effects.

## Add your media (the `assets/` folder)

| File | Size | Used for |
|---|---|---|
| `project-1.jpg` … `project-6.jpg` | 16:9, e.g. 1280×720 | project thumbnails |
| `portrait.jpg` | 4:5, e.g. 800×1000 | About section |
| `reel-poster.jpg` | 16:9 | background behind the showreel play button (optional) |
| `og-image.jpg` | 1200×630 | link preview on WhatsApp, LinkedIn, X |

A missing image shows a neat "Add thumbnail" label, so the site still looks fine while you collect them.

## Videos

- **Showreel:** in `index.html`, set `data-embed=""` on the `.reel` div to your Vimeo or YouTube link.
- **Each project:** set `data-video=""` on its `<article>`. Clicking the thumbnail then plays it in a pop-up.
- Normal links work (`https://vimeo.com/123456`, `https://youtu.be/abc`). The script converts them to embeds.
- **Add or remove projects:** copy or delete an `<article class="project">` block. The filter buttons build themselves from each card's `data-category`.

## Put it live on Netlify

1. Fill in your details and add your images.
2. Go to **app.netlify.com/drop**, sign up or log in, and drag the whole `portfolio-site` folder (or the .zip) onto the page.
3. Your site is live at a `something.netlify.app` address. Rename it under **Site configuration → Change site name**.
4. **Turn on the contact form:** go to **Forms → Enable form detection**, then redeploy by dragging the folder onto the **Deploys** tab again.
5. **Get submissions by email:** go to **Site configuration → Notifications → Emails and webhooks → Form submission notifications**.
6. **Own domain (optional):** go to **Domain management → Add a domain** and follow the DNS steps. HTTPS is set up for you.

To update the site later, edit the files and drag the folder onto **Deploys** again.

> The contact form only works on Netlify. If you open `index.html` directly on your computer, sending will show the error message. That's expected.
