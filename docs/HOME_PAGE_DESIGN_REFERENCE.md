# TKML Home Page Design Reference

**Status:** Reference for future TKML pages  
**Current implementation:** Variant 02 at `src/showcase/variant-02/`  
**Primary sources:** `src/showcase/variant-02/index.html`, `src/styles/variant-02.css`, `src/styles/tokens.css`, `src/styles/components.css`, `src/styles/references.css`, and `scripts/tkml-motion.js`

This document records the design language visible on the current TKML home page so future pages can feel part of the same website. Reuse its design principles and components where they fit. Do not copy homepage-specific section copy, image arrangements, or interactions by default.

## 1. Brand foundations

### Palette

Use the approved TKML palette defined in `src/styles/tokens.css`:

| Token | Value | Use |
| --- | --- | --- |
| Navy | `#0D1C22` | Main canvas, dark surfaces, and the cool end of section gradients |
| Brand orange | `#F05B1B` | Primary actions, active states, small emphasis, and warm gradient light |
| Ice blue | `#BBF1FF` | Select supporting accents where the design system calls for them |
| Black | `#000000` | Deep contrast, image integration, and selected dark surfaces |
| Mid grey | `#5B5B5B` | Secondary neutral details |
| Muted grey | `#A0A0A0` | Secondary text and subdued headings |
| Light grey | `#DBDBDB` | Soft dividers or lighter neutral details |
| White | `#FFFFFF` | Primary headings and high-contrast text |

Use the palette values through the existing CSS custom properties instead of introducing new near-duplicate brand colors. Orange is a deliberate accent; avoid turning every border, label, or decorative detail orange.

### Typography

- Use **Neue Regrade**, loaded from the project’s bundled font files.
- Keep the type hierarchy editorial and restrained: large, tightly tracked display headlines; readable section headings; compact uppercase eyebrows; and calm body copy.
- Headline scale, line height, tracking, and responsive clamps come from the shared tokens and component styles. Prefer those shared styles over local font-size overrides.
- Preserve explicit line breaks where they carry the visual composition. Let responsive styles change the wrap only where the existing design does so intentionally.
- Body text uses lighter visual weight and muted contrast than headings. Keep line length controlled for comfortable reading.

## 2. Layout and spacing

- Use the shared `.container` and page-gutter tokens for aligned content edges. The desktop container maximum is `1320px`; gutters and grid gaps use responsive token values.
- Build sections with clear alignment and generous breathing room. Reduce spacing responsively rather than shrinking all type and controls indiscriminately.
- Favor asymmetric editorial grids—often a title on one side and supporting copy on the other—over repeated centered blocks.
- Use the same alignment edges across section headings, paragraphs, cards, and calls to action when they belong to the same content column.
- Cards and controls use mostly square geometry. Follow the existing component radius tokens; do not add rounded corners as decoration without a design reason.
- Keep a card’s content area stable when adding interaction or animation. Reserve space for images, labels, and changing detail.

## 3. Color fields and section transitions

The home page is composed as a connected sequence of dark color fields, rather than unrelated section backgrounds.

- Start from navy and near-black surfaces, with restrained orange light and occasional cool blue-green illumination.
- Use layered radial and linear gradients to create depth. A gradient should feel like light moving across one continuous canvas, not a visible divider between stacked sections.
- Where neighboring sections share a color transition, coordinate their gradient positions and colors so the outgoing field and incoming field meet without a hard horizontal seam.
- Keep gradient artwork behind content and stationary during scroll animations.
- Do not force the orange-to-navy gradient onto every future page. Select a transition that suits the content, while retaining the palette and the principle of continuity.

## 4. Home page composition as a reference

The current homepage uses this sequence and these patterns:

1. **Header and hero:** A compact navigation system sits above a full-height, image-led opening. A large two-line headline carries the first visual priority; the supporting copy and two actions form a quieter, aligned group. A subtle grid and integrated logistics artwork provide depth without competing with the text.
2. **Services mosaic:** The services introduction pairs a section-scale heading with concise supporting copy. Service cards form an image-led editorial mosaic. Images can extend to card edges; titles and labels remain legible and anchored. This is the source for flexible service-card composition, not a requirement that all future pages use a mosaic.
3. **How We Work:** A four-step process uses a heading/copy introduction and four consistent cards. Each card follows the same information order: number, title, short description, visual, and supporting detail. Interactive diagrams explain the individual step rather than acting as generic decoration.
4. **The Opportunity:** A two-column editorial statement combines a prominent headline with supporting paragraphs and a single action. The eyebrow belongs to this specific section. The background stays connected to adjacent sections.
5. **Request flow:** A diagram with four clear step controls, a buyer–TKML–supplier route illustration, and a related explanation panel. Step selection updates the explanation and the relevant route state together.
6. **Built for better trade:** A title/copy introduction leads into three audience cards. The cards share a frame and information hierarchy while using different, relevant images. Visual consistency does not require identical crops.
7. **About TKML:** A two-column text section gives the headline room to lead while the supporting paragraphs explain the company and its standards. A CTA follows the copy.
8. **FAQs:** A heading and contact prompt sit beside a compact accordion. The full question row is operable; its expanded state is explicit and answers remain readable on small screens.
9. **Closing principle and CTA:** A short, emphatic headline and action sit beside large container artwork. The artwork is anchored to the viewport edge on desktop and uses a soft bottom fade on mobile to blend into the footer.
10. **Footer:** Two aligned panels create a clear close: brand statement and site navigation on the left; enquiry options and social links on the right. They stack cleanly on mobile and retain the same content order.

