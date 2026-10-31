# ARSH Construction — website

Premium, cinematic website for ARSH Construction, Madurai (architecture, structural engineering, interiors, design & build since 2005).

## Highlights
- **Intro:** a gold villa elevation draws itself, then a scan line turns the blueprint into the real film.
- **Hero:** full-screen construction film with a clickable Frame / Envelope / Landscape film bar.
- **Scroll story:** a 180-frame construction time-lapse that plays forward and backward with the scroll, with a live site-log panel.
- **Cinematic reel** of five project films, **featured projects** with hover films and a full-screen viewer, and a **moving portfolio gallery**.
- Smooth scrolling (Lenis) and scroll animation (GSAP ScrollTrigger). Plain HTML, CSS and JavaScript with no build step.

## Run locally
The site needs a local server (opening `index.html` directly will not load the films and frames):

```bash
npx serve .
```

Or with any static server, for example `python -m http.server 5173`, then open http://localhost:5173.

## Structure
```
index.html        page markup
css/style.css     design system and layout
js/main.js        intro, scroll story, reel, gallery and interactions
images/           stills and posters
images/seq/       time-lapse frames for the scroll story
videos/           project films
```

## Deploy
Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, or the existing hosting).
