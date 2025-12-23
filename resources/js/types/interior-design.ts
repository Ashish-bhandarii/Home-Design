export type RoomTemplateId =
  | 'living'
  | 'kitchen'
  | 'dining'
  | 'bedroom'
  | 'bathroom'
  | 'study';

export type RoomApplication = RoomTemplateId | 'any';

export interface MaterialPalette {
  id: string;
  name: string;
  floor: string;
  wall: string;
  accent: string;
  lighting: string;
  description: string;
  mood: 'Warm' | 'Cool' | 'Neutral';
  appliesTo: RoomApplication[];
}

export interface LightingPreset {
  id: string;
  name: string;
  temperature: string;
  brightness: string;
  tint: string;
  description: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  style: string;
  width: number;
  length: number;
  height: number;
  price: number;
  suitableFor: RoomApplication[];
  color: string;
  finish: string;
  image?: string;
  modelUrl?: string;
  // Optional mounting type to help with wall/ceiling snapping behavior
  mount?: 'floor' | 'wall' | 'ceiling';
}

export interface FurniturePlacement {
  id: string;
  furnitureId: string;
  roomId: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
}

export interface InteriorRoomTemplate {
  name: string;
  width: number;
  length: number;
  level: number;
  description: string;
  tags: string[];
  defaultMaterialId: string;
  defaultLightingId: string;
}

export type MoodboardCategory = 'material' | 'furniture' | 'lighting' | 'inspiration';

export interface MoodboardItem {
  id: string;
  label: string;
  category: MoodboardCategory;
  swatch?: string;
  note?: string;
  sourceId: string;
}

export interface InteriorRoom {
  id: string;
  templateId: RoomTemplateId;
  name: string;
  level: number;
  width: number;
  length: number;
  notes?: string;
  floorColor?: string;
  wallColor?: string;
}

export interface RoomDesign {
  materialId: string;
  furnitureIds: string[];
  lightingId: string;
  aiNote?: string;
}

export interface LayoutRoom extends InteriorRoom {
  x: number;
  y: number;
  width: number;
  length: number;
}

export interface LayoutResult {
  rooms: LayoutRoom[];
  usedWidth: number;
  usedDepth: number;
  overflow: boolean;
  scale: number;
}

export interface InteriorCatalog {
  materials: MaterialPalette[];
  lighting: LightingPreset[];
  furniture: FurnitureItem[];
  templates: Record<RoomTemplateId, InteriorRoomTemplate>;
  inspiration: MoodboardItem[];
  defaultRooms: Array<{ templateId: RoomTemplateId; name: string }>;
}
