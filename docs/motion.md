# Motion: making the site bouncy and reactive

One motion system for every page, so the site feels like one product.
CSS in `src/app/motion.css`; the scroll watcher is `src/components/MotionProvider.tsx`
(mounted once in `src/app/layout.tsx`). No animation library is needed.

## What's already automatic
- Every `<Button>` springs up on hover and squashes on press or tap.
- Every `<Badge>` pops on hover.
- On phones, touching anything with `m-lift`/`m-press`/`m-pop` squashes it (MotionProvider sets `data-pressed`; plain CSS `:active` isn't reliable on touchscreens).

## Adding motion to a page

| Want | Add |
|---|---|
| A card that rises on hover and squashes when tapped | `className="m-lift …"` |
| A card's icon that tilts when the card is hovered | `m-icon` on the icon (card needs `m-lift` or `group`) |
| A chip, tab, link-button or anything clickable | `m-press` |
| A small thing that pops (avatar, logo, stat icon) | `m-pop` |
| A section or card that animates in when scrolled to | `data-reveal` (`"up"` default, `"left"`, `"right"`, `"zoom"`, `"fade"`) |
| A grid/list whose items come in one after another | `data-reveal-group` on the parent (optionally `="zoom"` etc.) |
| A decorative card that gently bobs (hero badges) | `m-float` (stagger with `style={{ "--float-delay": "600ms" }}`) |
| A number that counts up when seen | `<CountUp value={n} />` from `@/components/CountUp` (`format` for ₦ or %) |

Example:

```tsx
<div data-reveal-group className="grid sm:grid-cols-3 gap-6">
  {courses.map((c) => (
    <Link key={c.id} href={…} className="m-lift block bg-white rounded-2xl border p-6">
      <Code2 className="m-icon w-6 h-6" />
      <h3>{c.title}</h3>
    </Link>
  ))}
</div>
```

## Rules
- **Don't hide first-screen content behind a reveal.** Whatever is on screen when a page first loads stays put, by design. For a hero entrance, use a CSS keyframe animation.
- **Reveal blocks, not every element.** A section, a card, a row. Revealing each line of text makes the page feel slow.
- **Not on**: form inputs, the Paystack checkout, the lesson video player, modals, or table rows in the admin console (the cards/tiles there are fine).
- **Entrance keyframes must not keep `transform` afterwards.** Use `animation-fill-mode: backwards` (not `both`/`forwards`), and never put an infinite `transform` animation on an element with `m-lift`/`m-pop`/`m-press`: an animated `transform` overrides the hover and tap effects. For a bob, use `m-float`.
- **Don't add your own `hover:-translate-y-*` / `hover:scale-*`** next to `m-lift`/`m-press`; the system already moves it.
- Motion is off for visitors with "reduce motion" turned on, and hover effects only run on devices with a mouse. Test both, and test on a phone: tap feedback is what most visitors see.
