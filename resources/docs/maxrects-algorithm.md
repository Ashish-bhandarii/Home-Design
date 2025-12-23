# MaxRects Auto Layout Implementation

## Inputs & Normalisation
- **Usable footprint**: `W_u = plotWidth - (setbackLeft + setbackRight)` and `D_u = plotDepth - (setbackFront + setbackRear)`; abort when either ≤ 0.
- **Room clamping**: Each room is constrained before packing using `w_i' = clamp(room.width, 4, W_u)` and `d_i' = clamp(room.length, 4, D_u)` to avoid degenerate rectangles.

## Packing Strategy
- Instantiate `new MaxRectsPacker(W_u, D_u, corridorWidthFt, { smart: true, pot: false, square: false, allowRotation: false })`.
- Every `(w_i', d_i')` rectangle is added with its room payload; MaxRects greedily places it inside the primary bin, creating additional bins when overflow is unavoidable (recorded as `binCount`).
- When multiple bins are emitted, they are vertically stacked in sequence with `offsetY += bin.height + corridorWidthFt`, preserving a circulation gap between plates.

## Scaling Back Into the Envelope
- Track the raw span of the packed rectangles: `W_used = max(x_i + w_i')`, `D_used = max(y_i + d_i')`.
- Compute shrink factors against the buildable envelope: `s_w = W_u / max(W_used, 1)`, `s_d = D_u / max(D_used, 1)`, and `s = min(s_w, s_d, 1)`.
- Store final placement as `x_i* = x_i · s`, `y_i* = y_i · s`, `w_i* = w_i' · s`, `d_i* = d_i' · s`; corridor width is `corridorWidthPx = corridorWidthFt · s`.
- Oversize detection flags `layout.exceedsEnvelope` when `hasOversized || binCount > 1 || W_used > W_u || D_used > D_u`.

## Derived Metrics
- **Programme area**: `Σ (room.width · room.length)` rendered in square feet.
- **Buildable span**: `formatFeetAndMeters(W_u)` and `formatFeetAndMeters(D_u)` with conversion `m = ft · 0.3048`.
- **Indicative budget**: formatted using Nepali currency nomenclature via `formatCurrency` (Crore/Lakh thresholds).

## SVG Coordinate System
- Conversion factor: `pxPerFoot = min((svgWidth - 2·margin)/plotWidth, (svgHeight - 2·margin)/plotDepth)`.
- Plot geometry offset by setbacks: `X = (x_i* + setbackLeft) · pxPerFoot + margin`, `Y = (y_i* + setbackFront) · pxPerFoot + margin`.

## Door Geometry
- Door width and spacing: `doorWidthPx = 3 · pxPerFoot · scaleFactor`, `doorSpacingPx = 1.2 · pxPerFoot · scaleFactor`.
- Available span along the selected wall `S`; centred offset `o_0 = max((S - totalDoorWidthPx)/2, 0)` with per-door offset `o_k = o_0 + k · (doorWidthPx + doorSpacingPx)`.
- Swing triangles plotted from hinge → swing point → tip depending on wall orientation.

## Window Slots
- Window width and spacing: `windowWidthPx = 2.8 · pxPerFoot · scaleFactor`, `windowSpacingPx = 1.6 · pxPerFoot · scaleFactor`.
- Windows distributed evenly across nominated sides; each slot uses `offsetStartPx = max((spanPx - totalWindowWidthPx)/2, 0)` and is transformed per wall orientation.

## Balcony Extrusions
- Depth in feet extruded outward; for north/south `y ± depth`, for east/west swap width/depth before scaling.
- Rendered as dashed rectangles with `strokeDasharray="8 4"` to distinguish semi-open areas.

## Measurement & Legend Layer
- Dimension text uses `length_ft` and converted metres `length_m = length_ft · 0.3048`.
- Legend auto-positioning: `legendX = min(margin + plotWidthPx + 24, svgWidth - margin - 240)`; if lateral space is insufficient, it drops below the plot (`legendY = margin + plotHeightPx + 24`) but is clamped within margins.
