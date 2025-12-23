Floor Plan Generator — Algorithm Description
===========================================

Location
--------
- Source: `resources/js/pages/user/floor-plan.tsx`
- Main function: `generateFloorPlan(req: UserRequirements, variant: number = 0)`
- Validator: `validateRequirements(req)`
- Renderer: `FloorPlanSVG` (+ `DoorSwing` for door rendering)

Overview
--------
This document describes the deterministic, rule-based layout algorithm used by the floor plan maker. The generator converts a high-level `UserRequirements` object into a numeric layout model (`FloorPlanResult`) consisting of rectangular rooms, doors, and wall thickness. There is no physics or constraint solver — layouts are computed with simple arithmetic partitioning of zones.

Inputs
------
UserRequirements (shape used by the generator):
- plotWidth: number (meters)
- plotDepth: number (meters)
- style: `'compact' | 'spacious'` (affects corridor width and padding)
- bedrooms: RoomConfig[] (id, name, minSize, maxSize, preferredSize, numDoors, hasEnsuite?)
- bathrooms: RoomConfig[] (id, name, minSize, maxSize, preferredSize, numDoors)
- commonAreas: RoomConfig[] (living/kitchen/dining/etc)

Validation rules
----------------
`validateRequirements` enforces primary constraints:
1. At least one room present (bedroom, bathroom, or common area).
2. Total preferred room area must be between 10 m² and 95% of the plot area.
3. Bedrooms must satisfy their minSize and maxSize.
4. Bathrooms must be >= 4 m² and <= 15 m².
5. Common areas must be within their min/max.

Constants & Style
-----------------
- Wall thickness: 0.15 m (outer frame stroke).
- Corridor width: style === 'spacious' ? 1.2 m : 1.0 m
- Room padding: style === 'spacious' ? 0.15 m : 0.05 m

High-level algorithm
--------------------
1. Compute inner usable rectangle:
   - innerW = plotWidth - 2 × wall
   - innerH = plotDepth - 2 × wall
2. Determine `variant` which chooses layout type and private/public split:
   - variant === 0 → linear (privateZoneRatio = 0.45)
   - variant === 1 → L-shaped (privateZoneRatio = 0.50)
   - variant === 2 → split (privateZoneRatio ≈ 0.48)
3. Partition the usable area into logical zones (private vs public) and corridors.
4. Allocate rooms by dividing the respective zone space (even splits or fixed fractions), then apply padding and ensuites reductions.
5. Place doors on the edges that face corridors or public areas; door swings alternate (cw/ccw) for variation.
6. Produce `FloorPlanResult` with coordinates/sizes in meters (x, y, w, h), doors, and meta like `wallThickness`.

Per-variant placement details
-----------------------------
A. Linear layout (variant=0)
- Private zone (top) uses `privateZoneRatio * innerH`.
- Bedrooms are placed side-by-side across width (or bedroomAreaW if bathrooms exist).
  - If bedrooms have ensuites, allocate ~30% of each bedroom's width to an ensuite and reduce bedroom width by that amount.
- Standalone bathrooms occupy the right side of the private zone (bathroomAreaW = innerW - bedroomAreaW), split vertically evenly.
- Corridor is placed below the private zone with height `corridorW`.
- Public zone (below corridor) divides innerW across common areas equally and places rooms top-aligned within that zone.

B. L-shaped layout (variant=1)
- Bedroom zone occupies a left column (about 40% innerW). Bedrooms are stacked vertically.
- A vertical corridor sits at the boundary of the bedroom column.
- Bathrooms are placed at the top-right of the plan (a horizontal strip across the remaining width) and split horizontally across the living zone.
- Common areas fill the remaining L-shaped region, stacked or split vertically.

C. Split layout (variant=2)
- Master bedroom on the left (35% innerW) and secondary bedrooms grouped on the right.
- Central zone holds bathrooms and common areas in top/bottom split (bathrooms top, commons bottom) inside a center column.
- Ensuites attached to master/bedrooms occupy a fraction of their adjacent zone.

Room sizing & placement rules
-----------------------------
- Sizing is mostly uniform within allocated zone (equal division), not proportional to `preferredSize` except for validation checks.
- Padding is subtracted from W/H to leave visual spacing between rooms.
- Ensuites use a fraction of bedroom width/height, typically 30% (configurable by code constants).
- Doors are placed facing the corridor or public area; a door position is computed as a fraction along the room edge (e.g., 25–70%) and swing alternates per index.

Doors
-----
- Each door is represented as { x, y, direction: 'left'|'right'|'up'|'down', swing: 'cw'|'ccw' }.
- `DoorSwing` renders a hinge and a 0.6m arc representing the swing. The door panel is drawn with a short line from hinge to arc endpoint.

