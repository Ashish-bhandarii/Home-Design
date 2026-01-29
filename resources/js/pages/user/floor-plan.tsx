import { Head, Link } from '@inertiajs/react';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import { BedDouble, Box, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Download, FolderOpen, Grid2X2, Home, Pencil, RefreshCw, Save, Sofa, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Types
interface FloorPlanProject {
    id: number;
    name: string;
    description?: string;
    thumbnail?: string;
    requirements: UserRequirements;
    generated_plans: FloorPlanResult[] | null;
    selected_plan_index: number;
    created_at: string;
    updated_at: string;
}

interface RoomConfig {
    id: string;
    name: string;
    minSize: number;
    maxSize: number;
    preferredSize: number;
    numDoors: number;
    hasEnsuite?: boolean;
}

interface UserRequirements {
    plotWidth: number;
    plotDepth: number;
    numBedrooms: number;
    numBathrooms: number;
    hasGarage: boolean;
    hasStudy: boolean;
    hasDining: boolean;
    style: 'compact' | 'spacious';
    bedrooms: RoomConfig[];
    bathrooms: RoomConfig[];
    commonAreas: RoomConfig[];
}

interface ValidationError {
    field: string;
    message: string;
}

interface Room {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    doors: { x: number; y: number; direction: 'left' | 'right' | 'up' | 'down'; swing: 'cw' | 'ccw' }[];
    hasEnsuite?: boolean;
}

interface FloorPlanResult {
    width: number;
    height: number;
    rooms: Room[];
    wallThickness: number;
}

// Validation Functions

const validateRequirements = (req: UserRequirements): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Rule 1: At least one room must be added
    if (req.bedrooms.length === 0 && req.bathrooms.length === 0 && req.commonAreas.length === 0) {
        errors.push({
            field: 'rooms',
            message: 'Add at least one room'
        });
        return errors;
    }

    const totalRoomArea = [
        ...req.bedrooms,
        ...req.bathrooms,
        ...req.commonAreas
    ].reduce((sum, room) => sum + room.preferredSize, 0);

    const plotArea = req.plotWidth * req.plotDepth;

    // Rule 2: Total room area must not exceed plot area
    const maxAllowedArea = plotArea * 0.95;
    if (totalRoomArea > maxAllowedArea) {
        errors.push({
            field: 'rooms',
            message: `Total area (${totalRoomArea.toFixed(0)} m²) exceeds plot capacity (${maxAllowedArea.toFixed(0)} m²). Reduce room sizes.`
        });
    }

    // Rule 3: Total area should be at least 10 m² (minimum viable layout)
    if (totalRoomArea < 10) {
        errors.push({
            field: 'rooms',
            message: `Total area too small. Rooms must total at least 10 m².`
        });
    }

    // Rule 4: Individual bedroom size validation
    req.bedrooms.forEach((bed, idx) => {
        if (bed.preferredSize < bed.minSize) {
            errors.push({
                field: `bedroom-${idx}`,
                message: `"${bed.name}" too small. Minimum: ${bed.minSize} m²`
            });
        }
        if (bed.preferredSize > bed.maxSize) {
            errors.push({
                field: `bedroom-${idx}`,
                message: `"${bed.name}" too large. Maximum: ${bed.maxSize} m²`
            });
        }
    });

    // Rule 5: Individual bathroom size validation
    req.bathrooms.forEach((bath, idx) => {
        if (bath.preferredSize < 4) {
            errors.push({
                field: `bathroom-${idx}`,
                message: `"${bath.name}" too small. Minimum: 4 m²`
            });
        }
        if (bath.preferredSize > 15) {
            errors.push({
                field: `bathroom-${idx}`,
                message: `"${bath.name}" too large. Maximum: 15 m²`
            });
        }
    });

    // Rule 6: Common areas size validation
    req.commonAreas.forEach((room, idx) => {
        if (room.preferredSize < room.minSize) {
            errors.push({
                field: `common-${idx}`,
                message: `"${room.name}" too small. Minimum: ${room.minSize} m²`
            });
        }
        if (room.preferredSize > room.maxSize) {
            errors.push({
                field: `common-${idx}`,
                message: `"${room.name}" too large. Maximum: ${room.maxSize} m²`
            });
        }
    });

    return errors;
};

// Floor Plan Generator