Future pages can reuse the header, buttons, typography, grids, cards, accordion, and footer. Choose a page-specific order and composition that serves its content; do not reproduce the homepage’s sequence mechanically.

## 5. Reusable component guidance

### Navigation

Use the existing wordmark, navigation links, and orange request action. Desktop and mobile have distinct layouts. On mobile, preserve balanced outer padding, clear separation between the request action and menu control, and a menu panel aligned to the navigation container.

### Buttons and links

- Use shared button classes and tokens for size, typography, focus, and interaction.
- CTA copy should remain readable and naturally spaced. Avoid inserting layout hacks between words.
- Use orange as the primary action fill with high-contrast dark text where the shared component defines it.
- Hover and focus treatments should return to their resting state on blur/pointer exit. Keep focus visible for keyboard users.
- Preserve meaningful destinations and native link or button behavior.

### Cards and image treatment

- Choose image crops that support each card’s message. Use edge-to-edge artwork only when intended by the specific composition.
- For edge-bleed hero artwork, align the visible image to the viewport’s top and right edges when the composition calls for it. Preserve the intended image size and crop by positioning the image area rather than scaling the artwork to force contact; account for transparent padding in the source image. Keep any bottom fade into the page background, and scope desktop and mobile positioning separately when their compositions differ.
- Keep labels and titles on stable layers above images. Add contrast overlays only where text needs them; do not put a blanket dark overlay over artwork that should remain clear.
- Use a consistent frame, border treatment, and content spacing across cards within the same group.
- On hover-capable devices, keep interactions subtle and scoped to the artwork or a specific inner element. Touch layouts should remain clear without hover.

### Interactive diagrams and accordions

- Pair each interaction with a meaningful explanation of the current state.
- Keep tab selection, active diagram state, and explanatory copy synchronized.
- Use native buttons with keyboard support and accessible state attributes.
- For accordions, retain a visible focus state, synchronized expanded state, and answer content that is unavailable when closed.
- Keep motion short and purposeful; avoid making essential information dependent on animation.

## 6. Motion and accessibility

The homepage uses the shared GSAP system in `scripts/tkml-motion.js` for motion that benefits from sequencing.

- Use GSAP timelines for entrance sequences and interactive movement. Use ScrollTrigger for one-time, non-scrubbed section entrances.
- Register shared plugins once and scope animations to their section or component.
- Preserve native scrolling. Do not add scroll-smoothing behavior unless it is explicitly part of the approved interaction.
- One-time entrance animations should leave final content visible when the visitor scrolls away and back.
- Keep layout dimensions reserved while content animates to prevent layout shifts.
- Respect `prefers-reduced-motion`: show content immediately and remove movement while preserving meaningful active-state changes.
- Content must remain visible if JavaScript or animation libraries fail to load.
- Use CSS for layout, static visual styling, and focus indicators; use GSAP only for the animated properties.

## 7. Responsive rules

- Treat mobile as a deliberate composition, not a compressed desktop screenshot.
- Preserve desktop-only image positioning changes behind desktop media queries. Mobile-specific image sizing and alignment belong in mobile media queries.
- Stack two-column content in a readable order, maintaining the intended relationship between headings and their copy.
- Use even card gaps and avoid negative margins or positioning that makes cards overlap.
- Ensure image edges, titles, and buttons do not collide at narrow widths.
- Keep interactive targets comfortably tappable; make hover-only information available through tap or focus as appropriate.
- Check the homepage at both a desktop width and a narrow mobile width whenever shared tokens or components change.

## 8. Avoid

- Unapproved colors, typefaces, or substitute fonts.
- Hard section borders used to compensate for mismatched gradient backgrounds.
- Repeating orange glow, grid overlays, large headings, or image-heavy cards on every page.
- Decorative strokes that resemble separators when continuity is intended.
- Hover states that remain stuck after pointer exit.
- Layout changes to desktop caused by a mobile-only adjustment.
- Motion that hides content from users with reduced motion, no JavaScript, or a failed animation dependency.

## 9. Implementation references

- **Tokens:** `src/styles/tokens.css`
- **Shared components:** `src/styles/components.css`
- **Variant 02 page structure:** `src/showcase/variant-02/index.html`
- **Variant 02 visual system:** `src/styles/variant-02.css`
- **Process and reference visuals:** `src/styles/references.css`
- **Shared motion:** `scripts/tkml-motion.js`

When a new page is approved, build its page-specific layout from these foundations and shared components. Update this reference only when an approved design-system decision changes; record page-specific experiments separately.