Output format
-------------
FloorPlanResult:
- width, height (meters)
- wallThickness (meters)
- rooms: Room[] where each Room has:
  - id, type ('bedroom'|'bathroom'|'common'|'corridor'|'ensuite'), label
  - x, y, w, h (numbers, meters)
  - doors: array of door objects
  - optional flags: hasEnsuite

Determinism & variants
----------------------
- Deterministic for a given `requirements` and `variant`.
- `variant` allows exploration of 3 preset layout strategies.
- `style` toggles corridor width and padding which affects actual geometry.

Limitations & known edge-cases
------------------------------
- No packing or layout optimization: rooms are allocated by geometric partitioning, which may not honor `preferredSize` accurately when many rooms or odd sizes are present.
- No collision detection or complex adjacency preferences (e.g., kitchen near dining). Door positions may overlap in extremely small rooms.
- Extreme plot aspect ratios or extreme preferred sizes can produce cramped or visually odd layouts.

Suggested improvements
----------------------
- Respect `preferredSize` more directly: assign zone shares proportionally to preferred area and run a simple 1D bin-packing or greedy layout algorithm.
- Add overlap checks and iterative relaxation to prevent doors or small rooms from overlapping.
- Introduce adjacency rules and weights (kitchen next to dining, bathrooms near bedrooms).
- Optionally integrate a lightweight constraint solver or simulated annealing for better results when requirements conflict.

Examples
--------
Example input (simplified):
{
  plotWidth: 12, plotDepth: 10, style: 'compact',
  bedrooms: [{id:'bed-1', name:'Master', preferredSize:25, minSize:18, maxSize:35, numDoors:1, hasEnsuite:true}],
  bathrooms: [{id:'bath-1', name:'Bathroom 1', preferredSize:8}],
  commonAreas: [{id:'common-1', name:'Living Room', preferredSize:35}]
}

Example (typical) output snippet (conceptual):
- rooms: [
    { id:'bed-1', type:'bedroom', x:0.15, y:0.15, w:4.5, h:3.8, doors:[{x:...,y:...,direction:'down',swing:'cw'}], hasEnsuite:true },
    { id:'bed-1-ensuite', type:'ensuite', x:..., y:..., w:1.2, h:2.0, doors:[...] },
    { id:'bath-1', type:'bathroom', x:..., y:..., w:1.9, h:2.2 },
    { id:'common-1', type:'common', x:..., y:..., w:6.0, h:3.0 }
  ]

Notes about renderer
--------------------
- `FloorPlanSVG` uses the numeric `x,y,w,h` geometry to draw filled rectangles and stroke outlines, text labels, and dimension text.
- Units are meters; the SVG viewBox is `0 0 ${width} ${height}` so the visual scale matches numeric geometry.

Where to look in code
---------------------
- Generator & validation: `resources/js/pages/user/floor-plan.tsx` (search `generateFloorPlan` and `validateRequirements`).
- SVG rendering: same file (`FloorPlanSVG`, `DoorSwing`).

Contact
-------
If you want, I can:
- add this description as an inline doc comment above `generateFloorPlan`, or
- add unit tests that assert basic layout behaviors (e.g., total area coverage, number of rooms placed, door counts), or
- implement one of the suggested improvements.

-- end of document --



Proceeding to send the plain text list of admin and user features.Admin features:

Dashboard & Analytics: view site stats, user growth, furniture/materials/design metrics, low-stock/out-of-stock reports.
Users: list/search users, edit name/email/role, delete users (cannot delete self).
Site Settings: update contact info, social URLs, about text.
Home Designs (admin): create/edit/delete home designs; manage floors, rooms, cover/gallery images and files; toggle featured/active; delete images/files.
Interior Designs (admin): create/edit/delete interior designs; manage images/files; toggle featured/active.
Furniture Library (admin): create/edit/delete furniture items; toggle active/featured; manage categories, rooms, stock, price.
Materials (admin): create/edit/delete materials; toggle active/featured; manage categories/types/units.
Admin middleware: routes protected by admin role (e.g., /admin, /admin/*).
User features:

Authentication: login (including Google OAuth); users with role=admin redirected to admin dashboard.
Dashboard: quick actions for creating/opening projects; measurement conversion tools; loads furniture for quick use.
Floor Plan Projects: API endpoints to list, create, show, update, delete, and duplicate projects (user-scoped).
Interior Design Projects: API endpoints to list, create, show, update, delete, and duplicate projects (user-scoped).
Home Designs (public): browse active home designs with filters/search; view full design details and files; view counts tracked.
Gallery: browse interior design gallery and view items.
User Libraries: browse furniture and materials (search, categories, featured items).
Projects: view user’s saved projects and open/edit individual projects.
User Settings / Help / Tools: user settings page, help documentation, and measurement tools.