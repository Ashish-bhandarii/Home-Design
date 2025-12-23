import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { BedDouble, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Download, FolderOpen, Home, Pencil, RefreshCw, Save, Sofa, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
                
                // Door position: facing corridor (bottom of bedroom)
                // Door placed near corner but not exactly at corner (more realistic)
                const doorX = x + actualBedW * 0.25;
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
                        doors: [{ x: ensuiteX, y: ensuiteY + ensuiteH * 0.7, direction: 'left', swing: 'ccw' }],
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
                
                // Bathroom door faces corridor (not directly visible from living area)
                rooms.push({
                    id: bath.id,
                    type: 'bathroom',
                    label: bath.name,
                    x,
                    y,
                    w: bathroomAreaW - roomPadding,
                    h: bathH - roomPadding,
                    doors: [{ x: x, y: y + (bathH - roomPadding) * 0.5, direction: 'left', swing: 'cw' }],
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
                
                // Door from corridor into room
                const doorX = x + w * 0.5;
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
                const doorX = x + w;
                const doorY = y + actualBedH * 0.3;
                
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
                    rooms.push({
                        id: `${bed.id}-ensuite`,
                        type: 'ensuite',
                        label: 'Ensuite',
                        x,
                        y: y + actualBedH,
                        w: w * 0.6,
                        h: ensuiteH - roomPadding / 2,
                        doors: [{ x: x + w * 0.3, y: y + actualBedH, direction: 'up', swing: 'ccw' }],
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
                
                rooms.push({
                    id: bath.id,
                    type: 'bathroom',
                    label: bath.name,
                    x,
                    y,
                    w: bathW - roomPadding,
                    h: bathAreaH - roomPadding,
                    doors: [{ x: x, y: y + (bathAreaH - roomPadding) * 0.5, direction: 'left', swing: 'cw' }],
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
            
            rooms.push({
                id: masterBed.id,
                type: 'bedroom',
                label: masterBed.name,
                x,
                y,
                w,
                h,
                doors: [{ x: x + w, y: y + h * 0.4, direction: 'right', swing: 'cw' }],
                hasEnsuite,
            });

            if (hasEnsuite) {
                rooms.push({
                    id: `${masterBed.id}-ensuite`,
                    type: 'ensuite',
                    label: 'Master\nEnsuite',
                    x,
                    y: y + h,
                    w: w * 0.7,
                    h: ensuiteH - roomPadding / 2,
                    doors: [{ x: x + w * 0.35, y: y + h, direction: 'up', swing: 'ccw' }],
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
                
                rooms.push({
                    id: bed.id,
                    type: 'bedroom',
                    label: bed.name,
                    x,
                    y,
                    w,
                    h,
                    doors: [{ x: x, y: y + h * 0.4, direction: 'left', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
                    hasEnsuite,
                });

                if (hasEnsuite) {
                    rooms.push({
                        id: `${bed.id}-ensuite`,
                        type: 'ensuite',
                        label: 'Ensuite',
                        x: x + w,
                        y,
                        w: ensuiteW - roomPadding / 2,
                        h: h * 0.6,
                        doors: [{ x: x + w, y: y + h * 0.3, direction: 'left', swing: 'ccw' }],
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
                
                rooms.push({
                    id: bath.id,
                    type: 'bathroom',
                    label: bath.name,
                    x,
                    y,
                    w: bathW - roomPadding,
                    h: bathAreaH - roomPadding,
                    doors: [{ x: x + (bathW - roomPadding) * 0.5, y: y + bathAreaH - roomPadding, direction: 'down', swing: 'cw' }],
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
                
                rooms.push({
                    id: room.id,
                    type: 'common',
                    label: room.name,
                    x,
                    y,
                    w: centralZoneW - roomPadding,
                    h: commonH - roomPadding,
                    doors: [{ x: x + (centralZoneW - roomPadding) * 0.5, y: y, direction: 'up', swing: idx % 2 === 0 ? 'cw' : 'ccw' }],
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

const DoorSwing = ({ x, y, direction, swing = 'cw' }: { x: number; y: number; direction: string; swing?: string }) => {
    const size = 0.6; // Door width ~60cm
    const strokeW = 0.06;

    let arcPath = '';
    let doorLine = { x1: x, y1: y, x2: x, y2: y };

    if (direction === 'down') {
        if (swing === 'cw') {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 1 ${x + size} ${y + size}`;
            doorLine = { x1: x, y1: y, x2: x + size, y2: y + size };
        } else {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 0 ${x - size} ${y + size}`;
            doorLine = { x1: x, y1: y, x2: x - size, y2: y + size };
        }
    } else if (direction === 'left') {
        if (swing === 'cw') {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 0 ${x - size} ${y + size}`;
            doorLine = { x1: x, y1: y, x2: x - size, y2: y + size };
        } else {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 1 ${x - size} ${y - size}`;
            doorLine = { x1: x, y1: y, x2: x - size, y2: y - size };
        }
    } else if (direction === 'right') {
        if (swing === 'cw') {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 0 ${x + size} ${y + size}`;
            doorLine = { x1: x, y1: y, x2: x + size, y2: y + size };
        } else {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 1 ${x + size} ${y - size}`;
            doorLine = { x1: x, y1: y, x2: x + size, y2: y - size };
        }
    } else if (direction === 'up') {
        if (swing === 'cw') {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 1 ${x - size} ${y - size}`;
            doorLine = { x1: x, y1: y, x2: x - size, y2: y - size };
        } else {
            arcPath = `M ${x} ${y} A ${size} ${size} 0 0 0 ${x + size} ${y - size}`;
            doorLine = { x1: x, y1: y, x2: x + size, y2: y - size };
        }
    }

    return (
        <g>
            {/* Door swing arc */}
            <path d={arcPath} fill="none" stroke="#6b7280" strokeWidth={strokeW} strokeLinecap="round" strokeDasharray="0.1 0.05" />
            {/* Door panel (solid line) */}
            <line
                x1={doorLine.x1}
                y1={doorLine.y1}
                x2={doorLine.x2}
                y2={doorLine.y2}
                stroke="#1f2937"
                strokeWidth={0.08}
                strokeLinecap="round"
            />
            {/* Door hinge point */}
            <circle cx={x} cy={y} r="0.05" fill="#1f2937" />
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
        
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await (html2canvas as any)(svgRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
            } as any);
            
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentProjectName || 'floor-plan'}.png`;
            a.click();
        } catch (error) {
            console.error('Failed to download PNG:', error);
            alert('Failed to generate image. Please try again.');
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
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-4">
                            <div className="lg:col-span-3">
                                <div className="space-y-4">
                                    {/* Layout Selector */}
                                    <div className="flex gap-3">
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
                                    {/* Floor Plan */}
                                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg" ref={svgRef}>
                                        <FloorPlanSVG plan={generatedPlan} />
                                    </div>
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
