# 3.4 Description of Algorithm

## Zone-Based Spatial Partitioning Algorithm for Automated Floor Plan Generation

The floor plan generation system implements a **Zone-Based Spatial Partitioning Algorithm** that automatically generates optimal residential floor plans based on user requirements. This algorithm divides the available plot area into functional zones and arranges rooms according to architectural best practices and spatial relationships.

---

## Algorithm Overview

The Zone-Based Spatial Partitioning Algorithm is a deterministic procedural generation method that creates floor plans by:
1. Dividing the plot into hierarchical functional zones (Private, Public, Circulation)
2. Allocating rooms within each zone based on spatial requirements
3. Applying architectural constraints for realistic layouts
4. Generating multiple layout variants for user selection

---

## Algorithm Steps

### Step 1: Input Validation and Area Calculation
- **Collect user requirements**: Plot dimensions (width × depth), number of bedrooms, bathrooms, and common areas with their preferred sizes.
- **Calculate total plot area**: `plotArea = plotWidth × plotDepth`
- **Calculate total room area**: Sum of all preferred room sizes.
- **Validate constraints**:
  - Total room area must not exceed 95% of plot area (allowing for walls and circulation).
  - Minimum viable total area: 10 m².
  - Individual room sizes must fall within min/max bounds for each room type.

### Step 2: Define Wall and Corridor Parameters
- **Wall thickness**: Standard 0.15m (15cm) for structural walls.
- **Corridor width**: 1.0m for compact style, 1.2m for spacious style.
- **Room padding**: 0.05m (compact) or 0.15m (spacious) for breathing room between elements.
- **Door width**: Standard 0.8m (80cm) single door.
- **Calculate inner dimensions**: `innerW = plotWidth - (wallThickness × 2)`, `innerH = plotDepth - (wallThickness × 2)`

### Step 3: Select Layout Type Based on Variant
The algorithm generates 3 different layout variants to provide user choice:

| Variant | Layout Type | Private Zone Ratio | Description |
|---------|-------------|-------------------|-------------|
| 0 | **Linear** | 45% | Bedrooms at back, living at front, horizontal corridor |
| 1 | **L-Shaped** | 50% | Bedrooms on left side, living wrapping around |
| 2 | **Split** | 48% | Master bedroom separate, secondary bedrooms grouped |

### Step 4: Zone Partitioning
- **Private Zone**: Bedrooms and attached bathrooms (ensuites). Located for privacy and quiet.
- **Public Zone**: Living room, kitchen, dining, and common areas. Located for accessibility.
- **Circulation Zone**: Corridors and hallways connecting private and public zones.

**Zone height calculation**:
```
privateZoneH = innerH × privateZoneRatio
publicZoneH = innerH - privateZoneH - corridorWidth
```

### Step 5: Room Placement Algorithm

#### 5.1 Linear Layout Placement
1. **Bedroom Zone** (top of plan):
   - Calculate bedroom area width: 75% of inner width if bathrooms exist, 100% otherwise.
   - Divide bedroom zone horizontally among all bedrooms.
   - For each bedroom: Calculate position `(x, y)`, dimensions `(w, h)`, and door placement.
   - If bedroom has ensuite: Attach ensuite room (30% of bedroom width, 60% of height).

2. **Bathroom Zone** (top-right):
   - Stack bathrooms vertically in remaining 25% of width.
   - Calculate individual bathroom height: `privateZoneH / numBathrooms`.
   - Place doors facing the corridor.

3. **Corridor** (middle):
   - Full-width horizontal corridor at `y = wall + privateZoneH`.
   - Acts as circulation spine connecting all rooms.

4. **Common Areas** (bottom):
   - Divide public zone horizontally among common rooms.
   - Place doors opening from corridor into each room.

#### 5.2 L-Shaped Layout Placement
1. **Bedroom Zone** (left side):
   - Allocate 40% of width for bedrooms.
   - Stack bedrooms vertically.
   - Doors face the vertical corridor on the right.