const generateFloorPlan = (req: UserRequirements, variant: number = 0): FloorPlanResult => {
    const { plotWidth, plotDepth, style } = req;
    const wall = 0.15;
    const rooms: Room[] = [];

    const innerW = plotWidth - wall * 2;
    const innerH = plotDepth - wall * 2;

    const numBedrooms = req.bedrooms.length;
    const numBathrooms = req.bathrooms.length;
    const numCommon = req.commonAreas.length;

    // Corridor width for circulation (realistic: 1.0-1.2m)
    const corridorW = style === 'spacious' ? 1.2 : 1.0;
    
    // Style affects room padding - spacious has more breathing room
    const roomPadding = style === 'spacious' ? 0.15 : 0.05;
    
    // Door width constant for proper placement (standard single door ~80cm)
    const doorWidth = 0.8;
    
    // Calculate zones based on variant
    // Private zone (bedrooms + bathrooms) vs Public zone (living, kitchen, etc.)
    let privateZoneRatio: number;
    let layoutType: 'linear' | 'L-shaped' | 'split' = 'linear';
    
    if (variant === 0) {
        privateZoneRatio = 0.45;
        layoutType = 'linear'; // Bedrooms at back, living at front
    } else if (variant === 1) {
        privateZoneRatio = 0.50;
        layoutType = 'L-shaped'; // Bedrooms on one side
    } else {
        privateZoneRatio = 0.48;
        layoutType = 'split'; // Bedrooms split between two areas
    }

    const privateZoneH = innerH * privateZoneRatio;
    const publicZoneH = innerH - privateZoneH - corridorW;

    if (layoutType === 'linear') {
        // ========== LINEAR LAYOUT ==========
        // Private zone at top, corridor in middle, public zone at bottom
        
        // Calculate bedroom dimensions
        const bedroomAreaW = numBathrooms > 0 ? innerW * 0.75 : innerW;
        const bathroomAreaW = innerW - bedroomAreaW;
        
        // Place bedrooms side by side
        if (numBedrooms > 0) {
            const bedW = bedroomAreaW / numBedrooms;
            
            req.bedrooms.forEach((bed, idx) => {
                const hasEnsuite = bed.hasEnsuite;
                const ensuiteW = hasEnsuite ? bedW * 0.30 : 0;
                const actualBedW = bedW - ensuiteW - roomPadding;
                
                const x = wall + idx * bedW + roomPadding / 2;
                const y = wall + roomPadding / 2;
                const h = privateZoneH - roomPadding;
                
                // Door position: facing corridor (bottom wall of bedroom)
                // Place door 20% from left edge, ensuring it doesn't overlap corners
                // Door x is the hinge position
                const doorOffset = Math.max(0.3, actualBedW * 0.2);
                const doorX = idx % 2 === 0 
                    ? x + doorOffset  // Left side placement for even rooms
                    : x + actualBedW - doorOffset - doorWidth; // Right side for odd rooms
                const doorY = y + h;
                
                rooms.push({
                    id: bed.id,
                    type: 'bedroom',
                    label: bed.name,
                    x,
                    y,
                    w: actualBedW,
                    h,
                    doors: [{ x: doorX, y: doorY, direction: 'down', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                    hasEnsuite,
                });

                // Add ensuite attached to bedroom
                if (hasEnsuite) {
                    const ensuiteX = x + actualBedW;
                    const ensuiteY = y;
                    const ensuiteH = h * 0.6; // Ensuite smaller than full height
                    
                    // Ensuite door opens INTO bedroom (privacy)
                    rooms.push({
                        id: `${bed.id}-ensuite`,
                        type: 'ensuite',
                        label: 'Ensuite',
                        x: ensuiteX,
                        y: ensuiteY,
                        w: ensuiteW - roomPadding / 2,
                        h: ensuiteH,
                        // Ensuite door centered vertically, opens into bedroom
                        doors: [{ x: ensuiteX, y: ensuiteY + (ensuiteH - doorWidth) / 2, direction: 'left', swing: 'ccw' }],
                    });
                }
            });
        }

        // Place standalone bathrooms on the right side of private zone
        if (numBathrooms > 0) {
            const bathH = (privateZoneH - roomPadding) / numBathrooms;
            
            req.bathrooms.forEach((bath, idx) => {
                const x = wall + bedroomAreaW + roomPadding / 2;
                const y = wall + idx * bathH + roomPadding / 2;
                const bathRoomH = bathH - roomPadding;
                
                // Bathroom door faces corridor, centered on wall
                const doorY = y + (bathRoomH - doorWidth) / 2;
                
                rooms.push({
                    id: bath.id,
                    type: 'bathroom',
                    label: bath.name,
                    x,
                    y,
                    w: bathroomAreaW - roomPadding,
                    h: bathRoomH,
                    doors: [{ x: x, y: doorY, direction: 'left', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                });
            });
        }

        // Add corridor/hallway indicator
        const corridorY = wall + privateZoneH;
        rooms.push({
            id: 'corridor',
            type: 'corridor',
            label: 'Hallway',
            x: wall,
            y: corridorY,
            w: innerW,
            h: corridorW,
            doors: [],
        });

        // Place common areas in public zone
        if (numCommon > 0) {
            const publicStartY = corridorY + corridorW;
            const commonW = innerW / numCommon;
            
            req.commonAreas.forEach((room, idx) => {
                const x = wall + idx * commonW + roomPadding / 2;
                const y = publicStartY + roomPadding / 2;
                const w = commonW - roomPadding;
                const h = publicZoneH - roomPadding;
                
                // Door from corridor into room - offset from center for variety
                const doorOffset = idx % 2 === 0 
                    ? w * 0.3  // Offset to left for even rooms
                    : w * 0.7 - doorWidth; // Offset to right for odd rooms
                const doorX = x + doorOffset;
                const doorY = y;
                
                rooms.push({
                    id: room.id,
                    type: 'common',
                    label: room.name,
                    x,
                    y,
                    w,
                    h,
                    doors: [{ x: doorX, y: doorY, direction: 'up', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                });
            });
        }

    } else if (layoutType === 'L-shaped') {
        // ========== L-SHAPED LAYOUT ==========
        // Bedrooms on left side, bathrooms at corner, living wrapping around
        
        const bedroomZoneW = innerW * 0.40;
        const livingZoneW = innerW - bedroomZoneW - corridorW;
        
        // Stack bedrooms vertically on left
        if (numBedrooms > 0) {
            const bedH = innerH / numBedrooms;
            
            req.bedrooms.forEach((bed, idx) => {
                const hasEnsuite = bed.hasEnsuite;
                const ensuiteH = hasEnsuite ? bedH * 0.35 : 0;
                const actualBedH = bedH - ensuiteH - roomPadding;
                
                const x = wall + roomPadding / 2;
                const y = wall + idx * bedH + roomPadding / 2;
                const w = bedroomZoneW - corridorW - roomPadding;
                
                // Door facing corridor (on right side of bedroom)
                // Position door properly along the wall
                const doorOffset = Math.max(0.3, actualBedH * 0.25);
                const doorX = x + w;
                const doorY = y + doorOffset;
                
                rooms.push({
                    id: bed.id,
                    type: 'bedroom',
                    label: bed.name,
                    x,
                    y,
                    w,
                    h: actualBedH,
                    doors: [{ x: doorX, y: doorY, direction: 'right', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                    hasEnsuite,
                });

                // Ensuite below bedroom
                if (hasEnsuite) {
                    const ensuiteRealH = ensuiteH - roomPadding / 2;
                    rooms.push({
                        id: `${bed.id}-ensuite`,
                        type: 'ensuite',
                        label: 'Ensuite',
                        x,
                        y: y + actualBedH,
                        w: w * 0.6,
                        h: ensuiteRealH,
                        doors: [{ x: x + w * 0.6, y: y + actualBedH + (ensuiteRealH - doorWidth) / 2, direction: 'right', swing: 'ccw' }],
                    });
                }
            });
        }

        // Vertical corridor
        rooms.push({
            id: 'corridor',
            type: 'corridor',
            label: '',
            x: wall + bedroomZoneW - corridorW,
            y: wall,
            w: corridorW,
            h: innerH,
            doors: [],
        });

        // Bathrooms at top right corner
        if (numBathrooms > 0) {
            const bathAreaH = innerH * 0.30;
            const bathW = livingZoneW / numBathrooms;
            
            req.bathrooms.forEach((bath, idx) => {
                const x = wall + bedroomZoneW + idx * bathW + roomPadding / 2;
                const y = wall + roomPadding / 2;
                const bathRoomW = bathW - roomPadding;
                const bathRoomH = bathAreaH - roomPadding;
                
                // Door centered on left wall
                const doorY = y + (bathRoomH - doorWidth) / 2;
                
                rooms.push({
                    id: bath.id,
                    type: 'bathroom',
                    label: bath.name,
                    x,
                    y,
                    w: bathRoomW,
                    h: bathRoomH,
                    doors: [{ x: x, y: doorY, direction: 'left', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                });
            });
        }

        // Common areas in remaining L-shape
        if (numCommon > 0) {
            const bathAreaH = numBathrooms > 0 ? innerH * 0.30 : 0;
            const commonStartY = wall + bathAreaH;
            const commonH = (innerH - bathAreaH) / Math.max(numCommon, 1);
            
            req.commonAreas.forEach((room, idx) => {
                const x = wall + bedroomZoneW + roomPadding / 2;
                const y = commonStartY + idx * commonH + roomPadding / 2;
                
                rooms.push({
                    id: room.id,
                    type: 'common',
                    label: room.name,
                    x,
                    y,
                    w: livingZoneW - roomPadding,
                    h: commonH - roomPadding,
                    doors: [{ x: x, y: y + (commonH - roomPadding) * 0.4, direction: 'left', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                });
            });
        }

    } else {
        // ========== SPLIT LAYOUT ==========
        // Master bedroom separate, other bedrooms grouped, central living
        
        const masterZoneW = numBedrooms > 0 ? innerW * 0.35 : 0;
        const centralZoneW = innerW * 0.35;
        const secondaryZoneW = innerW - masterZoneW - centralZoneW;
        
        // Master bedroom on left (if exists)
        if (numBedrooms > 0) {
            const masterBed = req.bedrooms[0];
            const hasEnsuite = masterBed.hasEnsuite;
            const ensuiteH = hasEnsuite ? innerH * 0.35 : 0;
            
            const x = wall + roomPadding / 2;
            const y = wall + roomPadding / 2;
            const w = masterZoneW - corridorW - roomPadding;
            const h = innerH - ensuiteH - roomPadding;
            
            // Door on right wall, offset from top
            const doorOffset = Math.max(0.3, h * 0.25);
            
            rooms.push({
                id: masterBed.id,
                type: 'bedroom',
                label: masterBed.name,
                x,
                y,
                w,
                h,
                doors: [{ x: x + w, y: y + doorOffset, direction: 'right', swing: 'cw' }],
                hasEnsuite,
            });

            if (hasEnsuite) {
                // Ensuite door centered on top wall
                const ensuiteW = w * 0.7;
                const ensuiteDoorX = x + (ensuiteW - doorWidth) / 2;
                
                rooms.push({
                    id: `${masterBed.id}-ensuite`,
                    type: 'ensuite',
                    label: 'Master\nEnsuite',
                    x,
                    y: y + h,
                    w: ensuiteW,
                    h: ensuiteH - roomPadding / 2,
                    doors: [{ x: ensuiteDoorX, y: y + h, direction: 'up', swing: 'ccw' }],
                });
            }
        }

        // Secondary bedrooms on right
        if (numBedrooms > 1) {
            const secondaryBeds = req.bedrooms.slice(1);
            const bedH = innerH / secondaryBeds.length;
            
            secondaryBeds.forEach((bed, idx) => {
                const hasEnsuite = bed.hasEnsuite;
                const ensuiteW = hasEnsuite ? secondaryZoneW * 0.35 : 0;
                
                const x = wall + masterZoneW + centralZoneW + roomPadding / 2;
                const y = wall + idx * bedH + roomPadding / 2;
                const w = secondaryZoneW - ensuiteW - roomPadding;
                const h = bedH - roomPadding;
                
                // Door on left wall, offset from top
                const doorOffset = Math.max(0.3, h * 0.25);
                
                rooms.push({
                    id: bed.id,
                    type: 'bedroom',
                    label: bed.name,
                    x,
                    y,
                    w,
                    h,
                    doors: [{ x: x, y: y + doorOffset, direction: 'left', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                    hasEnsuite,
                });

                if (hasEnsuite) {
                    // Ensuite door centered on left wall
                    const ensuiteH = h * 0.6;
                    const ensuiteDoorY = y + (ensuiteH - doorWidth) / 2;
                    
                    rooms.push({
                        id: `${bed.id}-ensuite`,
                        type: 'ensuite',
                        label: 'Ensuite',
                        x: x + w,
                        y,
                        w: ensuiteW - roomPadding / 2,
                        h: ensuiteH,
                        doors: [{ x: x + w, y: ensuiteDoorY, direction: 'left', swing: 'ccw' }],
                    });
                }
            });
        }

        // Bathrooms in central zone (top)
        if (numBathrooms > 0) {
            const bathAreaH = innerH * 0.35;
            const bathW = centralZoneW / numBathrooms;
            
            req.bathrooms.forEach((bath, idx) => {
                const x = wall + masterZoneW + idx * bathW + roomPadding / 2;
                const y = wall + roomPadding / 2;
                const actualBathW = bathW - roomPadding;
                const actualBathH = bathAreaH - roomPadding;
                
                // Door centered on bottom wall
                const doorX = x + (actualBathW - doorWidth) / 2;
                
                rooms.push({
                    id: bath.id,
                    type: 'bathroom',
                    label: bath.name,
                    x,
                    y,
                    w: actualBathW,
                    h: actualBathH,
                    doors: [{ x: doorX, y: y + actualBathH, direction: 'down', swing: 'cw' }],
                });
            });
        }

        // Common areas in central zone (bottom)
        if (numCommon > 0) {
            const bathAreaH = numBathrooms > 0 ? innerH * 0.35 : 0;
            const commonStartY = wall + bathAreaH;
            const commonH = (innerH - bathAreaH) / numCommon;
            
            req.commonAreas.forEach((room, idx) => {
                const x = wall + masterZoneW + roomPadding / 2;
                const y = commonStartY + idx * commonH + roomPadding / 2;
                const actualCommonW = centralZoneW - roomPadding;
                
                // Door centered on top wall
                const doorX = x + (actualCommonW - doorWidth) / 2;
                
                rooms.push({
                    id: room.id,
                    type: 'common',
                    label: room.name,
                    x,
                    y,
                    w: actualCommonW,
                    h: commonH - roomPadding,
                    doors: [{ x: doorX, y: y, direction: 'up', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                });
            });
        }
    }

    return {
        width: plotWidth,
        height: plotDepth,
        rooms,
        wallThickness: wall,
    };
};

// SVG Components

// Professional floor plan door component with frame, panel, and swing arc
const DoorSwing = ({ x, y, direction, swing = 'cw' }: { x: number; y: number; direction: string; swing?: string }) => {
    const doorWidth = 0.8; // Door width ~80cm (standard single door)
    const doorThickness = 0.05; // Door panel thickness
    const frameWidth = 0.06; // Door frame width
    
    // Calculate door geometry based on direction and swing
    // The door hinge is at (x, y), door swings from there
    let transform = '';
    let hingeX = x;
    let hingeY = y;
    
    // Rotation angles for different wall orientations
    // direction: which way the door opens (into which side)
    // 'down' = door on top wall, opens downward into room
    // 'up' = door on bottom wall, opens upward into room
    // 'left' = door on right wall, opens leftward into room
    // 'right' = door on left wall, opens rightward into room
    
    if (direction === 'down') {
        // Door on horizontal wall, opens downward
        transform = `translate(${x}, ${y})`;
        if (swing === 'ccw') {
            transform = `translate(${x + doorWidth}, ${y}) scale(-1, 1)`;
        }
    } else if (direction === 'up') {
        // Door on horizontal wall, opens upward
        transform = `translate(${x}, ${y}) scale(1, -1)`;
        if (swing === 'ccw') {
            transform = `translate(${x + doorWidth}, ${y}) scale(-1, -1)`;
        }
    } else if (direction === 'left') {
        // Door on vertical wall, opens leftward
        transform = `translate(${x}, ${y}) rotate(-90)`;
        if (swing === 'ccw') {
            transform = `translate(${x}, ${y + doorWidth}) rotate(-90) scale(1, -1)`;
        }
    } else if (direction === 'right') {
        // Door on vertical wall, opens rightward
        transform = `translate(${x}, ${y}) rotate(90) scale(1, -1)`;
        if (swing === 'ccw') {
            transform = `translate(${x}, ${y + doorWidth}) rotate(90)`;
        }
    }

    return (
        <g transform={transform}>
            {/* Wall opening gap - white background */}
            <rect
                x={-frameWidth}
                y={-0.06}
                width={doorWidth + frameWidth * 2}
                height={0.12}
                fill="white"
            />
            
            {/* Door frame - left jamb */}
            <rect
                x={-frameWidth}
                y={-0.04}
                width={frameWidth}
                height={0.08}
                fill="#d4d4d4"
                stroke="#737373"
                strokeWidth={0.01}
            />
            
            {/* Door frame - right jamb */}
            <rect
                x={doorWidth}
                y={-0.04}
                width={frameWidth}
                height={0.08}
                fill="#d4d4d4"
                stroke="#737373"
                strokeWidth={0.01}
            />
            
            {/* Door swing arc (90 degree arc) */}
            <path
                d={`M 0 0 A ${doorWidth} ${doorWidth} 0 0 1 ${doorWidth} ${doorWidth}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={0.02}
                strokeDasharray="0.08 0.04"
            />
            
            {/* Door panel in open position (at 90 degrees) */}
            <rect
                x={-doorThickness / 2}
                y={0}
                width={doorThickness}
                height={doorWidth}
                fill="#b45309"
                stroke="#92400e"
                strokeWidth={0.01}
                rx={0.01}
            />
            
            {/* Door handle */}
            <circle
                cx={0}
                cy={doorWidth * 0.85}
                r={0.03}
                fill="#fbbf24"
                stroke="#d97706"
                strokeWidth={0.005}
            />
            
            {/* Hinge indicators */}
            <rect x={-0.02} y={0.08} width={0.04} height={0.04} fill="#525252" rx={0.005} />
            <rect x={-0.02} y={doorWidth - 0.12} width={0.04} height={0.04} fill="#525252" rx={0.005} />
        </g>
    );
};

const FloorPlanSVG = ({ plan }: { plan: FloorPlanResult }) => {
    const { width, height, rooms, wallThickness } = plan;

    // Room colors based on type for realistic floor plan look
    const getRoomStyle = (type: string) => {
        switch (type) {
            case 'bedroom':
                return { fill: '#fef3c7', stroke: '#1f2937', strokeWidth: '0.08' }; // Warm yellow
            case 'bathroom':
                return { fill: '#dbeafe', stroke: '#1f2937', strokeWidth: '0.08' }; // Light blue
            case 'ensuite':
                return { fill: '#e0f2fe', stroke: '#0284c7', strokeWidth: '0.10' }; // Cyan
            case 'corridor':
                return { fill: '#f5f5f4', stroke: '#a8a29e', strokeWidth: '0.04' }; // Light gray
            case 'common':
                return { fill: '#dcfce7', stroke: '#1f2937', strokeWidth: '0.08' }; // Light green
            default:
                return { fill: 'white', stroke: '#1f2937', strokeWidth: '0.08' };
        }
    };

    const getTextStyle = (type: string) => {
        switch (type) {
            case 'ensuite':
                return { fill: '#0284c7', fontWeight: '600', fontSize: '0.30' };
            case 'corridor':
                return { fill: '#78716c', fontWeight: '400', fontSize: '0.25' };
            default:
                return { fill: '#1f2937', fontWeight: '500', fontSize: '0.35' };
        }
    };

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto bg-white"
            style={{ maxHeight: '70vh' }}
        >
            {/* Outer walls */}
            <rect
                x={wallThickness / 2}
                y={wallThickness / 2}
                width={width - wallThickness}
                height={height - wallThickness}
                fill="white"
                stroke="#1f2937"
                strokeWidth={wallThickness}
            />

            {rooms.map((room) => {
                const roomStyle = getRoomStyle(room.type);
                const textStyle = getTextStyle(room.type);
                
                return (
                    <g key={room.id}>
                        {/* Room fill */}
                        <rect
                            x={room.x}
                            y={room.y}
                            width={room.w}
                            height={room.h}
                            fill={roomStyle.fill}
                            stroke={roomStyle.stroke}
                            strokeWidth={roomStyle.strokeWidth}
                        />

                        {/* Room label */}
                        {room.type !== 'corridor' && (
                            <text
                                x={room.x + room.w / 2}
                                y={room.y + room.h / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={textStyle.fontSize}
                                fontWeight={textStyle.fontWeight}
                                fill={textStyle.fill}
                                fontFamily="system-ui, sans-serif"
                            >
                                {room.label.split('\n').map((line, i) => (
                                    <tspan key={i} x={room.x + room.w / 2} dy={i === 0 ? 0 : '0.4em'}>
                                        {line}
                                    </tspan>
                                ))}
                            </text>
                        )}

                        {/* Room dimensions (small text) */}
                        <text
                            x={room.x + room.w / 2}
                            y={room.y + room.h - 0.2}
                            textAnchor="middle"
                            fontSize="0.20"
                            fill="#9ca3af"
                            fontFamily="system-ui, sans-serif"
                        >
                            {room.type !== 'corridor' && `${room.w.toFixed(1)}×${room.h.toFixed(1)}m`}
                        </text>

                        {/* Doors with improved rendering */}
                        {room.doors.map((door, doorIdx) => (
                            <DoorSwing
                                key={`door-${doorIdx}`}
                                x={door.x}
                                y={door.y}
                                direction={door.direction}
                                swing={door.swing}
                            />
                        ))}
                    </g>
                );
            })}
        </svg>
    );
};

// 3D Floor Plan Components

// Room colors for 3D view
const getRoomColor3D = (type: string): string => {
    switch (type) {
        case 'bedroom':
            return '#fef3c7'; // Warm yellow
        case 'bathroom':
            return '#dbeafe'; // Light blue
        case 'ensuite':
            return '#e0f2fe'; // Cyan
        case 'corridor':
            return '#f5f5f4'; // Light gray
        case 'common':
            return '#dcfce7'; // Light green
        default:
            return '#ffffff';
    }
};

// Wall component for 3D
const Wall3D = ({ 
    position, 
    size, 
    rotation = [0, 0, 0],
    hasDoor = false,
    doorPosition = 0.5 
}: { 
    position: [number, number, number]; 
    size: [number, number, number];
    rotation?: [number, number, number];
    hasDoor?: boolean;
    doorPosition?: number;
}) => {
    const wallColor = '#e5e7eb';
    const wallHeight = size[1];
    const wallWidth = size[0];
    const wallDepth = size[2];
    const doorWidth = 0.8;
    const doorHeight = 2.1;

    if (hasDoor && wallWidth > doorWidth * 1.5) {
        // Create wall with door opening
        const leftWallWidth = doorPosition * wallWidth - doorWidth / 2;
        const rightWallWidth = wallWidth - (doorPosition * wallWidth + doorWidth / 2);
        const topWallHeight = wallHeight - doorHeight;

        return (
            <group position={position} rotation={rotation as unknown as THREE.Euler}>
                {/* Left wall section */}
                {leftWallWidth > 0.05 && (
                    <mesh position={[-wallWidth / 2 + leftWallWidth / 2, 0, 0]}>
                        <boxGeometry args={[leftWallWidth, wallHeight, wallDepth]} />
                        <meshStandardMaterial color={wallColor} />
                    </mesh>
                )}
                {/* Right wall section */}
                {rightWallWidth > 0.05 && (
                    <mesh position={[wallWidth / 2 - rightWallWidth / 2, 0, 0]}>
                        <boxGeometry args={[rightWallWidth, wallHeight, wallDepth]} />
                        <meshStandardMaterial color={wallColor} />
                    </mesh>
                )}
                {/* Top section above door */}
                {topWallHeight > 0.05 && (
                    <mesh position={[doorPosition * wallWidth - wallWidth / 2, wallHeight / 2 - topWallHeight / 2, 0]}>
                        <boxGeometry args={[doorWidth + 0.1, topWallHeight, wallDepth]} />
                        <meshStandardMaterial color={wallColor} />
                    </mesh>
                )}
                {/* Door frame */}
                <mesh position={[doorPosition * wallWidth - wallWidth / 2, -wallHeight / 2 + doorHeight / 2, 0]}>
                    <boxGeometry args={[doorWidth + 0.08, doorHeight + 0.04, wallDepth + 0.02]} />
                    <meshStandardMaterial color="#78350f" />
                </mesh>
                {/* Door panel (slightly open) */}
                <mesh 
                    position={[doorPosition * wallWidth - wallWidth / 2 - doorWidth / 2 + 0.02, -wallHeight / 2 + doorHeight / 2, wallDepth / 2 + 0.02]}
                    rotation={[0, -Math.PI / 6, 0]}
                >
                    <boxGeometry args={[doorWidth - 0.05, doorHeight - 0.1, 0.04]} />
                    <meshStandardMaterial color="#92400e" />
                </mesh>
            </group>
        );
    }

    return (
        <mesh position={position} rotation={rotation as unknown as THREE.Euler}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={wallColor} />
        </mesh>
    );
};

// Room 3D component
const Room3D = ({ room, wallHeight = 2.8 }: { room: Room; wallHeight?: number }) => {
    const wallThickness = 0.15;
    const floorColor = getRoomColor3D(room.type);

    // Calculate center position (convert from top-left to center)
    const centerX = room.x + room.w / 2;
    const centerZ = room.y + room.h / 2;

    // Check which walls have doors
    const getDoorInfo = (wallSide: 'left' | 'right' | 'top' | 'bottom') => {
        const door = room.doors.find(d => {
            if (wallSide === 'bottom' && d.direction === 'down') return true;
            if (wallSide === 'top' && d.direction === 'up') return true;
            if (wallSide === 'left' && d.direction === 'left') return true;
            if (wallSide === 'right' && d.direction === 'right') return true;
            return false;
        });
        
        if (!door) return { hasDoor: false, doorPosition: 0.5 };
        
        // Calculate door position along the wall (0-1)
        let doorPos = 0.5;
        if (wallSide === 'left' || wallSide === 'right') {
            doorPos = (door.y - room.y) / room.h;
        } else {
            doorPos = (door.x - room.x) / room.w;
        }
        return { hasDoor: true, doorPosition: Math.max(0.15, Math.min(0.85, doorPos + 0.4)) };
    };

    const bottomDoor = getDoorInfo('bottom');
    const topDoor = getDoorInfo('top');
    const leftDoor = getDoorInfo('left');
    const rightDoor = getDoorInfo('right');

    return (
        <group>
            {/* Floor */}
            <mesh position={[centerX, 0.01, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[room.w - wallThickness, room.h - wallThickness]} />
                <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
            </mesh>

            {/* Room label on floor */}
            <Text
                position={[centerX, 0.02, centerZ]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={Math.min(room.w, room.h) * 0.12}
                color="#374151"
                anchorX="center"
                anchorY="middle"
                maxWidth={room.w * 0.8}
            >
                {room.label.replace('\n', ' ')}
            </Text>

            {/* Front wall (bottom in 2D = +Z in 3D) */}
            <Wall3D
                position={[centerX, wallHeight / 2, room.y + room.h - wallThickness / 2]}
                size={[room.w, wallHeight, wallThickness]}
                hasDoor={bottomDoor.hasDoor}
                doorPosition={bottomDoor.doorPosition}
            />

            {/* Back wall (top in 2D = -Z in 3D) */}
            <Wall3D
                position={[centerX, wallHeight / 2, room.y + wallThickness / 2]}
                size={[room.w, wallHeight, wallThickness]}
                hasDoor={topDoor.hasDoor}
                doorPosition={topDoor.doorPosition}
            />

            {/* Left wall */}
            <Wall3D
                position={[room.x + wallThickness / 2, wallHeight / 2, centerZ]}
                size={[room.h, wallHeight, wallThickness]}
                rotation={[0, Math.PI / 2, 0]}
                hasDoor={leftDoor.hasDoor}
                doorPosition={leftDoor.doorPosition}
            />

            {/* Right wall */}
            <Wall3D
                position={[room.x + room.w - wallThickness / 2, wallHeight / 2, centerZ]}
                size={[room.h, wallHeight, wallThickness]}
                rotation={[0, Math.PI / 2, 0]}
                hasDoor={rightDoor.hasDoor}
                doorPosition={rightDoor.doorPosition}
            />
        </group>
    );
};

// Main 3D Floor Plan Scene
const FloorPlan3DScene = ({ plan }: { plan: FloorPlanResult }) => {
    const { width, height, rooms, wallThickness } = plan;
    const centerX = width / 2;
    const centerZ = height / 2;

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[width, 15, height]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <directionalLight position={[-width, 10, -height]} intensity={0.4} />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.01, centerZ]} receiveShadow>
                <planeGeometry args={[width + 4, height + 4]} />
                <meshStandardMaterial color="#d1d5db" />
            </mesh>

            {/* Outer walls foundation */}
            <mesh position={[centerX, 0.05, centerZ]}>
                <boxGeometry args={[width, 0.1, height]} />
                <meshStandardMaterial color="#9ca3af" />
            </mesh>

            {/* Outer boundary walls */}
            {/* Front wall */}
            <mesh position={[centerX, 1.4, height - wallThickness / 2]}>
                <boxGeometry args={[width, 2.8, wallThickness]} />
                <meshStandardMaterial color="#d1d5db" />
            </mesh>
            {/* Back wall */}
            <mesh position={[centerX, 1.4, wallThickness / 2]}>
                <boxGeometry args={[width, 2.8, wallThickness]} />
                <meshStandardMaterial color="#d1d5db" />
            </mesh>
            {/* Left wall */}
            <mesh position={[wallThickness / 2, 1.4, centerZ]}>
                <boxGeometry args={[wallThickness, 2.8, height]} />
                <meshStandardMaterial color="#d1d5db" />
            </mesh>
            {/* Right wall */}
            <mesh position={[width - wallThickness / 2, 1.4, centerZ]}>
                <boxGeometry args={[wallThickness, 2.8, height]} />
                <meshStandardMaterial color="#d1d5db" />
            </mesh>

            {/* Render rooms */}
            {rooms.map((room) => (
                <Room3D key={room.id} room={room} />
            ))}
        </>
    );
};

// 3D Floor Plan Viewer Component
const FloorPlan3D = ({ plan }: { plan: FloorPlanResult }) => {
    const { width, height } = plan;
    const cameraDistance = Math.max(width, height) * 1.5;

    return (
        <div className="w-full h-[70vh] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 to-sky-50">
            <Canvas shadows>
                <PerspectiveCamera 
                    makeDefault 
                    position={[width / 2, cameraDistance * 0.8, height + cameraDistance * 0.5]} 
                    fov={50}
                />
                <OrbitControls 
                    target={[width / 2, 0, height / 2]}
                    minDistance={5}
                    maxDistance={cameraDistance * 2}
                    maxPolarAngle={Math.PI / 2.1}
                    enablePan={true}
                />
                
                {/* Sky background */}
                <color attach="background" args={['#e0f2fe']} />
                <fog attach="fog" args={['#e0f2fe', cameraDistance, cameraDistance * 3]} />

                <FloorPlan3DScene plan={plan} />
            </Canvas>
        </div>
    );
};

// Form Steps

const steps = [
    { id: 'dimensions', title: 'Plot Size', icon: Building2 },
    { id: 'rooms', title: 'Rooms', icon: BedDouble },
    { id: 'details', title: 'Room Details', icon: Pencil },
    { id: 'style', title: 'Style', icon: Sofa },
];

const createDefaultRequirements = (): UserRequirements => ({
    plotWidth: 12,
    plotDepth: 10,
    numBedrooms: 0,
    numBathrooms: 0,
    hasGarage: false,
    hasStudy: false,
    hasDining: false,
    style: 'compact',
    bedrooms: [],
    bathrooms: [],
    commonAreas: [],
});

interface PageProps {
    project?: FloorPlanProject;
}

export default function FloorPlan({ project }: PageProps) {
    const [step, setStep] = useState(0);
    const [requirements, setRequirements] = useState<UserRequirements>(project?.requirements || createDefaultRequirements());
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [generatedPlans, setGeneratedPlans] = useState<FloorPlanResult[] | null>(project?.generated_plans || null);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(project?.selected_plan_index || 0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [unit, setUnit] = useState<'meters' | 'feet'>('meters');
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const svgRef = useRef<HTMLDivElement>(null);

    // Project management state
    const [currentProjectId, setCurrentProjectId] = useState<number | null>(project?.id || null);
    const [currentProjectName, setCurrentProjectName] = useState<string>(project?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);
    const [myProjects, setMyProjects] = useState<FloorPlanProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load project data when component mounts with a project prop
    useEffect(() => {
        if (project) {
            setRequirements(project.requirements || createDefaultRequirements());
            setGeneratedPlans(project.generated_plans || null);
            setSelectedPlanIndex(project.selected_plan_index || 0);
            setCurrentProjectId(project.id);
            setCurrentProjectName(project.name);
            setHasUnsavedChanges(false);
        }
    }, [project]);

    // Track unsaved changes
    useEffect(() => {
        if (currentProjectId) {
            setHasUnsavedChanges(true);
        }
    }, [requirements, generatedPlans, selectedPlanIndex]);

    // Load projects from server
    const loadMyProjects = async () => {
        setLoadingProjects(true);
        try {
            const response = await axios.get('/api/floor-plan-projects');
            setMyProjects(response.data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    // Save project
    const handleSaveProject = async (name: string, description?: string) => {
        setIsSaving(true);
        try {
            const projectData = {
                name,
                description: description || null,
                requirements,
                generated_plans: generatedPlans,
                selected_plan_index: selectedPlanIndex,
            };

            let response;
            if (currentProjectId) {
                // Update existing project
                response = await axios.put(`/api/floor-plan-projects/${currentProjectId}`, projectData);
            } else {
                // Create new project
                response = await axios.post('/api/floor-plan-projects', projectData);
                setCurrentProjectId(response.data.id);
            }
            
            setCurrentProjectName(name);
            setHasUnsavedChanges(false);
            setSaveSuccess(true);
            setShowSaveModal(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save project:', error);
            alert('Failed to save project. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Load a project
    const handleLoadProject = (proj: FloorPlanProject) => {
        setRequirements(proj.requirements);
        setGeneratedPlans(proj.generated_plans);
        setSelectedPlanIndex(proj.selected_plan_index);
        setCurrentProjectId(proj.id);
        setCurrentProjectName(proj.name);
        setShowMyProjects(false);
        setHasUnsavedChanges(false);
    };

    // Delete a project
    const handleDeleteProject = async (projectId: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        
        try {
            await axios.delete(`/api/floor-plan-projects/${projectId}`);
            setMyProjects(prev => prev.filter(p => p.id !== projectId));
            if (currentProjectId === projectId) {
                setCurrentProjectId(null);
                setCurrentProjectName('');
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project. Please try again.');
        }
    };

    // Duplicate a project
    const handleDuplicateProject = async (projectId: number) => {
        try {
            const response = await axios.post(`/api/floor-plan-projects/${projectId}/duplicate`);
            setMyProjects(prev => [response.data, ...prev]);
        } catch (error) {
            console.error('Failed to duplicate project:', error);
            alert('Failed to duplicate project. Please try again.');
        }
    };

    const updateReq = <K extends keyof UserRequirements>(key: K, value: UserRequirements[K]) => {
        setRequirements((prev) => ({ ...prev, [key]: value }));
        setValidationErrors([]); // Clear errors when updating requirements
    };

    const updateRoomConfig = (roomType: 'bedrooms' | 'bathrooms' | 'commonAreas', index: number, updates: Partial<RoomConfig>) => {
        setRequirements((prev) => {
            const updated = { ...prev };
            updated[roomType] = [...updated[roomType]];
            updated[roomType][index] = { ...updated[roomType][index], ...updates };
            return updated;
        });
        setValidationErrors([]); // Clear errors when updating room details
    };

    const addRoom = (roomType: 'bedrooms' | 'bathrooms' | 'commonAreas') => {
        setRequirements((prev) => {
            const updated = { ...prev };
            let newRoom: RoomConfig;
            const count = updated[roomType].length + 1;

            if (roomType === 'bedrooms') {
                newRoom = {
                    id: `bed-${count}`,
                    name: count === 1 ? 'Master Bedroom' : `Bedroom ${count}`,
                    minSize: count === 1 ? 18 : 12,
                    maxSize: count === 1 ? 35 : 20,
                    preferredSize: count === 1 ? 25 : 15,
                    numDoors: 1,
                    hasEnsuite: count === 1,
                };
            } else if (roomType === 'bathrooms') {
                newRoom = {
                    id: `bath-${count}`,
                    name: `Bathroom ${count}`,
                    minSize: 4,
                    maxSize: 15,
                    preferredSize: 8,
                    numDoors: 1,
                };
            } else {
                const commonNames = ['Living Room', 'Kitchen', 'Dining Room', 'Study'];
                newRoom = {
                    id: `common-${count}`,
                    name: commonNames[count - 1] || `Room ${count}`,
                    minSize: count === 1 ? 20 : 12,
                    maxSize: count === 1 ? 50 : 30,
                    preferredSize: count === 1 ? 35 : 18,
                    numDoors: 1,
                };
            }

            updated[roomType] = [...updated[roomType], newRoom];
            return updated;
        });
        setValidationErrors([]); // Clear errors when adding room
    };

    const removeRoom = (roomType: 'bedrooms' | 'bathrooms' | 'commonAreas', index: number) => {
        setRequirements((prev) => {
            const updated = { ...prev };
            updated[roomType] = updated[roomType].filter((_, i) => i !== index);
            return updated;
        });
        setValidationErrors([]); // Clear errors when removing room
    };

    const handleGenerate = () => {
        const errors = validateRequirements(requirements);
        
        if (errors.length === 0) {
            setValidationErrors([]);
            setIsGenerating(true);
            setTimeout(() => {
                const plans = [
                    generateFloorPlan(requirements, 0),
                    generateFloorPlan(requirements, 1),
                    generateFloorPlan(requirements, 2),
                ];
                setGeneratedPlans(plans);
                setSelectedPlanIndex(0);
                setIsGenerating(false);
            }, 800);
        } else {
            setValidationErrors(errors);
        }
    };

    const handleDownload = () => {
        if (!svgRef.current) return;
        const svg = svgRef.current.querySelector('svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProjectName || 'floor-plan'}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPNG = async () => {
        if (!svgRef.current) return;
        const svg = svgRef.current.querySelector('svg');
        if (!svg) {
            alert('No floor plan to export. Please generate a floor plan first.');
            return;
        }
        
        try {
            // Clone the SVG to avoid modifying the original
            const svgClone = svg.cloneNode(true) as SVGSVGElement;
            
            // Get SVG dimensions
            const svgRect = svg.getBoundingClientRect();
            const width = svgRect.width * 2; // 2x scale for better quality
            const height = svgRect.height * 2;
            
            // Set explicit dimensions on clone
            svgClone.setAttribute('width', String(width));
            svgClone.setAttribute('height', String(height));
            
            // Convert SVG to data URL
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
            const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
            
            // Create image and draw to canvas
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    alert('Failed to create canvas context.');
                    return;
                }
                
                // Fill white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                
                // Draw SVG image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Export as PNG
                const pngUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `${currentProjectName || 'floor-plan'}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
            
            img.onerror = () => {
                alert('Failed to load SVG for export. Please try the SVG download instead.');
            };
            
            img.src = svgDataUrl;
        } catch (error) {
            console.error('Failed to download PNG:', error);
            alert('Failed to generate PNG image. Please try the SVG download instead.');
        }
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const totalArea = [
        ...requirements.bedrooms,
        ...requirements.bathrooms,
        ...requirements.commonAreas
    ].reduce((sum, room) => sum + room.preferredSize, 0);

    const plotArea = requirements.plotWidth * requirements.plotDepth;
    const coverage = ((totalArea / plotArea) * 100).toFixed(1);

    if (generatedPlans) {
        const generatedPlan = generatedPlans[selectedPlanIndex];
        return (
            <>
                <Head title="Floor Plan Designer" />
                <div className="min-h-screen bg-gray-50">
                    <div className="border-b border-gray-200 bg-white shadow-sm">
                        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 shadow hover:bg-gray-800 transition-colors"
                                    title="Back to Dashboard"
                                >
                                    <Home className="h-5 w-5 text-white" />
                                </Link>
                                <div className="leading-tight">
                                    <h1 className="text-lg font-semibold text-gray-900">Floor Plan Designer</h1>
                                    <p className="text-xs text-gray-500">
                                        {currentProjectName ? currentProjectName : 'Floor Plan Generated'}
                                        {hasUnsavedChanges && currentProjectId && <span className="text-amber-500"> (unsaved)</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        loadMyProjects();
                                        setShowMyProjects(true);
                                    }}
                                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <FolderOpen className="h-4 w-4" />
                                    My Projects
                                </button>
                                <button
                                    onClick={() => setShowSaveModal(true)}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : saveSuccess ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Project'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-6xl px-6 py-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Your Floor Plan</h2>
                                <p className="text-gray-500">
                                    {unit === 'meters' 
                                        ? `${requirements.plotWidth}m × ${requirements.plotDepth}m`
                                        : `${(requirements.plotWidth * 3.28084).toFixed(1)}ft × ${(requirements.plotDepth * 3.28084).toFixed(1)}ft`
                                    }
                                    {(requirements.bedrooms.length > 0 || requirements.bathrooms.length > 0) && (
                                        <> • {requirements.bedrooms.length} Bed • {requirements.bathrooms.length} Bath</>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setGeneratedPlans(null)}
                                    className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Edit
                                </button>
                                {viewMode === '2d' && (
                                    <div className="relative group">
                                        <button
                                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Plans
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden hidden group-hover:block">
                                            <button
                                                onClick={handleDownload}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-blue-600">SVG</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Vector SVG</p>
                                                    <p className="text-xs text-gray-500">Best for editing</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={handleDownloadPNG}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors border-t border-gray-100"
                                            >
                                                <div className="h-8 w-8 rounded bg-green-50 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-green-600">PNG</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Image PNG</p>
                                                    <p className="text-xs text-gray-500">Best for sharing</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-4">
                            <div className="lg:col-span-3">
                                <div className="space-y-4">
                                    {/* Layout Selector and View Toggle */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex gap-3 flex-1">
                                            {generatedPlans.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedPlanIndex(idx)}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
                                                        selectedPlanIndex === idx
                                                            ? 'bg-gray-900 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    Layout {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {/* 2D/3D Toggle */}
                                        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                                            <button
                                                onClick={() => setViewMode('2d')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                                                    viewMode === '2d'
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <Grid2X2 className="h-4 w-4" />
                                                2D
                                            </button>
                                            <button
                                                onClick={() => setViewMode('3d')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                                                    viewMode === '3d'
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <Box className="h-4 w-4" />
                                                3D
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Floor Plan View */}
                                    {viewMode === '2d' ? (
                                        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg" ref={svgRef}>
                                            <FloorPlanSVG plan={generatedPlan} />
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                                            <FloorPlan3D plan={generatedPlan} />
                                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                                <p className="text-sm text-gray-600 text-center">
                                                    🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                                    <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
                                    <div className="space-y-3 text-sm">
                                        {generatedPlan.rooms.map((room) => {
                                            const areaM2 = room.w * room.h;
                                            const areaSqFt = areaM2 * 10.7639;
                                            return (
                                                <div key={room.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                                    <span className="text-gray-700">{room.label.replace('\n', ' ')}</span>
                                                    <span className="text-gray-500">
                                                        {unit === 'meters' 
                                                            ? `${areaM2.toFixed(1)} m²`
                                                            : `${areaSqFt.toFixed(1)} sq ft`
                                                        }
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Project Modal */}
                {showSaveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Save Project</h2>
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="rounded-lg p-2 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const name = formData.get('name') as string;
                                    const description = formData.get('description') as string;
                                    if (name.trim()) {
                                        handleSaveProject(name.trim(), description?.trim() || undefined);
                                    }
                                }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            defaultValue={currentProjectName}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                            placeholder="My Floor Plan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                            placeholder="Optional description..."
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowSaveModal(false)}
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* My Projects Modal */}
                {showMyProjects && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white shadow-xl flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">My Floor Plan Projects</h2>
                                <button
                                    onClick={() => setShowMyProjects(false)}
                                    className="rounded-lg p-2 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {loadingProjects ? (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                                    </div>
                                ) : myProjects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No saved projects yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Create and save a floor plan to see it here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myProjects.map((proj) => (
                                            <div
                                                key={proj.id}
                                                className={`rounded-xl border p-4 transition hover:shadow-md ${
                                                    currentProjectId === proj.id
                                                        ? 'border-gray-900 bg-gray-50'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                                                        {proj.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{proj.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                            <span>
                                                                {proj.requirements?.plotWidth}m × {proj.requirements?.plotDepth}m
                                                            </span>
                                                            <span>
                                                                {proj.requirements?.bedrooms?.length || 0} bed, {proj.requirements?.bathrooms?.length || 0} bath
                                                            </span>
                                                            <span>
                                                                Updated: {new Date(proj.updated_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-4">
                                                        <button
                                                            onClick={() => handleLoadProject(proj)}
                                                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                                                            title="Load project"
                                                        >
                                                            <FolderOpen className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicateProject(proj.id)}
                                                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                                                            title="Duplicate project"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProject(proj.id)}
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                            title="Delete project"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowMyProjects(false)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <Head title="Floor Plan Designer" />
            <div className="min-h-screen bg-gray-50">
                <div className="border-b border-gray-200 bg-white shadow-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 shadow hover:bg-gray-800 transition-colors"
                                title="Back to Dashboard"
                            >
                                <Home className="h-5 w-5 text-white" />
                            </Link>
                            <div className="leading-tight">
                                <h1 className="text-lg font-semibold text-gray-900">Floor Plan Designer</h1>
                                <p className="text-xs text-gray-500">
                                    {currentProjectName ? currentProjectName : 'Create your perfect layout'}
                                    {hasUnsavedChanges && currentProjectId && <span className="text-amber-500"> (unsaved)</span>}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    loadMyProjects();
                                    setShowMyProjects(true);
                                }}
                                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <FolderOpen className="h-4 w-4" />
                                My Projects
                            </button>
                            <button
                                onClick={() => setShowSaveModal(true)}
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : saveSuccess ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Project'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl px-6 py-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                                {/* Progress */}
                                <div className="mb-8 flex items-center justify-between">
                                    {steps.map((s, i) => (
                                        <div key={s.id} className="flex items-center">
                                            <button
                                                onClick={() => setStep(i)}
                                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                                                    i === step
                                                        ? 'bg-gray-900 text-white'
                                                        : i < step
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                                                <span className="hidden sm:inline">{s.title}</span>
                                            </button>
                                            {i < steps.length - 1 && (
                                                <div className={`mx-2 h-0.5 w-8 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Step Content */}
                                <div className="min-h-[320px] space-y-6">
                                    {step === 0 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Plot Size</h2>
                                                <p className="text-gray-500">Enter dimensions in {unit}</p>
                                            </div>
                                            
                                            {/* Unit Selector */}
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium text-gray-700">Unit:</label>
                                                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                                    <button
                                                        onClick={() => setUnit('meters')}
                                                        className={`px-4 py-2 text-sm font-medium transition ${
                                                            unit === 'meters'
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Meters (m)
                                                    </button>
                                                    <button
                                                        onClick={() => setUnit('feet')}
                                                        className={`px-4 py-2 text-sm font-medium transition border-l border-gray-300 ${
                                                            unit === 'feet'
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Feet (ft)
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="grid gap-6 sm:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Width ({unit === 'meters' ? 'm' : 'ft'})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={unit === 'meters' ? 6 : 20}
                                                        max={unit === 'meters' ? 30 : 100}
                                                        step={unit === 'meters' ? 0.5 : 1}
                                                        value={unit === 'meters' ? requirements.plotWidth : (requirements.plotWidth * 3.28084).toFixed(1)}
                                                        onChange={(e) => {
                                                            const value = Number(e.target.value);
                                                            updateReq('plotWidth', unit === 'meters' ? value : value / 3.28084);
                                                        }}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                                    />
                                                    {unit === 'feet' && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            ≈ {requirements.plotWidth.toFixed(2)} m
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Depth ({unit === 'meters' ? 'm' : 'ft'})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={unit === 'meters' ? 6 : 20}
                                                        max={unit === 'meters' ? 30 : 100}
                                                        step={unit === 'meters' ? 0.5 : 1}
                                                        value={unit === 'meters' ? requirements.plotDepth : (requirements.plotDepth * 3.28084).toFixed(1)}
                                                        onChange={(e) => {
                                                            const value = Number(e.target.value);
                                                            updateReq('plotDepth', unit === 'meters' ? value : value / 3.28084);
                                                        }}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                                    />
                                                    {unit === 'feet' && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            ≈ {requirements.plotDepth.toFixed(2)} m
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-blue-50 p-4">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Total area:</strong> {(requirements.plotWidth * requirements.plotDepth).toFixed(1)} m² 
                                                    {unit === 'feet' && (
                                                        <span className="text-gray-600">
                                                            ({(requirements.plotWidth * requirements.plotDepth * 10.7639).toFixed(1)} sq ft)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Rooms</h2>
                                                <p className="text-gray-500">Add bedrooms, bathrooms, and common areas</p>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Bedrooms */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-gray-900">Bedrooms ({requirements.bedrooms.length})</h3>
                                                        <button
                                                            onClick={() => addRoom('bedrooms')}
                                                            className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                    {requirements.bedrooms.length === 0 ? (
                                                        <p className="text-sm text-gray-500 py-4 text-center rounded-lg bg-gray-50">
                                                            Click "Add" to add a bedroom
                                                        </p>
                                                    ) : (
                                                        requirements.bedrooms.map((bed, idx) => (
                                                            <div key={bed.id} className="rounded-lg border border-gray-200 p-3 bg-gray-50 mb-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <input
                                                                        type="text"
                                                                        value={bed.name}
                                                                        onChange={(e) => updateRoomConfig('bedrooms', idx, { name: e.target.value })}
                                                                        className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                                    />
                                                                    <button
                                                                        onClick={() => removeRoom('bedrooms', idx)}
                                                                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Bathrooms */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-gray-900">Bathrooms ({requirements.bathrooms.length})</h3>
                                                        <button
                                                            onClick={() => addRoom('bathrooms')}
                                                            className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                    {requirements.bathrooms.length === 0 ? (
                                                        <p className="text-sm text-gray-500 py-4 text-center rounded-lg bg-gray-50">
                                                            Click "Add" to add a bathroom
                                                        </p>
                                                    ) : (
                                                        requirements.bathrooms.map((bath, idx) => (
                                                            <div key={bath.id} className="rounded-lg border border-gray-200 p-3 bg-gray-50 mb-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <input
                                                                        type="text"
                                                                        value={bath.name}
                                                                        onChange={(e) => updateRoomConfig('bathrooms', idx, { name: e.target.value })}
                                                                        className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                                    />
                                                                    <button
                                                                        onClick={() => removeRoom('bathrooms', idx)}
                                                                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Common Areas */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-gray-900">Common Areas ({requirements.commonAreas.length})</h3>
                                                        <button
                                                            onClick={() => addRoom('commonAreas')}
                                                            className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                    {requirements.commonAreas.length === 0 ? (
                                                        <p className="text-sm text-gray-500 py-4 text-center rounded-lg bg-gray-50">
                                                            Click "Add" to add a common area (living room, kitchen, etc)
                                                        </p>
                                                    ) : (
                                                        requirements.commonAreas.map((room, idx) => (
                                                            <div key={room.id} className="rounded-lg border border-gray-200 p-3 bg-gray-50 mb-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <input
                                                                        type="text"
                                                                        value={room.name}
                                                                        onChange={(e) => updateRoomConfig('commonAreas', idx, { name: e.target.value })}
                                                                        className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                                    />
                                                                    <button
                                                                        onClick={() => removeRoom('commonAreas', idx)}
                                                                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Room Details</h2>
                                                <p className="text-gray-500">Customize room sizes, doors, and features</p>
                                            </div>

                                            {requirements.bedrooms.length === 0 && requirements.bathrooms.length === 0 && requirements.commonAreas.length === 0 ? (
                                                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
                                                    <p className="text-sm text-amber-800">
                                                        Go back to <strong>Add Rooms</strong> step and add at least one room to continue.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {validationErrors.length > 0 && (
                                                        <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                                                            <p className="text-sm font-medium text-red-800 mb-2">Validation Issues:</p>
                                                            <ul className="text-sm text-red-700 space-y-1">
                                                                {validationErrors.map((err, i) => (
                                                                    <li key={i}>• {err.message}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                                        {requirements.bedrooms.length > 0 && (
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 mb-2">Bedrooms</h3>
                                                                {requirements.bedrooms.map((bed, idx) => (
                                                                    <div key={bed.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50 mb-3">
                                                                        <h4 className="font-medium text-gray-900 mb-3 text-center">{bed.name}</h4>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                    Size ({unit === 'meters' ? 'm²' : 'sq ft'})
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={unit === 'meters' ? bed.minSize : (bed.minSize * 10.7639).toFixed(0)}
                                                                                    max={unit === 'meters' ? bed.maxSize : (bed.maxSize * 10.7639).toFixed(0)}
                                                                                    value={unit === 'meters' ? bed.preferredSize : (bed.preferredSize * 10.7639).toFixed(1)}
                                                                                    onChange={(e) => {
                                                                                        const value = Number(e.target.value);
                                                                                        updateRoomConfig('bedrooms', idx, { 
                                                                                            preferredSize: unit === 'meters' ? value : value / 10.7639 
                                                                                        });
                                                                                    }}
                                                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                                                />
                                                                                <p className="mt-1 text-xs text-gray-500">
                                                                                    {unit === 'meters' 
                                                                                        ? `${bed.minSize}-${bed.maxSize} m²`
                                                                                        : `${(bed.minSize * 10.7639).toFixed(0)}-${(bed.maxSize * 10.7639).toFixed(0)} sq ft`
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Doors</label>
                                                                                <div className="flex gap-1">
                                                                                    {[1, 2, 3, 4].map((n) => (
                                                                                        <button
                                                                                            key={n}
                                                                                            onClick={() => updateRoomConfig('bedrooms', idx, { numDoors: n })}
                                                                                            className={`flex-1 h-8 rounded-lg text-xs font-semibold ${
                                                                                                bed.numDoors === n
                                                                                                    ? 'bg-gray-900 text-white'
                                                                                                    : 'bg-white border border-gray-300'
                                                                                            }`}
                                                                                        >
                                                                                            {n}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <label className="mt-3 flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={bed.hasEnsuite || false}
                                                                                onChange={(e) => updateRoomConfig('bedrooms', idx, { hasEnsuite: e.target.checked })}
                                                                                className="rounded"
                                                                            />
                                                                            <span className="text-sm text-gray-700">Attached ensuite</span>
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {requirements.bathrooms.length > 0 && (
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 mb-2">Bathrooms</h3>
                                                                {requirements.bathrooms.map((bath, idx) => (
                                                                    <div key={bath.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50 mb-3">
                                                                        <h4 className="font-medium text-gray-900 mb-3 text-center">{bath.name}</h4>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                    Size ({unit === 'meters' ? 'm²' : 'sq ft'})
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={unit === 'meters' ? 4 : 43}
                                                                                    max={unit === 'meters' ? 15 : 161}
                                                                                    value={unit === 'meters' ? bath.preferredSize : (bath.preferredSize * 10.7639).toFixed(1)}
                                                                                    onChange={(e) => {
                                                                                        const value = Number(e.target.value);
                                                                                        updateRoomConfig('bathrooms', idx, { 
                                                                                            preferredSize: unit === 'meters' ? value : value / 10.7639 
                                                                                        });
                                                                                    }}
                                                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                                                />
                                                                                <p className="mt-1 text-xs text-gray-500">
                                                                                    {unit === 'meters' ? '4-15 m²' : '43-161 sq ft'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Doors</label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={1}
                                                                                    max={2}
                                                                                    value={bath.numDoors}
                                                                                    onChange={(e) => updateRoomConfig('bathrooms', idx, { numDoors: Number(e.target.value) })}
                                                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {requirements.commonAreas.length > 0 && (
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 mb-2">Common Areas</h3>
                                                                {requirements.commonAreas.map((room, idx) => (
                                                                    <div key={room.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50 mb-3">
                                                                        <h4 className="font-medium text-gray-900 mb-3 text-center">{room.name}</h4>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                    Size ({unit === 'meters' ? 'm²' : 'sq ft'})
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={unit === 'meters' ? room.minSize : (room.minSize * 10.7639).toFixed(0)}
                                                                                    max={unit === 'meters' ? room.maxSize : (room.maxSize * 10.7639).toFixed(0)}
                                                                                    value={unit === 'meters' ? room.preferredSize : (room.preferredSize * 10.7639).toFixed(1)}
                                                                                    onChange={(e) => {
                                                                                        const value = Number(e.target.value);
                                                                                        updateRoomConfig('commonAreas', idx, { 
                                                                                            preferredSize: unit === 'meters' ? value : value / 10.7639 
                                                                                        });
                                                                                    }}
                                                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                                                />
                                                                                <p className="mt-1 text-xs text-gray-500">
                                                                                    {unit === 'meters' 
                                                                                        ? `${room.minSize}-${room.maxSize} m²`
                                                                                        : `${(room.minSize * 10.7639).toFixed(0)}-${(room.maxSize * 10.7639).toFixed(0)} sq ft`
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Doors</label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={1}
                                                                                    max={4}
                                                                                    value={room.numDoors}
                                                                                    onChange={(e) => updateRoomConfig('commonAreas', idx, { numDoors: Number(e.target.value) })}
                                                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {totalArea > 0 && (
                                                        <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
                                                            <p className="text-sm text-blue-800">
                                                                <strong>Total:</strong> {unit === 'meters' 
                                                                    ? `${totalArea.toFixed(0)} m²`
                                                                    : `${(totalArea * 10.7639).toFixed(0)} sq ft`
                                                                } ({coverage}% of plot)
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Layout Style</h2>
                                                <p className="text-gray-500">Choose your preferred layout</p>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {['compact', 'spacious'].map((style) => (
                                                    <button
                                                        key={style}
                                                        onClick={() => updateReq('style', style as 'compact' | 'spacious')}
                                                        className={`rounded-xl border-2 p-6 text-left transition ${
                                                            requirements.style === style
                                                                ? 'border-gray-900 bg-gray-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <h3 className="font-semibold text-gray-900 capitalize">{style}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {style === 'compact' ? 'Efficient, cozy' : 'Spacious, open'}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                                    <button
                                        onClick={prevStep}
                                        disabled={step === 0}
                                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </button>
                                    {step < steps.length - 1 ? (
                                        <button
                                            onClick={nextStep}
                                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2 text-white hover:bg-gray-800"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-end gap-2">
                                            {validationErrors.length > 0 && (
                                                <div className="text-right">
                                                    <p className="text-xs text-red-600 font-medium">Fix {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''} to generate</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={handleGenerate}
                                                disabled={isGenerating || validationErrors.length > 0}
                                                className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-70"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4" />
                                                        Generate
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <div className="sticky top-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                                
                                {validationErrors.length > 0 && (
                                    <div className="rounded-lg bg-red-50 p-3 mb-4 border border-red-200">
                                        <p className="text-xs font-medium text-red-800 mb-2">Issues blocking generation:</p>
                                        <ul className="text-xs text-red-700 space-y-1">
                                            {validationErrors.map((err, i) => (
                                                <li key={i}>• {err.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Plot Size</span>
                                        <span className="font-medium">
                                            {unit === 'meters' 
                                                ? `${requirements.plotWidth}m × ${requirements.plotDepth}m`
                                                : `${(requirements.plotWidth * 3.28084).toFixed(1)}ft × ${(requirements.plotDepth * 3.28084).toFixed(1)}ft`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Plot Area</span>
                                        <span className="font-medium">
                                            {unit === 'meters' 
                                                ? `${plotArea.toFixed(1)} m²`
                                                : `${(plotArea * 10.7639).toFixed(1)} sq ft`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Total Rooms Area</span>
                                        <span className="font-medium">
                                            {unit === 'meters' 
                                                ? `${totalArea.toFixed(0)} m²`
                                                : `${(totalArea * 10.7639).toFixed(0)} sq ft`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Plot Usage</span>
                                        <span className={`font-medium ${parseFloat(coverage) > 95 ? 'text-red-600' : parseFloat(coverage) > 80 ? 'text-green-600' : 'text-gray-600'}`}>
                                            {coverage}%
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200 mt-2">
                                        <p className="text-xs text-gray-600 font-medium mb-2">Validation Rules:</p>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            <li>✓ At least 1 room required</li>
                                            <li>✓ Total area ≤ {unit === 'meters' 
                                                ? `${(plotArea * 0.95).toFixed(0)} m²`
                                                : `${(plotArea * 0.95 * 10.7639).toFixed(0)} sq ft`
                                            } (95%)</li>
                                            <li>✓ Bedroom: within min-max size</li>
                                            <li>✓ Bathroom: {unit === 'meters' ? '4-15 m²' : '43-161 sq ft'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Project Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Save Project</h2>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const name = formData.get('name') as string;
                                const description = formData.get('description') as string;
                                if (name.trim()) {
                                    handleSaveProject(name.trim(), description?.trim() || undefined);
                                }
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Name * 
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        defaultValue={currentProjectName}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                        placeholder="My Floor Plan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSaveModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* My Projects Modal */}
            {showMyProjects && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white shadow-xl flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">My Floor Plan Projects</h2>
                            <button
                                onClick={() => setShowMyProjects(false)}
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                                </div>
                            ) : myProjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No saved projects yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Create and save a floor plan to see it here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myProjects.map((proj) => (
                                        <div
                                            key={proj.id}
                                            className={`rounded-xl border p-4 transition hover:shadow-md ${
                                                currentProjectId === proj.id
                                                    ? 'border-gray-900 bg-gray-50'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                                                    {proj.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{proj.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                        <span>
                                                            {proj.requirements?.plotWidth}m × {proj.requirements?.plotDepth}m
                                                        </span>
                                                        <span>
                                                            {proj.requirements?.bedrooms?.length || 0} bed, {proj.requirements?.bathrooms?.length || 0} bath
                                                        </span>
                                                        <span>
                                                            Updated: {new Date(proj.updated_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-4">
                                                    <button
                                                        onClick={() => handleLoadProject(proj)}
                                                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                                                        title="Load project"
                                                    >
                                                        <FolderOpen className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicateProject(proj.id)}
                                                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                                                        title="Duplicate project"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(proj.id)}
                                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                        title="Delete project"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowMyProjects(false)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
