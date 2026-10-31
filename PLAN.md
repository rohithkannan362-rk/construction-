# ARSH Construction — World-class rebuild (v3)

## Audit of v2 (what was wrong)
| Problem | Cause | Fix |
|---|---|---|
| Nav cut off at the top | GSAP intro tween and the CSS hide-on-scroll transition fought over the same `transform` | Nav animates by opacity only; hide-on-scroll is pure CSS |
| Whole site laggy | 3D WebGL scene + bloom post-processing, full-screen animated grain, full-screen blend-mode spotlight, scroll-velocity skew on every image, blur filters on hundreds of letters, CSS filters on every video, all videos decoding at once | Remove WebGL entirely (blueprint becomes a lightweight SVG drawing), static grain, no spotlight / skew / blur, videos play only while on screen, frame sequence redraws only when the frame changes |
| Fonts too big | Display sizes up to 188px | One type scale, hero max 108px, section titles max 64px |
| Images too big / misaligned | Every section had its own widths and paddings | One 1360px container and gutter used by every section; fixed aspect ratios; capped card sizes |
| "More from the portfolio" weak | Text list | Two rows of moving image cards (opposite directions), slow drift, pause and lift on hover, drag-friendly on touch |
| Best video unused | 20 s villa time-lapse only used as a still | It becomes the centre of the scroll story |
| Cursor stuck on "VIEW" | Hover state never reset after scrolling | State recomputed on scroll |

## Story: "From blueprint to reality" (scroll-scrubbed, about 35 s of footage)
1. **Blueprint**: gold line drawing of a villa elevation draws itself on a dark grid (SVG, cheap).
2. **Reveal**: the drawing opens into real footage in a circle.
3. **It begins as ground**: Indian plot setting-out, excavation, footings (time-lapse A, 0–4 s).
4. **Steel set with care**: the crane builds the concrete frame (time-lapse B, the 20 s film, first half).
5. **Closed against the dust**: walls, stone, timber, glass, pool, lawn (B, second half).
6. **Lit for a lifetime**: golden hour to night (time-lapse C).
Cross-dissolves at each clip boundary. Site-log panel: Day 001 → 420 and stage name.

## Page order
Loader → Hero film → About → Story → Numbers → Services → Reel (5 films) → Featured projects (2×2) → Moving portfolio → Values → Team → Voices → Awards → Contact (film) → Footer
