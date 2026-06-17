# Style Guide — Oil Production Forecaster

Brand identity and UI conventions for the frontend. Source of truth for colors, typography, and
component patterns; the implementation in `frontend/src` must follow it.

> **Maintenance**: update this file in the same change that introduces or alters a visual token,
> a reusable component pattern, or the chart palette. See `.claude/rules/docs.md`.

## 1. Brand

Inspired by Hokusai's *The Great Wave off Kanagawa*. The mood is a deep sumi-ink night with a
**crystal-blue wave** as the signature accent and warm **carp-yellow** highlights, over cream
(fuji-white) text. The logo is a stylized cresting wave (see `frontend/src/components/WaveLogo.tsx`).

Palette follows the well-known *Kanagawa* color scheme derived from the print.

## 2. Color tokens

Defined as Tailwind v4 theme colors in `frontend/src/index.css` (`@theme`), used as utilities
(`bg-ink`, `text-fuji`, `text-wave`, …). Hex values are authoritative.

### Surfaces (sumi ink)
| Role | Token / utility | Hex |
|------|-----------------|-----|
| App background | `ink` | `#1F1F28` |
| Elevated panel | `ink-elev` | `#2A2A37` |
| Deepest (tooltip) | `ink-deep` | `#16161D` |
| Border / divider | `line` | `#54546D` |

### Text
| Role | Token | Hex |
|------|-------|-----|
| Primary (fuji white) | `fuji` | `#DCD7BA` |
| Body (old white) | `oldwhite` | `#C8C093` |
| Muted (fuji gray) | `muted` | `#727169` |

### Accent — wave
| Role | Token | Hex |
|------|-------|-----|
| Primary action / accent (crystal blue) | `wave` | `#7E9CD8` |
| Hover / bright (spring blue) | `wave-bright` | `#7FB4CA` |
| Deep wave (fills, logo) | `wave-deep` | `#2D4F67` |
| Foam aqua | `aqua` | `#7AA89F` |
| On-accent text | `ink` | `#1F1F28` |

### Highlight & semantic
| Role | Token | Hex |
|------|-------|-----|
| Secondary highlight (carp yellow) | `sand` | `#E6C384` |
| Danger (autumn red) | `crimson` | `#C34043` |
| Danger bright (samurai red) | `crimson-bright` | `#E82424` |

## 3. Typography

- **Family**: Tailwind default sans stack (`system-ui, -apple-system, "Segoe UI", Roboto, …`). No custom web font.
- **Scale**: page title `text-2xl font-semibold`; section heading `font-semibold`; body `text-sm`; labels/meta `text-xs`.
- Wordmark "Oil Production Forecaster" in `text-fuji`, paired with the colored wave logo.

## 4. Chart palette (Recharts)

| Element | Hex | Token |
|---------|-----|-------|
| Grid | `#363646` | (ink between elev/line) |
| Axis ticks / labels | `#727169` | `muted` |
| Tooltip background | `#16161D` (border `#54546D`) | `ink-deep` / `line` |
| Tooltip label | `#7E9CD8` | `wave` |
| **History** (scatter dots) | `#DCD7BA` | `fuji` |
| **Forecast** (line palette) | `#7E9CD8`, `#E6C384`, `#7AA89F`, `#7FB4CA`, `#C8C093` (width 2) | `wave`, `sand`, `aqua`, `wave-bright`, `oldwhite` |

Log-Y is a first-class toggle on decline charts (`scale="log"`, domain floor `1`).

## 5. Component patterns

- **Buttons (primary)**: `rounded bg-wave px-4 py-2 text-sm font-medium text-ink hover:bg-wave-bright`,
  disabled `disabled:opacity-40`.
- **Panels / cards**: `rounded-lg border border-line bg-ink-elev/40 p-4`.
- **Tables**: header row `text-muted`; row separators `border-t border-line/60`; row hover `hover:bg-ink-elev/50`.
- **Wells table**: each well name is preceded by the Font Awesome Free `oil-well` SVG icon (`h-5 w-5 text-fuji`) aligned with the linked name.
- **Inputs / selects**: `rounded border border-line bg-ink px-2 py-1`.
- **Forecasts table values**: cutoff is rendered as a rate with the well's declared unit (`bbl/d` or `m³/d`); EUR is rendered as a rounded volume with the corresponding volume unit (`bbl` or `m³`).
- **Row actions** (forecasts table): **View** is an independent toggle switch (`role="switch"`, `bg-wave` on / `bg-line` off, `bg-fuji` knob) that overlays that forecast; multiple rows may be active at once. **CSV** is a download icon button (`text-oldwhite hover:text-fuji`, disabled `opacity-30`) enabled once the row's forecast detail is loaded; **Delete** is a trash icon button (`text-crimson hover:text-crimson-bright`) that opens a bottom-right confirmation toast instead of a browser confirm. Icons are inline SVGs at `h-4 w-4` with `aria-label`.
- **Toasts**: fixed bottom-right, `rounded-lg border border-line bg-ink-deep shadow-2xl shadow-black/40`; destructive confirmation uses a crimson icon chip, `Cancel` outline button, and crimson `Delete` button. Success toasts are compact `role="status"` notices.
- **HTTP debugger**: floating bottom-right circular bug button (`bg-ink-deep text-fuji border-line`) opens a bottom inspector panel. Panel uses `bg-ink-deep`, `border-line`, compact method/status chips, a left request list, and detail blocks for URL, payload, response body, headers, status, timings, size, and cURL copy. Height is adjustable by dragging the top resize handle, constrained to a practical viewport range.
- **Welcome/login screen**: full-height `bg-ink` entry view with the large `WaveLogo`, title, a single primary **Login** button to `/wells`, and one bordered `bg-ink-deep` visual panel. Keep it sparse; no username/password fields until auth exists.
- **Layout**: centered container `mx-auto max-w-5xl px-6`; header is a `border-b border-line` bar.

## 6. Spacing & radius

- Vertical rhythm between sections: `space-y-6`.
- Card padding: `p-4`; radius: `rounded-lg` (panels), `rounded` (controls).
- Nav/active link: active = `bg-wave text-ink`, inactive = `text-oldwhite hover:bg-ink-elev`.

## 7. Logo

`WaveLogo.tsx` renders an SVG cresting wave: a deep wave-blue body (`wave-deep`), crystal-blue inner
curl lines (`wave`), foam claws/dots in fuji-white, and a pale carp-yellow sun disc. Scales via a
`className` (e.g. `h-7 w-auto`). Keep the deep/crystal/foam layering when editing.