2. **Vertical Corridor**:
   - Full-height corridor separating private and public zones.

3. **Bathrooms** (top-right corner):
   - Occupy 30% of height in the remaining width.

4. **Common Areas** (L-shaped wrap):
   - Fill remaining space below bathrooms.

#### 5.3 Split Layout Placement
1. **Master Zone** (left):
   - Allocate 35% of width for master bedroom.
   - Large ensuite below if requested.

2. **Central Zone** (middle):
   - 35% of width for bathrooms (top) and common areas (bottom).

3. **Secondary Bedrooms** (right):
   - Remaining width for additional bedrooms stacked vertically.
   - Individual ensuites attached to each if requested.

### Step 6: Door Placement Algorithm
For each room, doors are placed following these rules:
- **Position**: Offset from corners (minimum 0.3m or 20-25% of wall length).
- **Direction**: Doors open into rooms (privacy) or toward corridors (accessibility).
- **Swing**: Alternating clockwise/counter-clockwise for variety and to avoid conflicts.
- **Door properties**: `{ x, y, direction: 'up'|'down'|'left'|'right', swing: 'cw'|'ccw' }`

**Door positioning formula**:
```
doorOffset = max(0.3, wallLength × 0.2 or 0.25)
doorX = roomX + doorOffset  // for horizontal walls
doorY = roomY + doorOffset  // for vertical walls
```

### Step 7: Output Generation
The algorithm returns a `FloorPlanResult` object containing:
```typescript
{
    width: number;           // Plot width in meters
    height: number;          // Plot depth in meters
    rooms: Room[];           // Array of room objects with positions and doors
    wallThickness: number;   // Wall thickness in meters
}
```

Each room object contains:
```typescript
{
    id: string;              // Unique identifier
    type: string;            // 'bedroom' | 'bathroom' | 'common' | 'corridor' | 'ensuite'
    label: string;           // Display name
    x: number;               // X position (meters from origin)
    y: number;               // Y position (meters from origin)
    w: number;               // Width (meters)
    h: number;               // Height/depth (meters)
    doors: DoorConfig[];     // Array of door placements
    hasEnsuite?: boolean;    // Whether bedroom has attached bathroom
}
```

---

## Key Features of the Algorithm

### 1. **Constraint Satisfaction**
- Ensures rooms fit within plot boundaries.
- Validates minimum/maximum room sizes.
- Maintains proper clearances and circulation paths.

### 2. **Architectural Best Practices**
- Separates private (bedrooms) and public (living) zones.
- Provides corridor-based circulation.
- Positions bathrooms near bedrooms or in accessible locations.
- Ensures all rooms have proper door access.

### 3. **Scalability**
- Handles variable numbers of rooms.
- Adapts to different plot sizes.
- Supports both compact and spacious layouts.

### 4. **Variant Generation**
- Produces 3 distinct layout options.
- Allows user to choose preferred arrangement.
- Each variant follows different spatial organization principles.

---

## Algorithm Complexity

| Aspect | Complexity |
|--------|------------|
| Time Complexity | O(n) where n = total number of rooms |
| Space Complexity | O(n) for storing room configurations |
| Validation | O(n) for constraint checking |

---

## Comparison with Other Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Zone-Based Partitioning** (Used) | Fast, deterministic, architecturally sound | Limited to predefined layout patterns |
| Genetic Algorithm | Highly optimized solutions | Slow, non-deterministic |
| Constraint Programming | Flexible constraints | Complex implementation |
| Machine Learning | Learns from real plans | Requires large training dataset |

---

## Summary

The Zone-Based Spatial Partitioning Algorithm provides an efficient and architecturally sound method for generating residential floor plans. By dividing the plot into functional zones and systematically placing rooms within each zone, the algorithm produces realistic layouts that adhere to architectural best practices while meeting user requirements. The generation of multiple layout variants ensures users have options to choose from based on their preferences.
