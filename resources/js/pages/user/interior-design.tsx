import { fetchInteriorCatalog, loadStaticInteriorCatalog } from '@/lib/interior-data'
import type {
    FurnitureItem,
    FurniturePlacement,
    InteriorCatalog,
    InteriorRoom,
    RoomDesign,
    RoomTemplateId
} from '@/types/interior-design'
import { Head, Link } from '@inertiajs/react'
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import axios from 'axios'
import clsx from 'clsx'
import {
    Armchair,
    Bath,
    Bed,
    BookOpen,
    Check,
    ChevronDown,
    CircleDot,
    Copy,
    DoorClosed,
    Download,
    Droplets,
    FileJson,
    Flower2,
    FolderOpen,
    Frame,
    Grid3X3,
    GripVertical,
    Home,
    Image as ImageIcon,
    Lamp,
    LampDesk,
    LayoutGrid,
    Loader2,
    Minus,
    Monitor,
    Move,
    PanelTop,
    Pipette,
    Plus,
    RectangleVertical,
    RotateCw,
    Save,
    Scale,
    Shirt,
    ShoppingBasket,
    Sofa,
    Square,
    Table,
    Toilet,
    Trash2,
    Tv,
    Users,
    UtensilsCrossed,
    Waves,
    X
} from 'lucide-react'
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Project type for saved designs
interface InteriorDesignProject {
    id: number
    name: string
    description: string | null
    thumbnail: string | null
    rooms: InteriorRoom[]
    placements: FurniturePlacement[]
    room_designs: Record<string, RoomDesign>
    created_at: string
    updated_at: string
}

type ViewMode = '2d' | '3d'

const ROOM_TYPES = [
    { id: 'living', name: 'Living Room', icon: Sofa, width: 5, length: 5 },
    { id: 'bedroom', name: 'Bedroom', icon: Lamp, width: 4, length: 4 },
    { id: 'kitchen', name: 'Kitchen', icon: Grid3X3, width: 3.5, length: 4 },
    { id: 'bathroom', name: 'Bathroom', icon: Square, width: 2.5, length: 3 },
    { id: 'dining', name: 'Dining Room', icon: Users, width: 4, length: 3.5 },
]

// Room size limits in meters
const ROOM_SIZE_LIMITS = {
    minWidth: 2,
    maxWidth: 15,
    minLength: 2,
    maxLength: 15,
}

// Identify items that should live on walls (doors, windows, wall decor, some lighting).  
const isWallMountedFurniture = (furniture: FurnitureItem | null | undefined): boolean => {
    if (!furniture) return false
    return furniture.category === 'Doors' || furniture.mount === 'wall'
}

// Room color presets
const FLOOR_COLORS = [
    { id: 'wood-light', name: 'Light Oak', color: '#d4a574' },
    { id: 'wood-medium', name: 'Walnut', color: '#8B5A2B' },
    { id: 'wood-dark', name: 'Dark Mahogany', color: '#4A2C2A' },
    { id: 'marble-white', name: 'White Marble', color: '#F5F5F5' },
    { id: 'marble-gray', name: 'Gray Marble', color: '#B0B0B0' },
    { id: 'tile-beige', name: 'Beige Tile', color: '#D2B48C' },
    { id: 'tile-gray', name: 'Gray Tile', color: '#808080' },
    { id: 'carpet-cream', name: 'Cream Carpet', color: '#FFFDD0' },
]

const WALL_COLORS = [
    { id: 'white', name: 'White', color: '#FFFFFF' },
    { id: 'off-white', name: 'Off White', color: '#FAF9F6' },
    { id: 'warm-beige', name: 'Warm Beige', color: '#F5DEB3' },
    { id: 'light-gray', name: 'Light Gray', color: '#D3D3D3' },
    { id: 'soft-blue', name: 'Soft Blue', color: '#B0C4DE' },
    { id: 'sage-green', name: 'Sage Green', color: '#9DC183' },
    { id: 'blush-pink', name: 'Blush Pink', color: '#FFB6C1' },
    { id: 'warm-gray', name: 'Warm Gray', color: '#A9A9A9' },
]

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)
const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2, 9)}`)

// Furniture category icons
const FURNITURE_CATEGORIES = [
    { id: 'Seating', name: 'Seating', icon: Armchair },
    { id: 'Tables', name: 'Tables', icon: Table },
    { id: 'Beds', name: 'Beds', icon: Bed },
    { id: 'Storage', name: 'Storage', icon: BookOpen },
    { id: 'Kitchen', name: 'Kitchen', icon: UtensilsCrossed },
    { id: 'Bathroom', name: 'Bathroom', icon: Bath },
    { id: 'Lighting', name: 'Lighting', icon: Lamp },
    { id: 'Decor', name: 'Decor', icon: Flower2 },
    { id: 'Doors', name: 'Doors & Windows', icon: DoorClosed },
]

// Get specific icon for furniture item based on its name/id
const getFurnitureIcon = (item: { id: string; name: string; category: string }) => {
    const name = item.name.toLowerCase()
    
    // Seating
    if (name.includes('sofa') || name.includes('couch')) return Sofa
    if (name.includes('armchair') || name.includes('accent chair')) return Armchair
    if (name.includes('dining chair')) return Users
    if (name.includes('office chair')) return Armchair
    if (name.includes('bar stool') || name.includes('stool')) return Square
    
    // Tables
    if (name.includes('dining table')) return Table
    if (name.includes('coffee table')) return Table
    if (name.includes('side table') || name.includes('end table')) return Square
    if (name.includes('desk') || name.includes('study')) return Monitor
    if (name.includes('console')) return PanelTop
    
    // Beds
    if (name.includes('bed')) return Bed
    
    // Storage
    if (name.includes('wardrobe') || name.includes('closet')) return Shirt
    if (name.includes('bookshelf') || name.includes('shelf')) return BookOpen
    if (name.includes('tv unit') || name.includes('entertainment')) return Tv
    if (name.includes('cabinet')) return Square
    if (name.includes('drawer') || name.includes('dresser')) return Square
    if (name.includes('shoe')) return Square
    
    // Kitchen
    if (name.includes('island')) return UtensilsCrossed
    if (name.includes('refrigerator') || name.includes('fridge')) return Square
    if (name.includes('kitchen cabinet')) return Square
    
    // Bathroom
    if (name.includes('vanity')) return Bath
    if (name.includes('bathtub') || name.includes('tub')) return Bath
    if (name.includes('shower')) return Droplets
    if (name.includes('toilet')) return Toilet
    if (name.includes('bidet')) return Waves
    if (name.includes('towel rack') || name.includes('heated towel')) return GripVertical
    if (name.includes('towel bar')) return GripVertical
    if (name.includes('medicine cabinet')) return RectangleVertical
    if (name.includes('bathroom cabinet') || name.includes('wall cabinet')) return RectangleVertical
    if (name.includes('bathroom mirror') || name.includes('led mirror')) return Frame
    if (name.includes('bathroom shelf') || name.includes('glass shelf')) return GripVertical
    if (name.includes('toilet paper')) return CircleDot
    if (name.includes('laundry') || name.includes('hamper')) return ShoppingBasket
    if (name.includes('bathroom stool')) return Square
    if (name.includes('bathroom scale') || name.includes('scale')) return Scale
    if (name.includes('soap dispenser')) return Pipette
    if (name.includes('bath mat')) return Square
    
    // Lighting
    if (name.includes('chandelier')) return Lamp
    if (name.includes('pendant')) return Lamp
    if (name.includes('floor lamp')) return Lamp
    if (name.includes('table lamp')) return LampDesk
    if (name.includes('sconce') || name.includes('wall light')) return Lamp
    
    // Decor
    if (name.includes('rug') || name.includes('carpet')) return Square
    if (name.includes('plant')) return Flower2
    if (name.includes('mirror')) return Frame
    if (name.includes('art') || name.includes('painting')) return Frame
    if (name.includes('curtain') || name.includes('drape')) return PanelTop
    if (name.includes('vase')) return Flower2
    
    // Doors & Windows
    if (name.includes('door')) return DoorClosed
    if (name.includes('window')) return PanelTop
    
    // Default by category
    const categoryIcon = FURNITURE_CATEGORIES.find(c => c.id === item.category)?.icon
    return categoryIcon || Armchair
}

interface PageProps {
    project?: InteriorDesignProject
}

export default function InteriorDesign({ project }: PageProps) {
    const [catalog, setCatalog] = useState<InteriorCatalog>(loadStaticInteriorCatalog())
    const [rooms, setRooms] = useState<InteriorRoom[]>(project?.rooms || [])
    const [roomDesigns, setRoomDesigns] = useState<Record<string, RoomDesign>>(project?.room_designs || {})
    const [placements, setPlacements] = useState<FurniturePlacement[]>(project?.placements || [])
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('2d')
    const [zoom, setZoom] = useState(100)
    const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
    const [addRoomExpanded, setAddRoomExpanded] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>('Seating')
    
    // Project management state
    const [currentProjectId, setCurrentProjectId] = useState<number | null>(project?.id || null)
    const [currentProjectName, setCurrentProjectName] = useState<string>(project?.name || '')
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [showMyProjects, setShowMyProjects] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [myProjects, setMyProjects] = useState<InteriorDesignProject[]>([])
    const [loadingProjects, setLoadingProjects] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const canvasRef = useRef<HTMLDivElement>(null)

    // Load project data when component mounts with a project prop
    useEffect(() => {
        if (project) {
            setRooms(project.rooms || [])
            setPlacements(project.placements || [])
            setRoomDesigns(project.room_designs || {})
            setCurrentProjectId(project.id)
            setCurrentProjectName(project.name)
            if (project.rooms && project.rooms.length > 0) {
                setSelectedRoomId(project.rooms[0].id)
            }
            setHasUnsavedChanges(false)
        }
    }, [project])

    // Track unsaved changes
    useEffect(() => {
        if (currentProjectId) {
            setHasUnsavedChanges(true)
        }
    }, [rooms, placements, roomDesigns])

    // Load projects from server
    const loadMyProjects = async () => {
        setLoadingProjects(true)
        try {
            const response = await axios.get('/api/interior-projects')
            setMyProjects(response.data)
        } catch (error) {
            console.error('Failed to load projects:', error)
        } finally {
            setLoadingProjects(false)
        }
    }

    // Save project
    const handleSaveProject = async (name: string, description?: string) => {
        if (rooms.length === 0) {
            alert('Please add at least one room before saving.')
            return
        }
        
        setIsSaving(true)
        try {
            const projectData = {
                name,
                description: description || null,
                rooms,
                placements,
                room_designs: roomDesigns,
            }

            let response
            if (currentProjectId) {
                // Update existing project
                response = await axios.put(`/api/interior-projects/${currentProjectId}`, projectData)
            } else {
                // Create new project
                response = await axios.post('/api/interior-projects', projectData)
                setCurrentProjectId(response.data.id)
            }
            
            setCurrentProjectName(name)
            setHasUnsavedChanges(false)
            setSaveSuccess(true)
            setShowSaveModal(false)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error) {
            console.error('Failed to save project:', error)
            alert('Failed to save project. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    // Load a project
    const handleLoadProject = (proj: InteriorDesignProject) => {
        setRooms(proj.rooms)
        setPlacements(proj.placements)
        setRoomDesigns(proj.room_designs || {})
        setCurrentProjectId(proj.id)
        setCurrentProjectName(proj.name)
        setSelectedRoomId(proj.rooms.length > 0 ? proj.rooms[0].id : null)
        setShowMyProjects(false)
        setHasUnsavedChanges(false)
    }

    // Delete a project
    const handleDeleteProject = async (projectId: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return
        
        try {
            await axios.delete(`/api/interior-projects/${projectId}`)
            setMyProjects(prev => prev.filter(p => p.id !== projectId))
            if (currentProjectId === projectId) {
                setCurrentProjectId(null)
                setCurrentProjectName('')
            }
        } catch (error) {
            console.error('Failed to delete project:', error)
            alert('Failed to delete project. Please try again.')
        }
    }

    // Duplicate a project
    const handleDuplicateProject = async (projectId: number) => {
        try {
            const response = await axios.post(`/api/interior-projects/${projectId}/duplicate`)
            setMyProjects(prev => [response.data, ...prev])
        } catch (error) {
            console.error('Failed to duplicate project:', error)
            alert('Failed to duplicate project. Please try again.')
        }
    }

    // Export as JSON
    const handleExportJSON = () => {
        const exportData = {
            name: currentProjectName || 'Untitled Project',
            rooms,
            placements,
            roomDesigns,
            exportedAt: new Date().toISOString(),
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentProjectName || 'interior-design'}-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        setShowExportMenu(false)
    }

    // Export as PNG (2D view)
    const handleExportPNG = async () => {
        // Ensure we're in 2D view
        if (viewMode !== '2d') {
            alert('Please switch to 2D view to export as PNG.')
            setShowExportMenu(false)
            return
        }

        // Check if a room is selected
        if (!selectedRoomId || rooms.length === 0) {
            alert('Please select a room to export.')
            setShowExportMenu(false)
            return
        }

        const canvasElement = canvasRef.current
        if (!canvasElement) {
            alert('Could not find canvas element. Please try again.')
            setShowExportMenu(false)
            return
        }

        try {
            const html2canvas = (await import('html2canvas')).default
            
            const canvas = await html2canvas(canvasElement, {
                background: '#1e293b',
                scale: 1.5, // Use a slightly lower scale for better performance
                logging: false,
            } as any)
            
            const url = canvas.toDataURL('image/png')
            const a = document.createElement('a')
            a.href = url
            a.download = `${currentProjectName || 'interior-design'}-2d-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        } catch (error) {
            console.error('Failed to export PNG:', error)
            alert('Failed to export image. Please try again.')
        } finally {
            setShowExportMenu(false)
        }
    }

    // Start new project - redirect to fresh interior design page
    const handleNewProject = () => {
        if (hasUnsavedChanges && !confirm('You have unsaved changes. Start a new project anyway?')) {
            return
        }
        // Redirect to interior design page for a fresh start
        window.location.href = '/interior-design'
    }

    // Update furniture position with boundary constraints based on furniture size
    const handleMoveFurniture = useCallback((placementId: string, newOffsetX: number, newOffsetY: number) => {
        setPlacements((current) => {
            const placement = current.find(p => p.id === placementId)
            if (!placement) return current
            
            const furniture = catalog.furniture.find(f => f.id === placement.furnitureId)
            const room = rooms.find(r => r.id === placement.roomId)
            
            if (!furniture || !room) {
                return current.map((p) =>
                    p.id === placementId
                        ? { ...p, offsetX: clamp(newOffsetX, 0.05, 0.95), offsetY: clamp(newOffsetY, 0.05, 0.95) }
                        : p
                )
            }
            
            // For wall-mounted items (doors/windows/mirrors/paintings), snap to nearest wall automatically
            const isWallMounted = isWallMountedFurniture(furniture)
            if (isWallMounted) {
                const WALL_POSITION = 0.01
                // Determine which wall is nearest using strict less-than comparisons
                const distTop = newOffsetY
                const distBottom = 1 - newOffsetY
                const distLeft = newOffsetX
                const distRight = 1 - newOffsetX
                
                let finalX = newOffsetX
                let finalY = newOffsetY
                
                // Compare horizontal (top/bottom) vs vertical (left/right) distances
                const minHorizontal = Math.min(distTop, distBottom)
                const minVertical = Math.min(distLeft, distRight)
                
                if (minHorizontal < minVertical) {
                    // Snap to top or bottom wall
                    if (distTop < distBottom) {
                        finalY = WALL_POSITION
                        finalX = clamp(newOffsetX, 0.15, 0.85)
                    } else {
                        finalY = 1 - WALL_POSITION
                        finalX = clamp(newOffsetX, 0.15, 0.85)
                    }
                } else {
                    // Snap to left or right wall
                    if (distLeft < distRight) {
                        finalX = WALL_POSITION
                        finalY = clamp(newOffsetY, 0.15, 0.85)
                    } else {
                        finalX = 1 - WALL_POSITION
                        finalY = clamp(newOffsetY, 0.15, 0.85)
                    }
                }
                
                return current.map((p) =>
                    p.id === placementId
                        ? { ...p, offsetX: finalX, offsetY: finalY }
                        : p
                )
            }
            
            // Calculate boundary margins based on furniture size relative to room
            const halfWidthRatio = (furniture.width / 2) / room.width
            const halfLengthRatio = (furniture.length / 2) / room.length
            
            // Clamp position so furniture stays within room boundaries
            const minX = halfWidthRatio + 0.02
            const maxX = 1 - halfWidthRatio - 0.02
            const minY = halfLengthRatio + 0.02
            const maxY = 1 - halfLengthRatio - 0.02
            
            return current.map((p) =>
                p.id === placementId
                    ? { ...p, offsetX: clamp(newOffsetX, minX, maxX), offsetY: clamp(newOffsetY, minY, maxY) }
                    : p
            )
        })
    }, [catalog, rooms])

    // Rotate furniture by 45 degrees (or flip doors 180 degrees)
    const handleRotateFurniture = useCallback((placementId: string) => {
        setPlacements((current) => {
            const placement = current.find(p => p.id === placementId)
            if (!placement) return current
            
            const furniture = catalog.furniture.find(f => f.id === placement.furnitureId)
            const isDoor = furniture?.category === 'Doors' && !furniture.name.toLowerCase().includes('window')
            
            return current.map((p) =>
                p.id === placementId
                    ? { ...p, rotation: isDoor ? (p.rotation === 0 ? 180 : 0) : ((p.rotation || 0) + 45) % 360 }
                    : p
            )
        })
    }, [catalog])

    // Delete furniture
    const handleDeleteFurniture = useCallback((placementId: string) => {
        setPlacements((current) => current.filter((p) => p.id !== placementId))
        setSelectedFurnitureId(null)
    }, [])

    useEffect(() => {
        let active = true
        const hydrate = async () => {
            try {
                const data = await fetchInteriorCatalog()
                if (!active) return
                setCatalog(data)
            } catch (err) {
                console.error('Failed to load interior catalog', err)
            }
        }
        void hydrate()
        return () => { active = false }
    }, [])

    const handleAddRoom = (preset: typeof ROOM_TYPES[0]) => {
        const newRoom: InteriorRoom = {
            id: generateId(),
            templateId: 'living-room' as RoomTemplateId,
            name: preset.name,
            level: 0,
            width: preset.width,
            length: preset.length,
            notes: '',
            floorColor: '#d4a574',
            wallColor: '#FAF9F6',
        }
        setRooms((current) => [...current, newRoom])
        setRoomDesigns((current) => ({ ...current, [newRoom.id]: { materialId: '', furnitureIds: [], lightingId: '' } }))
        setSelectedRoomId(newRoom.id)
    }

    // Check if two furniture items overlap (returns true if they collide)
    const checkCollision = (
        item1: { offsetX: number; offsetY: number; width: number; length: number },
        item2: { offsetX: number; offsetY: number; width: number; length: number },
        room: InteriorRoom
    ): boolean => {
        // Convert offset percentages to actual room positions
        const x1 = item1.offsetX * room.width
        const y1 = item1.offsetY * room.length
        const x2 = item2.offsetX * room.width
        const y2 = item2.offsetY * room.length
        
        // Half dimensions for collision box
        const hw1 = item1.width / 2
        const hl1 = item1.length / 2
        const hw2 = item2.width / 2
        const hl2 = item2.length / 2
        
        // Check AABB collision
        return Math.abs(x1 - x2) < (hw1 + hw2) && Math.abs(y1 - y2) < (hl1 + hl2)
    }

    // Check if furniture can be placed (no collisions except for allowed stackables)
    const canPlaceFurniture = (
        newFurnitureId: string, 
        newOffsetX: number, 
        newOffsetY: number,
        roomId: string,
        excludePlacementId?: string
    ): boolean => {
        const room = rooms.find(r => r.id === roomId)
        if (!room) return false
        
        const newFurniture = catalog.furniture.find(f => f.id === newFurnitureId)
        if (!newFurniture) return false
        
        // Stackable items (can be placed on/with other items)
        const stackableCategories = ['Decor', 'Lighting']
        const isNewStackable = stackableCategories.includes(newFurniture.category)
        
        // Small decor items that can go on tables/surfaces
        const isSmallDecor = newFurniture.category === 'Decor' && 
            (newFurniture.id.includes('lamp') || newFurniture.id.includes('vase') || 
             newFurniture.id.includes('plant') && newFurniture.height < 0.5)
        
        const existingPlacements = placements.filter(p => 
            p.roomId === roomId && p.id !== excludePlacementId
        )
        
        for (const placement of existingPlacements) {
            const existingFurniture = catalog.furniture.find(f => f.id === placement.furnitureId)
            if (!existingFurniture) continue
            
            const isExistingStackable = stackableCategories.includes(existingFurniture.category)
            
            // Skip collision check if both items are stackable or if placing small decor on surface
            if (isNewStackable && isExistingStackable) continue
            if (isSmallDecor && existingFurniture.category === 'Tables') continue
            
            // Check for collision
            const collision = checkCollision(
                { offsetX: newOffsetX, offsetY: newOffsetY, width: newFurniture.width, length: newFurniture.length },
                { offsetX: placement.offsetX, offsetY: placement.offsetY, width: existingFurniture.width, length: existingFurniture.length },
                room
            )
            
            if (collision) return false
        }
        
        return true
    }

    // Snap wall-mounted items (doors/windows/wall decor) to nearest wall - use exact wall positions
    const WALL_POSITION = 0.01; // Position on wall edge (1% from edge)
    const snapToWall = (offsetX: number, offsetY: number, furniture: FurnitureItem): { offsetX: number; offsetY: number; wallPosition: 'top' | 'bottom' | 'left' | 'right' } => {
        const isWallMounted = isWallMountedFurniture(furniture)
        if (!isWallMounted) {
            return { offsetX, offsetY, wallPosition: 'top' }
        }
        
        // Find nearest wall using explicit comparisons to handle ties properly
        const distTop = offsetY
        const distBottom = 1 - offsetY
        const distLeft = offsetX
        const distRight = 1 - offsetX
        
        // Compare horizontal (left/right) vs vertical (top/bottom) distances
        const minHorizontal = Math.min(distTop, distBottom)
        const minVertical = Math.min(distLeft, distRight)
        
        if (minHorizontal < minVertical) {
            // Closer to top or bottom wall
            if (distTop < distBottom) {
                return { offsetX: clamp(offsetX, 0.15, 0.85), offsetY: WALL_POSITION, wallPosition: 'top' }
            } else {
                return { offsetX: clamp(offsetX, 0.15, 0.85), offsetY: 1 - WALL_POSITION, wallPosition: 'bottom' }
            }
        } else {
            // Closer to left or right wall
            if (distLeft < distRight) {
                return { offsetX: WALL_POSITION, offsetY: clamp(offsetY, 0.15, 0.85), wallPosition: 'left' }
            } else {
                return { offsetX: 1 - WALL_POSITION, offsetY: clamp(offsetY, 0.15, 0.85), wallPosition: 'right' }
            }
        }
    }

    const handleAddFurnitureAt = (roomId: string, furnitureId: string, offsetX: number, offsetY: number) => {
        const furniture = catalog.furniture.find(f => f.id === furnitureId)
        const room = rooms.find(r => r.id === roomId)
        if (!furniture || !room) return
        
        // Snap wall-mounted items to walls
        let finalOffsetX = offsetX
        let finalOffsetY = offsetY
        
        if (isWallMountedFurniture(furniture)) {
            const snapped = snapToWall(offsetX, offsetY, furniture)
            finalOffsetX = snapped.offsetX
            finalOffsetY = snapped.offsetY
        } else {
            // For regular furniture, ensure it stays within room boundaries
            const halfWidthRatio = (furniture.width / 2) / room.width
            const halfLengthRatio = (furniture.length / 2) / room.length
            
            const minX = halfWidthRatio + 0.02
            const maxX = 1 - halfWidthRatio - 0.02
            const minY = halfLengthRatio + 0.02
            const maxY = 1 - halfLengthRatio - 0.02
            
            finalOffsetX = clamp(offsetX, minX, maxX)
            finalOffsetY = clamp(offsetY, minY, maxY)
        }
        
        // Check for collisions (skip for wall-mounted items as they're on walls)
        if (!isWallMountedFurniture(furniture) && !canPlaceFurniture(furnitureId, finalOffsetX, finalOffsetY, roomId)) {
            // Could show a toast/notification here
            console.log('Cannot place furniture - collision detected')
            return
        }
        
        setRoomDesigns((current) => ({
            ...current,
            [roomId]: current[roomId]
                ? { ...current[roomId], furnitureIds: [...(current[roomId].furnitureIds ?? []), furnitureId] }
                : { materialId: '', furnitureIds: [furnitureId], lightingId: '' },
        }))
        setPlacements((current) => ([...current, { id: generateId(), furnitureId, roomId, offsetX: finalOffsetX, offsetY: finalOffsetY, rotation: 0, scale: 1 }]))
    }

    return (
        <React.Fragment>
            <Head title="Interior Design Studio" />
            <div className="flex h-screen bg-slate-950 overflow-hidden">
                
                {/* Left Sidebar - Tools & Rooms */}
                <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
                    {/* Logo/Header */}
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all"
                                title="Back to Dashboard"
                            >
                                <Home className="w-5 h-5 text-white" />
                            </Link>
                            <div>
                                <h1 className="font-bold text-white">Interior Studio</h1>
                                <p className="text-xs text-slate-400">
                                    {currentProjectName || 'Design your space'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Room Types - Collapsible */}
                    <div className="border-b border-slate-800">
                        <button
                            onClick={() => setAddRoomExpanded(!addRoomExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                        >
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Room</h3>
                            <ChevronDown className={clsx(
                                'w-4 h-4 text-slate-400 transition-transform duration-200',
                                addRoomExpanded ? 'rotate-180' : ''
                            )} />
                        </button>
                        <div className={clsx(
                            'overflow-hidden transition-all duration-300',
                            addRoomExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        )}>
                            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                                {ROOM_TYPES.map((room) => (
                                    <button
                                        key={room.id}
                                        onClick={() => {
                                            handleAddRoom(room)
                                            setAddRoomExpanded(false) // Collapse after adding
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-orange-500/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-700 group-hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                                            <room.icon className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{room.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* When room is selected - Show Furniture & Room Settings */}
                    {selectedRoomId && rooms.find(r => r.id === selectedRoomId) && (() => {
                        const currentRoom = rooms.find(r => r.id === selectedRoomId)!
                        const RoomIcon = ROOM_TYPES.find(r => r.name === currentRoom.name)?.icon || Square
                        
                        const updateRoomSize = (field: 'width' | 'length', value: number) => {
                            const clampedValue = clamp(
                                value,
                                field === 'width' ? ROOM_SIZE_LIMITS.minWidth : ROOM_SIZE_LIMITS.minLength,
                                field === 'width' ? ROOM_SIZE_LIMITS.maxWidth : ROOM_SIZE_LIMITS.maxLength
                            )
                            setRooms(current => current.map(r => 
                                r.id === selectedRoomId ? { ...r, [field]: clampedValue } : r
                            ))
                        }
                        
                        return (
                            <div className="flex-1 overflow-y-auto">
                                {/* Current Room Header */}
                                <div className="p-4 border-b border-slate-800">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/20 border border-orange-500/50">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                            <RoomIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-orange-400">{currentRoom.name}</p>
                                            <p className="text-xs text-slate-400">{currentRoom.width}m × {currentRoom.length}m • {(currentRoom.width * currentRoom.length).toFixed(1)} m²</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setRooms(r => r.filter(x => x.id !== currentRoom.id))
                                                setPlacements(p => p.filter(x => x.roomId !== currentRoom.id))
                                                setSelectedRoomId(null)
                                                setAddRoomExpanded(true)
                                            }}
                                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Delete Room"
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Furniture Panel - Categorized */}
                                {catalog.furniture.length > 0 && (
                                    <div className="p-4 border-b border-slate-800">
                                        {/* Category Tabs */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {FURNITURE_CATEGORIES.map((cat) => {
                                                const count = catalog.furniture.filter(f => f.category === cat.id).length
                                                if (count === 0) return null
                                                const CatIcon = cat.icon
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setSelectedCategory(cat.id)}
                                                        className={clsx(
                                                            'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all',
                                                            selectedCategory === cat.id
                                                                ? 'bg-orange-500 text-white'
                                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                        )}
                                                    >
                                                        <CatIcon className="w-3 h-3" />
                                                        {cat.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        
                                        {/* Furniture Items */}
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {catalog.furniture
                                                .filter(f => f.category === selectedCategory)
                                                .map((item) => {
                                                    // Check if item fits in room
                                                    const fitsInRoom = item.width <= currentRoom.width && item.length <= currentRoom.length
                                                    const ItemIcon = getFurnitureIcon(item)
                                                    
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            draggable={fitsInRoom}
                                                            onDragStart={(e) => {
                                                                if (fitsInRoom) {
                                                                    e.dataTransfer.setData('application/furniture-id', item.id)
                                                                }
                                                            }}
                                                            className={clsx(
                                                                'flex items-center gap-3 p-2.5 rounded-lg border transition-all',
                                                                fitsInRoom
                                                                    ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 cursor-grab hover:border-orange-500/50 active:scale-[0.98]'
                                                                    : 'bg-red-950/20 border-red-900/30 cursor-not-allowed opacity-60'
                                                            )}
                                                            title={fitsInRoom ? `Drag to place • ${item.width}m × ${item.length}m` : `Too large for room (needs ${item.width}m × ${item.length}m)`}
                                                        >
                                                            {/* Furniture Image/Icon */}
                                                            <div className={clsx(
                                                                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden',
                                                                fitsInRoom ? 'bg-slate-700' : 'bg-red-900/30'
                                                            )}>
                                                                {item.image ? (
                                                                    <img 
                                                                        src={item.image} 
                                                                        alt={item.name}
                                                                        className={clsx(
                                                                            "w-full h-full",
                                                                            item.image.endsWith('.svg') ? 'object-contain p-1 bg-slate-100 rounded' : 'object-cover'
                                                                        )}
                                                                        onError={(e) => {
                                                                            // Fallback to icon if image fails
                                                                            e.currentTarget.style.display = 'none'
                                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <ItemIcon className={clsx(
                                                                    'w-5 h-5',
                                                                    fitsInRoom ? 'text-slate-300' : 'text-red-400',
                                                                    item.image ? 'hidden' : ''
                                                                )} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={clsx('text-xs font-medium truncate', fitsInRoom ? 'text-white' : 'text-red-300')}>
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500">
                                                                    {item.width}m × {item.length}m
                                                                    {!fitsInRoom && <span className="text-red-400 ml-1">• Too large</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-3 text-center">Drag items onto the canvas to place</p>
                                    </div>
                                )}
                                
                                {/* Room Size Controls - Compact */}
                                <div className="p-4">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Room Size</h4>
                                    <div className="space-y-3">
                                        {/* Width */}
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Width</label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateRoomSize('width', currentRoom.width - 0.5)}
                                                    disabled={currentRoom.width <= ROOM_SIZE_LIMITS.minWidth}
                                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    <Minus className="w-3 h-3 text-slate-400" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={currentRoom.width}
                                                    onChange={(e) => updateRoomSize('width', parseFloat(e.target.value) || ROOM_SIZE_LIMITS.minWidth)}
                                                    min={ROOM_SIZE_LIMITS.minWidth}
                                                    max={ROOM_SIZE_LIMITS.maxWidth}
                                                    step={0.5}
                                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:border-orange-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => updateRoomSize('width', currentRoom.width + 0.5)}
                                                    disabled={currentRoom.width >= ROOM_SIZE_LIMITS.maxWidth}
                                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    <Plus className="w-3 h-3 text-slate-400" />
                                                </button>
                                                <span className="text-xs text-slate-500">m</span>
                                            </div>
                                        </div>
                                        {/* Length */}
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Length</label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateRoomSize('length', currentRoom.length - 0.5)}
                                                    disabled={currentRoom.length <= ROOM_SIZE_LIMITS.minLength}
                                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    <Minus className="w-3 h-3 text-slate-400" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={currentRoom.length}
                                                    onChange={(e) => updateRoomSize('length', parseFloat(e.target.value) || ROOM_SIZE_LIMITS.minLength)}
                                                    min={ROOM_SIZE_LIMITS.minLength}
                                                    max={ROOM_SIZE_LIMITS.maxLength}
                                                    step={0.5}
                                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:border-orange-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => updateRoomSize('length', currentRoom.length + 0.5)}
                                                    disabled={currentRoom.length >= ROOM_SIZE_LIMITS.maxLength}
                                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    <Plus className="w-3 h-3 text-slate-400" />
                                                </button>
                                                <span className="text-xs text-slate-500">m</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-2">Min: {ROOM_SIZE_LIMITS.minWidth}m • Max: {ROOM_SIZE_LIMITS.maxWidth}m</p>
                                </div>
                                
                                {/* Room Colors */}
                                <div className="p-4 border-t border-slate-800">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Room Colors</h4>
                                    
                                    {/* Floor Color */}
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-500 mb-2 block">Floor</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {FLOOR_COLORS.map((fc) => (
                                                <button
                                                    key={fc.id}
                                                    onClick={() => setRooms(current => current.map(r => 
                                                        r.id === selectedRoomId ? { ...r, floorColor: fc.color } : r
                                                    ))}
                                                    className={clsx(
                                                        'w-7 h-7 rounded-lg border-2 transition-all hover:scale-110',
                                                        currentRoom.floorColor === fc.color 
                                                            ? 'border-orange-500 ring-2 ring-orange-500/30' 
                                                            : 'border-slate-600 hover:border-slate-500'
                                                    )}
                                                    style={{ backgroundColor: fc.color }}
                                                    title={fc.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Wall Color */}
                                    <div>
                                        <label className="text-xs text-slate-500 mb-2 block">Walls</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {WALL_COLORS.map((wc) => (
                                                <button
                                                    key={wc.id}
                                                    onClick={() => setRooms(current => current.map(r => 
                                                        r.id === selectedRoomId ? { ...r, wallColor: wc.color } : r
                                                    ))}
                                                    className={clsx(
                                                        'w-7 h-7 rounded-lg border-2 transition-all hover:scale-110',
                                                        currentRoom.wallColor === wc.color 
                                                            ? 'border-orange-500 ring-2 ring-orange-500/30' 
                                                            : 'border-slate-600 hover:border-slate-500'
                                                    )}
                                                    style={{ backgroundColor: wc.color }}
                                                    title={wc.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                    
                    {/* Empty state when no room selected */}
                    {!selectedRoomId && (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-800 flex items-center justify-center">
                                    <LayoutGrid className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="text-sm text-slate-500">No room selected</p>
                                <p className="text-xs text-slate-600 mt-1">Add a room type above to start</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                        {/* Left: View Mode Toggle + Project Name */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1">
                                <button 
                                    onClick={() => setViewMode('2d')} 
                                    className={clsx(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        viewMode === '2d' 
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                                            : 'text-slate-400 hover:text-white'
                                    )}
                                >
                                    2D View
                                </button>
                                <button 
                                    onClick={() => setViewMode('3d')} 
                                    className={clsx(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        viewMode === '3d' 
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                                            : 'text-slate-400 hover:text-white'
                                    )}
                                >
                                    3D View
                                </button>
                            </div>
                            
                            {/* Project Name */}
                            {currentProjectName && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <span className="text-sm text-slate-300">{currentProjectName}</span>
                                    {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-orange-500" title="Unsaved changes" />}
                                </div>
                            )}
                        </div>

                        {/* Right: Project Actions + Zoom */}
                        <div className="flex items-center gap-3">
                            {/* New Project */}
                            <button
                                onClick={handleNewProject}
                                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                                title="New Project"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden lg:inline">New</span>
                            </button>
                            
                            {/* My Projects */}
                            <button
                                onClick={() => { setShowMyProjects(true); loadMyProjects() }}
                                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                                title="My Projects"
                            >
                                <FolderOpen className="w-4 h-4" />
                                <span className="hidden lg:inline">My Projects</span>
                            </button>
                            
                            {/* Save */}
                            <button
                                onClick={() => currentProjectId ? handleSaveProject(currentProjectName) : setShowSaveModal(true)}
                                disabled={isSaving || rooms.length === 0}
                                className={clsx(
                                    'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                                    saveSuccess 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                                title={currentProjectId ? 'Save Changes' : 'Save Project'}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : saveSuccess ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span className="hidden lg:inline">{saveSuccess ? 'Saved!' : currentProjectId ? 'Save' : 'Save As'}</span>
                            </button>
                            
                            {/* Download Plans */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                                    title="Download Plans"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden lg:inline">Download Plans</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                
                                {showExportMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 overflow-hidden">
                                        <button
                                            onClick={handleExportJSON}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-left transition-colors"
                                        >
                                            <FileJson className="w-4 h-4 text-blue-400" />
                                            <div>
                                                <p className="text-sm text-white">Project Data (JSON)</p>
                                                <p className="text-xs text-slate-400">Save for later editing</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleExportPNG}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-left transition-colors border-t border-slate-700"
                                        >
                                            <ImageIcon className="w-4 h-4 text-green-400" />
                                            <div>
                                                <p className="text-sm text-white">Image (PNG)</p>
                                                <p className="text-xs text-slate-400">2D Floor Plan Image</p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-px h-6 bg-slate-700" />
                            
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setZoom(z => Math.max(50, z - 10))} 
                                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-4 h-4 text-slate-400" />
                                </button>
                                <span className="text-sm font-medium text-slate-300 w-12 text-center">{zoom}%</span>
                                <button 
                                    onClick={() => setZoom(z => Math.min(200, z + 10))} 
                                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 relative" ref={canvasRef}>
                        {viewMode === '2d' ? (
                            <GridCanvas
                                room={rooms.find(r => r.id === selectedRoomId) || null}
                                placements={placements.filter(p => p.roomId === selectedRoomId)}
                                onAddFurnitureAt={handleAddFurnitureAt}
                                zoom={zoom}
                                catalog={catalog}
                                selectedFurnitureId={selectedFurnitureId}
                                onSelectFurniture={setSelectedFurnitureId}
                                onMoveFurniture={handleMoveFurniture}
                                onRotateFurniture={handleRotateFurniture}
                                onDeleteFurniture={handleDeleteFurniture}
                            />
                        ) : (
                            <ThreeViewport 
                                room={rooms.find(r => r.id === selectedRoomId) || null} 
                                placements={placements.filter(p => p.roomId === selectedRoomId)}
                                catalog={catalog}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Save Project Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md mx-4 shadow-2xl">
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Save Project</h2>
                                <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.currentTarget)
                            handleSaveProject(formData.get('name') as string, formData.get('description') as string)
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Project Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    defaultValue={currentProjectName}
                                    placeholder="My Interior Design"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description (optional)</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    placeholder="Add notes about your design..."
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="pt-2">
                                <p className="text-sm text-slate-400 mb-4">
                                    This project includes {rooms.length} room{rooms.length !== 1 ? 's' : ''} and {placements.length} furniture item{placements.length !== 1 ? 's' : ''}.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowSaveModal(false)}
                                        className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Project
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* My Projects Modal */}
            {showMyProjects && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-3xl mx-4 shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-slate-800 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">My Projects</h2>
                                    <p className="text-sm text-slate-400 mt-1">Load, edit, or delete your saved designs</p>
                                </div>
                                <button onClick={() => setShowMyProjects(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                </div>
                            ) : myProjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-300">No Projects Yet</h3>
                                    <p className="text-sm text-slate-500 mt-2">Create a design and save it to see it here.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {myProjects.map(proj => (
                                        <div key={proj.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-all">
                                            <div className="flex items-start gap-4">
                                                <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Home className="w-8 h-8 text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate">{proj.name}</h3>
                                                    {proj.description && (
                                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                        <span>{proj.rooms?.length || 0} room{(proj.rooms?.length || 0) !== 1 ? 's' : ''}</span>
                                                        <span>•</span>
                                                        <span>{proj.placements?.length || 0} items</span>
                                                        <span>•</span>
                                                        <span>Updated {new Date(proj.updated_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleLoadProject(proj)}
                                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Open
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicateProject(proj.id)}
                                                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(proj.id)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close export menu */}
            {showExportMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
            )}
        </React.Fragment>
    );
}

function GridCanvas({ room, placements, onAddFurnitureAt, zoom, catalog, selectedFurnitureId, onSelectFurniture, onMoveFurniture, onRotateFurniture, onDeleteFurniture }: {
    room: InteriorRoom | null
    placements: FurniturePlacement[]
    onAddFurnitureAt: (roomId: string, furnitureId: string, offsetX: number, offsetY: number) => void
    zoom: number
    catalog: InteriorCatalog
    selectedFurnitureId: string | null
    onSelectFurniture: (id: string | null) => void
    onMoveFurniture: (placementId: string, newOffsetX: number, newOffsetY: number) => void
    onRotateFurniture: (placementId: string) => void
    onDeleteFurniture: (placementId: string) => void
}) {
    const canvasRef = useRef<HTMLDivElement>(null)
    const [draggingFurniture, setDraggingFurniture] = useState<{ id: string; startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null)

    // Calculate room dimensions for centered display
    const scale = zoom / 100
    const pixelsPerMeter = 80 * scale // Larger scale for single room view
    const roomWidth = room ? room.width * pixelsPerMeter : 0
    const roomHeight = room ? room.length * pixelsPerMeter : 0

    const onDragOver = (e: React.DragEvent) => e.preventDefault()
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (!room || !canvasRef.current) return
        const furnitureId = e.dataTransfer.getData('application/furniture-id')
        if (!furnitureId) return
        
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const roomElement = canvasRef.current.querySelector('[data-room]') as HTMLElement
        if (!roomElement) return
        
        const roomRect = roomElement.getBoundingClientRect()
        const relX = e.clientX - roomRect.left
        const relY = e.clientY - roomRect.top
        
        // Check if drop is within room bounds (allow some overflow for edge dropping)
        if (relX < -20 || relX > roomRect.width + 20 || relY < -20 || relY > roomRect.height + 20) return
        
        // Allow dropping closer to edges (0.02 to 0.98) for better wall item placement
        const offsetX = clamp(relX / roomRect.width, 0.02, 0.98)
        const offsetY = clamp(relY / roomRect.height, 0.02, 0.98)
        onAddFurnitureAt(room.id, furnitureId, offsetX, offsetY)
    }

    // Handle mouse move for dragging furniture
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!draggingFurniture || !room) return
        const placement = placements.find(p => p.id === draggingFurniture.id)
        if (!placement) return
        
        const furniture = catalog.furniture.find(f => f.id === placement.furnitureId)

        const deltaX = e.clientX - draggingFurniture.startX
        const deltaY = e.clientY - draggingFurniture.startY
        const deltaOffsetX = deltaX / roomWidth
        const deltaOffsetY = deltaY / roomHeight

        let newOffsetX = draggingFurniture.startOffsetX + deltaOffsetX
        let newOffsetY = draggingFurniture.startOffsetY + deltaOffsetY
        
        // For wall-mounted items, snap to nearest wall
        const isWallMounted = isWallMountedFurniture(furniture)
        if (isWallMounted) {
            const WALL_POSITION = 0.01
            // Determine nearest wall using strict less-than comparisons
            const distTop = newOffsetY
            const distBottom = 1 - newOffsetY
            const distLeft = newOffsetX
            const distRight = 1 - newOffsetX
            
            const minHorizontal = Math.min(distTop, distBottom)
            const minVertical = Math.min(distLeft, distRight)
            
            if (minHorizontal < minVertical) {
                // Snap to top or bottom wall
                if (distTop < distBottom) {
                    newOffsetY = WALL_POSITION
                    newOffsetX = clamp(newOffsetX, 0.15, 0.85)
                } else {
                    newOffsetY = 1 - WALL_POSITION
                    newOffsetX = clamp(newOffsetX, 0.15, 0.85)
                }
            } else {
                // Snap to left or right wall
                if (distLeft < distRight) {
                    newOffsetX = WALL_POSITION
                    newOffsetY = clamp(newOffsetY, 0.15, 0.85)
                } else {
                    newOffsetX = 1 - WALL_POSITION
                    newOffsetY = clamp(newOffsetY, 0.15, 0.85)
                }
            }
        }

        onMoveFurniture(draggingFurniture.id, newOffsetX, newOffsetY)
    }, [draggingFurniture, placements, room, roomWidth, roomHeight, onMoveFurniture, catalog])

    const handleMouseUp = useCallback(() => {
        setDraggingFurniture(null)
    }, [])

    // Start dragging furniture
    const startDragFurniture = (e: React.MouseEvent, placement: FurniturePlacement) => {
        e.stopPropagation()
        onSelectFurniture(placement.id)
        setDraggingFurniture({
            id: placement.id,
            startX: e.clientX,
            startY: e.clientY,
            startOffsetX: placement.offsetX,
            startOffsetY: placement.offsetY
        })
    }

    // Click canvas to deselect
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.roomArea) {
            onSelectFurniture(null)
        }
    }

    return (
        <div 
            className="w-full h-full relative overflow-hidden select-none bg-slate-900" 
            style={{ cursor: draggingFurniture ? 'grabbing' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-20"
                style={{ 
                    backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />
            
            <div ref={canvasRef} onDragOver={onDragOver} onDrop={onDrop} onClick={handleCanvasClick} className="absolute inset-0 flex items-center justify-center">
                {room ? (
                    <div className="relative">
                        {/* Room Container - Centered */}
                        <div 
                            data-room
                            className="relative transition-all duration-300 overflow-visible"
                            style={{ 
                                width: roomWidth, 
                                height: roomHeight, 
                                backgroundColor: room.floorColor || '#d4a574',
                                border: `4px solid ${room.wallColor || '#FAF9F6'}`,
                                borderRadius: '4px',
                                boxShadow: '0 0 60px rgba(249, 115, 22, 0.3), inset 0 0 30px rgba(0,0,0,0.1)' 
                            }}
                        >
                            {/* Wood grain pattern (only for wood-like colors) */}
                            {(room.floorColor || '#d4a574').match(/#[89abcd]/i) && (
                                <div 
                                    className="absolute inset-0 opacity-30"
                                    style={{
                                        background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(139,90,43,0.3) 8px, rgba(139,90,43,0.3) 10px)'
                                    }}
                                />
                            )}

                            {/* Furniture Items */}
                            {placements.map(p => {
                                const furniture = catalog.furniture.find(f => f.id === p.furnitureId)
                                const isSelectedFurniture = selectedFurnitureId === p.id
                                const isDragging = draggingFurniture?.id === p.id
                                const FurnitureIcon = furniture ? getFurnitureIcon(furniture) : Armchair
                                const isDoorOrWindow = furniture?.category === 'Doors'
                                const isWallMountedOnly = furniture && isWallMountedFurniture(furniture) && !isDoorOrWindow
                                const isWindow = furniture?.name.toLowerCase().includes('window') || furniture?.name.toLowerCase().includes('skylight')
                                const isDoor = isDoorOrWindow && !isWindow
                                
                                // Calculate furniture size on canvas (proportional to room)
                                const furnitureWidth = furniture ? (furniture.width / room.width) * roomWidth : 48
                                const furnitureHeight = furniture ? (furniture.length / room.length) * roomHeight : 48
                                const minSize = 32
                                const maxSize = 120
                                const displayWidth = Math.min(maxSize, Math.max(minSize, furnitureWidth))
                                const displayHeight = Math.min(maxSize, Math.max(minSize, furnitureHeight))
                                
                                // For doors/windows - snap to nearest wall edge
                                let posX = p.offsetX * 100
                                let posY = p.offsetY * 100
                                let wallPosition: 'top' | 'bottom' | 'left' | 'right' | null = null
                                
                                // Door swing direction: rotation 0 = opens inward, rotation 180 = opens outward
                                const opensInward = (p.rotation || 0) === 0
                                
                                if (isDoorOrWindow) {
                                    // Determine which wall based on stored offset (already snapped)
                                    // Use threshold of 0.05 to detect wall position
                                    const nearTop = p.offsetY <= 0.05
                                    const nearBottom = p.offsetY >= 0.95
                                    const nearLeft = p.offsetX <= 0.05
                                    const nearRight = p.offsetX >= 0.95
                                    
                                    if (nearTop) {
                                        wallPosition = 'top'
                                        posY = 0
                                    } else if (nearBottom) {
                                        wallPosition = 'bottom'
                                        posY = 100
                                    } else if (nearLeft) {
                                        wallPosition = 'left'
                                        posX = 0
                                    } else if (nearRight) {
                                        wallPosition = 'right'
                                        posX = 100
                                    } else {
                                        // Fallback: calculate nearest wall
                                        const distTop = p.offsetY
                                        const distBottom = 1 - p.offsetY
                                        const distLeft = p.offsetX
                                        const distRight = 1 - p.offsetX
                                        const minVertical = Math.min(distLeft, distRight)
                                        const minHorizontal = Math.min(distTop, distBottom)
                                        
                                        if (minVertical <= minHorizontal) {
                                            if (distLeft <= distRight) {
                                                wallPosition = 'left'
                                                posX = 0
                                            } else {
                                                wallPosition = 'right'
                                                posX = 100
                                            }
                                        } else {
                                            if (distTop <= distBottom) {
                                                wallPosition = 'top'
                                                posY = 0
                                            } else {
                                                wallPosition = 'bottom'
                                                posY = 100
                                            }
                                        }
                                    }
                                }
                                
                                // Door/window dimensions based on wall orientation
                                const isHorizontalWall = wallPosition === 'top' || wallPosition === 'bottom'
                                // Door width in pixels (proportional to actual size)
                                const doorWidthPx = furniture ? (furniture.width / room.width) * roomWidth : 60
                                const clampedDoorWidth = Math.min(100, Math.max(50, doorWidthPx))
                                
                                // Simplified positioning: doors/windows sit centered on the wall
                                let anchorX = '50%'
                                let anchorY = '50%'
                                let offsetStyle: React.CSSProperties = {}
                                
                                if (isDoorOrWindow) {
                                    if (wallPosition === 'top') {
                                        anchorX = '50%'
                                        anchorY = '0%'
                                        // For doors opening inward, show arc inside room
                                        offsetStyle = { 
                                            marginTop: isDoor ? (opensInward ? -4 : -clampedDoorWidth + 4) : -8
                                        }
                                    } else if (wallPosition === 'bottom') {
                                        anchorX = '50%'
                                        anchorY = '100%'
                                        offsetStyle = { 
                                            marginTop: isDoor ? (opensInward ? -clampedDoorWidth + 4 : -4) : -8
                                        }
                                    } else if (wallPosition === 'left') {
                                        anchorX = '0%'
                                        anchorY = '50%'
                                        offsetStyle = { 
                                            marginLeft: isDoor ? (opensInward ? -4 : -clampedDoorWidth + 4) : -8
                                        }
                                    } else if (wallPosition === 'right') {
                                        anchorX = '100%'
                                        anchorY = '50%'
                                        offsetStyle = { 
                                            marginLeft: isDoor ? (opensInward ? -clampedDoorWidth + 4 : -4) : -8
                                        }
                                    }
                                }
                                
                                return (
                                    <div 
                                        key={p.id} 
                                        className={clsx(
                                            'absolute group transition-all duration-150',
                                            isSelectedFurniture ? 'z-20' : 'z-10',
                                            isDragging ? 'scale-105' : ''
                                        )}
                                        style={{ 
                                            left: `${posX}%`, 
                                            top: `${posY}%`,
                                            transform: isDoorOrWindow 
                                                ? `translate(-${anchorX}, -${anchorY})`
                                                : `translate(-50%, -50%) rotate(${p.rotation || 0}deg)`,
                                            ...offsetStyle
                                        }}
                                    >
                                        {/* Door/Window - Realistic Architectural floor plan rendering */}
                                        {isDoorOrWindow ? (
                                            <div
                                                onMouseDown={(e) => startDragFurniture(e, p)}
                                                onClick={(e) => { e.stopPropagation(); onSelectFurniture(p.id); }}
                                                className={clsx(
                                                    'relative cursor-grab active:cursor-grabbing transition-all duration-200',
                                                    isSelectedFurniture && 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                                                )}
                                                title={`${furniture?.name || 'Door/Window'} (${furniture?.width}m) - ${isDoor ? (opensInward ? 'Opens Inward' : 'Opens Outward') : ''}`}
                                            >
                                                {/* Door - Professional Architectural Symbol with clear open direction */}
                                                {isDoor && (
                                                    <svg
                                                        width={clampedDoorWidth}
                                                        height={clampedDoorWidth}
                                                        viewBox="0 0 100 100"
                                                        className={clsx(
                                                            isSelectedFurniture ? 'opacity-100' : 'opacity-95'
                                                        )}
                                                        style={{
                                                            transform: (() => {
                                                                let baseRotation = wallPosition === 'top' ? 0 :
                                                                                   wallPosition === 'bottom' ? 180 :
                                                                                   wallPosition === 'left' ? -90 : 90
                                                                return `rotate(${baseRotation}deg)`
                                                            })()
                                                        }}
                                                    >
                                                        {/* Wall sections on either side of door opening */}
                                                        <rect x="0" y="0" width="10" height="14" fill={room.wallColor || '#FAF9F6'} stroke="#1f2937" strokeWidth="2" />
                                                        <rect x="90" y="0" width="10" height="14" fill={room.wallColor || '#FAF9F6'} stroke="#1f2937" strokeWidth="2" />
                                                        
                                                        {/* Door opening (gap in wall) */}
                                                        <rect x="10" y="0" width="80" height="14" fill={opensInward ? (room.floorColor || '#d4a574') : '#e5e7eb'} />
                                                        
                                                        {/* Door frame/jamb lines */}
                                                        <line x1="10" y1="0" x2="10" y2="14" stroke="#374151" strokeWidth="2.5" />
                                                        <line x1="90" y1="0" x2="90" y2="14" stroke="#374151" strokeWidth="2.5" />
                                                        
                                                        {/* Door panel in closed position (on the wall line) */}
                                                        <rect x="12" y="3" width="76" height="8" fill="#8B5A2B" stroke="#5D3A1A" strokeWidth="1.5" rx="1" />
                                                        
                                                        {/* Door panel details */}
                                                        <rect x="18" y="4.5" width="28" height="5" fill="none" stroke="#6B4423" strokeWidth="0.8" rx="0.5" />
                                                        <rect x="54" y="4.5" width="28" height="5" fill="none" stroke="#6B4423" strokeWidth="0.8" rx="0.5" />
                                                        
                                                        {/* Hinge side indicator (always on left) */}
                                                        <rect x="14" y="4" width="2.5" height="2.5" fill="#4B5563" rx="0.5" />
                                                        <rect x="14" y="7.5" width="2.5" height="2.5" fill="#4B5563" rx="0.5" />
                                                        
                                                        {/* Door handle (always on right side of door) */}
                                                        <circle cx="82" cy="7" r="2.5" fill="#D4AF37" stroke="#B8860B" strokeWidth="0.5" />
                                                        
                                                        {opensInward ? (
                                                            <>
                                                                {/* INWARD: Door swings INTO the room (arc goes down/into room) */}
                                                                <path
                                                                    d="M 12 14 A 76 76 0 0 0 88 90"
                                                                    fill="none"
                                                                    stroke="#059669"
                                                                    strokeWidth="2"
                                                                    strokeDasharray="6,4"
                                                                    opacity="0.8"
                                                                />
                                                                
                                                                {/* Door in open position (ghost) - swung into room */}
                                                                <rect 
                                                                    x="12" y="14" 
                                                                    width="8" height="76" 
                                                                    fill="#8B5A2B" 
                                                                    opacity="0.3" 
                                                                    stroke="#5D3A1A" 
                                                                    strokeWidth="1"
                                                                    rx="1"
                                                                />
                                                                
                                                                {/* Direction arrow pointing INTO room */}
                                                                <polygon points="50,50 60,45 60,55" fill="#059669" opacity="0.7" />
                                                                
                                                                {/* Label */}
                                                                <text x="50" y="85" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold" opacity="0.8">IN</text>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* OUTWARD: Door swings OUT of the room (arc goes up/outside) */}
                                                                <path
                                                                    d="M 12 0 A 76 76 0 0 1 88 -76"
                                                                    fill="none"
                                                                    stroke="#dc2626"
                                                                    strokeWidth="2"
                                                                    strokeDasharray="6,4"
                                                                    opacity="0.8"
                                                                    transform="translate(0, 14)"
                                                                />
                                                                
                                                                {/* Door in open position (ghost) - swung outside */}
                                                                <rect 
                                                                    x="12" y="-62" 
                                                                    width="8" height="76" 
                                                                    fill="#8B5A2B" 
                                                                    opacity="0.3" 
                                                                    stroke="#5D3A1A" 
                                                                    strokeWidth="1"
                                                                    rx="1"
                                                                />
                                                                
                                                                {/* Direction arrow pointing OUT of room */}
                                                                <polygon points="50,-30 60,-35 60,-25" fill="#dc2626" opacity="0.7" />
                                                                
                                                                {/* Label */}
                                                                <text x="50" y="-45" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold" opacity="0.8">OUT</text>
                                                            </>
                                                        )}
                                                    </svg>
                                                )}
                                                
                                                {/* Window - Professional Architectural Symbol */}
                                                {isWindow && (
                                                    <svg
                                                        width={isHorizontalWall ? clampedDoorWidth : 16}
                                                        height={isHorizontalWall ? 16 : clampedDoorWidth}
                                                        viewBox={isHorizontalWall ? "0 0 100 16" : "0 0 16 100"}
                                                        className={clsx(
                                                            isSelectedFurniture ? 'opacity-100' : 'opacity-95'
                                                        )}
                                                    >
                                                        {isHorizontalWall ? (
                                                            <>
                                                                {/* Wall sections on sides */}
                                                                <rect x="0" y="0" width="6" height="16" fill={room.wallColor || '#FAF9F6'} stroke="#1f2937" strokeWidth="1" />
                                                                <rect x="94" y="0" width="6" height="16" fill={room.wallColor || '#FAF9F6'} stroke="#1f2937" strokeWidth="1" />
                                                                
                                                                {/* Window frame - outer */}
                                                                <rect x="6" y="1" width="88" height="14" fill="#f8fafc" stroke="#374151" strokeWidth="1.5" />
                                                                
                                                                {/* Window sill (bottom) */}
                                                                <rect x="4" y="13" width="92" height="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                                                                
                                                                {/* Glass panes with realistic appearance */}
                                                                <rect x="8" y="2.5" width="40" height="10" fill="#bfdbfe" stroke="#64748b" strokeWidth="1" opacity="0.8" />
                                                                <rect x="52" y="2.5" width="40" height="10" fill="#bfdbfe" stroke="#64748b" strokeWidth="1" opacity="0.8" />
                                                                
                                                                {/* Glass reflection effect */}
                                                                <line x1="12" y1="3.5" x2="20" y2="3.5" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                                                                <line x1="56" y1="3.5" x2="64" y2="3.5" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                                                                
                                                                {/* Center mullion/divider */}
                                                                <rect x="48" y="1" width="4" height="14" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.8" />
                                                                
                                                                {/* Horizontal glazing bars */}
                                                                <line x1="8" y1="7.5" x2="48" y2="7.5" stroke="#94a3b8" strokeWidth="1" />
                                                                <line x1="52" y1="7.5" x2="92" y2="7.5" stroke="#94a3b8" strokeWidth="1" />
                                                                
                                                                {/* Window latch/handle */}
                                                                <rect x="46" y="6" width="8" height="3" fill="#d4af37" stroke="#b8860b" strokeWidth="0.3" rx="0.5" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* Wall sections on sides */}
                                                                <rect x="0" y="0" width="16" height="6" fill={room.wallColor || '#FAF9F6'} stroke="#1f2937" strokeWidth="1" />
                                                                <rect x="0" y="94" width="16" height="6" fill={room.wallColor || '#FAF9F6'} stroke="#1f2937" strokeWidth="1" />
                                                                
                                                                {/* Window frame - outer */}
                                                                <rect x="1" y="6" width="14" height="88" fill="#f8fafc" stroke="#374151" strokeWidth="1.5" />
                                                                
                                                                {/* Window sill */}
                                                                <rect x="0" y="4" width="3" height="92" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                                                                
                                                                {/* Glass panes */}
                                                                <rect x="2.5" y="8" width="10" height="40" fill="#bfdbfe" stroke="#64748b" strokeWidth="1" opacity="0.8" />
                                                                <rect x="2.5" y="52" width="10" height="40" fill="#bfdbfe" stroke="#64748b" strokeWidth="1" opacity="0.8" />
                                                                
                                                                {/* Glass reflection */}
                                                                <line x1="3.5" y1="12" x2="3.5" y2="20" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                                                                <line x1="3.5" y1="56" x2="3.5" y2="64" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                                                                
                                                                {/* Center mullion */}
                                                                <rect x="1" y="48" width="14" height="4" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.8" />
                                                                
                                                                {/* Vertical glazing bars */}
                                                                <line x1="7.5" y1="8" x2="7.5" y2="48" stroke="#94a3b8" strokeWidth="1" />
                                                                <line x1="7.5" y1="52" x2="7.5" y2="92" stroke="#94a3b8" strokeWidth="1" />
                                                                
                                                                {/* Window latch */}
                                                                <rect x="6" y="46" width="3" height="8" fill="#d4af37" stroke="#b8860b" strokeWidth="0.3" rx="0.5" />
                                                            </>
                                                        )}
                                                    </svg>
                                                )}
                                            </div>
                                        ) : (
                                            /* Regular Furniture Item - with Image support */
                                            <div
                                                onMouseDown={(e) => startDragFurniture(e, p)}
                                                onClick={(e) => { e.stopPropagation(); onSelectFurniture(p.id); }}
                                                className={clsx(
                                                    'rounded-lg shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden',
                                                    isSelectedFurniture 
                                                        ? 'ring-4 ring-orange-300 ring-opacity-50 shadow-orange-300/50 shadow-xl' 
                                                        : 'hover:scale-105',
                                                    !furniture?.image && (isSelectedFurniture ? 'bg-orange-500' : 'bg-amber-600 hover:bg-amber-500'),
                                                    furniture?.image?.endsWith('.svg') && 'bg-slate-100'
                                                )}
                                                style={{ 
                                                    width: displayWidth, 
                                                    height: displayHeight,
                                                }}
                                                title={`${furniture?.name || 'Furniture'} (${furniture?.width}m × ${furniture?.length}m)`}
                                            >
                                                {/* Show image if available */}
                                                {furniture?.image ? (
                                                    <img 
                                                        src={furniture.image} 
                                                        alt={furniture.name}
                                                        className={clsx(
                                                            "w-full h-full",
                                                            furniture.image.endsWith('.svg') ? 'object-contain p-1' : 'object-cover'
                                                        )}
                                                        draggable={false}
                                                    />
                                                ) : (
                                                    <FurnitureIcon className={clsx(
                                                        'w-6 h-6',
                                                        isSelectedFurniture ? 'text-white' : 'text-amber-100'
                                                    )} />
                                                )}
                                                {/* Selection overlay for images */}
                                                {furniture?.image && isSelectedFurniture && (
                                                    <div className="absolute inset-0 bg-orange-500/30 rounded-md pointer-events-none" />
                                                )}
                                            </div>
                                        )}

                                        {/* Controls - shown when selected */}
                                        {isSelectedFurniture && !isDragging && (
                                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-1.5 animate-in fade-in zoom-in duration-200">
                                                {/* Rotate button for furniture, Flip button for doors */}
                                                {isDoor && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onRotateFurniture(p.id); }}
                                                        className="p-2 hover:bg-slate-700 rounded-md transition-colors" 
                                                        title={opensInward ? "Flip to Open Outward" : "Flip to Open Inward"}
                                                    >
                                                        <RotateCw className="w-4 h-4 text-slate-300" />
                                                    </button>
                                                )}
                                                {!isDoorOrWindow && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onRotateFurniture(p.id); }}
                                                        className="p-2 hover:bg-slate-700 rounded-md transition-colors" 
                                                        title="Rotate 45°"
                                                    >
                                                        <RotateCw className="w-4 h-4 text-slate-300" />
                                                    </button>
                                                )}
                                                <button
                                                    className="p-2 hover:bg-slate-700 rounded-md transition-colors cursor-move" 
                                                    title="Drag to move"
                                                >
                                                    <Move className="w-4 h-4 text-slate-300" />
                                                </button>
                                                <div className="w-px h-6 bg-slate-600" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteFurniture(p.id); }}
                                                    className="p-2 hover:bg-red-500/20 rounded-md transition-colors" 
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Door flip indicator */}
                                        {isSelectedFurniture && isDoor && (
                                            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-orange-400 px-2 py-1 rounded border border-slate-700">
                                                {opensInward ? 'Opens Inward' : 'Opens Outward'}
                                            </div>
                                        )}

                                        {/* Rotation indicator - only for non-door/window */}
                                        {isSelectedFurniture && !isDoorOrWindow && (p.rotation || 0) !== 0 && (
                                            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-orange-400 px-2 py-1 rounded border border-slate-700">
                                                {p.rotation}°
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Dimension Labels */}
                        <div className="absolute -top-10 left-0 right-0 flex justify-center">
                            <span className="text-sm text-orange-400 bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-700 font-medium">{room.width.toFixed(1)} m</span>
                        </div>
                        <div className="absolute top-0 bottom-0 -right-12 flex items-center" style={{ writingMode: 'vertical-rl' }}>
                            <span className="text-sm text-orange-400 bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-700 font-medium">{room.length.toFixed(1)} m</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                            <Home className="w-12 h-12 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Design Your Dream Space</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">Add a room from the sidebar to start creating your interior design. Drag and drop furniture to customize your space.</p>
                        <div className="flex justify-center gap-4">
                            {ROOM_TYPES.slice(0, 3).map((room) => (
                                <div key={room.id} className="flex flex-col items-center gap-2 px-5 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <room.icon className="w-6 h-6 text-slate-500" />
                                    <span className="text-xs text-slate-400">{room.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// 3D Furniture Components
interface Furniture3DProps {
    furniture: FurnitureItem;
    position: [number, number, number];
    rotation: number;
}

// Sofa 3D Component
function Sofa3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    const seatHeight = 0.4;
    const backHeight = 0.4;
    const armWidth = 0.12;
    const cushionColor = furniture.color;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Base/Seat */}
            <mesh position={[0, seatHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, seatHeight, d]} />
                <meshStandardMaterial color={furniture.color} roughness={0.8} />
            </mesh>
            {/* Back rest */}
            <mesh position={[0, seatHeight + backHeight / 2, -d / 2 + 0.08]} castShadow receiveShadow>
                <boxGeometry args={[w - 0.04, backHeight, 0.15]} />
                <meshStandardMaterial color={furniture.color} roughness={0.8} />
            </mesh>
            {/* Left arm */}
            <mesh position={[-w / 2 + armWidth / 2, seatHeight + 0.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[armWidth, 0.2, d - 0.1]} />
                <meshStandardMaterial color={furniture.color} roughness={0.8} />
            </mesh>
            {/* Right arm */}
            <mesh position={[w / 2 - armWidth / 2, seatHeight + 0.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[armWidth, 0.2, d - 0.1]} />
                <meshStandardMaterial color={furniture.color} roughness={0.8} />
            </mesh>
            {/* Seat cushions */}
            <mesh position={[0, seatHeight + 0.06, 0.02]} castShadow>
                <boxGeometry args={[w - armWidth * 2 - 0.08, 0.1, d - 0.2]} />
                <meshStandardMaterial color={cushionColor} roughness={0.9} />
            </mesh>
            {/* Back cushions */}
            <mesh position={[0, seatHeight + 0.18, -d / 2 + 0.18]} castShadow>
                <boxGeometry args={[w - armWidth * 2 - 0.1, 0.25, 0.12]} />
                <meshStandardMaterial color={cushionColor} roughness={0.9} />
            </mesh>
        </group>
    );
}

// Chair 3D Component
function Chair3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const seatHeight = 0.45;
    const legHeight = 0.42;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Legs */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
                <mesh key={i} position={[x * (w / 2 - 0.04), legHeight / 2, z * (d / 2 - 0.04)]} castShadow>
                    <cylinderGeometry args={[0.02, 0.025, legHeight, 8]} />
                    <meshStandardMaterial color="#78350f" roughness={0.6} />
                </mesh>
            ))}
            {/* Seat */}
            <mesh position={[0, seatHeight, 0]} castShadow receiveShadow>
                <boxGeometry args={[w - 0.02, 0.06, d - 0.02]} />
                <meshStandardMaterial color={furniture.color} roughness={0.7} />
            </mesh>
            {/* Back */}
            <mesh position={[0, seatHeight + 0.22, -d / 2 + 0.03]} castShadow receiveShadow>
                <boxGeometry args={[w - 0.06, 0.4, 0.04]} />
                <meshStandardMaterial color={furniture.color} roughness={0.7} />
            </mesh>
        </group>
    );
}

// Bed 3D Component  
function Bed3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const frameHeight = 0.3;
    const mattressHeight = 0.2;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Frame base */}
            <mesh position={[0, frameHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, frameHeight, d]} />
                <meshStandardMaterial color="#5c4033" roughness={0.7} />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, frameHeight + mattressHeight / 2, 0.03]} castShadow>
                <boxGeometry args={[w - 0.08, mattressHeight, d - 0.12]} />
                <meshStandardMaterial color="#f5f5f4" roughness={0.9} />
            </mesh>
            {/* Bedding/Duvet */}
            <mesh position={[0, frameHeight + mattressHeight + 0.04, 0.15]} castShadow>
                <boxGeometry args={[w - 0.12, 0.06, d - 0.5]} />
                <meshStandardMaterial color={furniture.color} roughness={0.95} />
            </mesh>
            {/* Pillows */}
            <mesh position={[-w / 4, frameHeight + mattressHeight + 0.08, -d / 2 + 0.3]} castShadow>
                <boxGeometry args={[w / 3, 0.12, 0.35]} />
                <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
            <mesh position={[w / 4, frameHeight + mattressHeight + 0.08, -d / 2 + 0.3]} castShadow>
                <boxGeometry args={[w / 3, 0.12, 0.35]} />
                <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
            {/* Headboard */}
            <mesh position={[0, frameHeight + 0.45, -d / 2 + 0.04]} castShadow receiveShadow>
                <boxGeometry args={[w + 0.04, 0.7, 0.08]} />
                <meshStandardMaterial color="#5c4033" roughness={0.6} />
            </mesh>
        </group>
    );
}

// Table 3D Component
function Table3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    const topThickness = 0.04;
    const legHeight = h - topThickness;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Legs */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
                <mesh key={i} position={[x * (w / 2 - 0.06), legHeight / 2, z * (d / 2 - 0.06)]} castShadow>
                    <boxGeometry args={[0.06, legHeight, 0.06]} />
                    <meshStandardMaterial color="#5c4033" roughness={0.6} />
                </mesh>
            ))}
            {/* Table top */}
            <mesh position={[0, h - topThickness / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, topThickness, d]} />
                <meshStandardMaterial color={furniture.color} roughness={0.5} />
            </mesh>
        </group>
    );
}

// Storage/Wardrobe 3D Component
function Storage3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    const isTV = furniture.id.includes('tv');
    const isBookshelf = furniture.id.includes('book');
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Main body */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={furniture.color} roughness={0.7} />
            </mesh>
            {isBookshelf && (
                <>
                    {/* Shelves */}
                    {[0.3, 0.6, 0.9, 1.2, 1.5].filter(y => y < h - 0.1).map((y, i) => (
                        <mesh key={i} position={[0, y, 0.02]} castShadow>
                            <boxGeometry args={[w - 0.04, 0.02, d - 0.04]} />
                            <meshStandardMaterial color="#8b7355" roughness={0.6} />
                        </mesh>
                    ))}
                </>
            )}
            {isTV && (
                <>
                    {/* TV Screen placeholder */}
                    <mesh position={[0, h + 0.35, -d / 2 + 0.03]} castShadow>
                        <boxGeometry args={[w * 0.9, 0.5, 0.03]} />
                        <meshStandardMaterial color="#1f2937" roughness={0.3} />
                    </mesh>
                </>
            )}
            {!isTV && !isBookshelf && (
                <>
                    {/* Door handles */}
                    <mesh position={[-w / 4, h / 2, d / 2 + 0.015]} castShadow>
                        <boxGeometry args={[0.02, 0.1, 0.02]} />
                        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[w / 4, h / 2, d / 2 + 0.015]} castShadow>
                        <boxGeometry args={[0.02, 0.1, 0.02]} />
                        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
                    </mesh>
                </>
            )}
        </group>
    );
}

// Bathtub 3D Component
function Bathtub3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Outer shell */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            {/* Inner cavity */}
            <mesh position={[0, h / 2 + 0.05, 0]}>
                <boxGeometry args={[w - 0.12, h - 0.08, d - 0.12]} />
                <meshStandardMaterial color="#e0f2fe" roughness={0.4} />
            </mesh>
            {/* Faucet */}
            <mesh position={[0, h + 0.1, -d / 2 + 0.12]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.2, 12]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

// Toilet 3D Component
function Toilet3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    const isWallHung = furniture.id.includes('wall-hung');
    
    return (
        <group position={[position[0], isWallHung ? 0.3 : 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Bowl */}
            <mesh position={[0, h / 2, d * 0.1]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d * 0.7]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Bowl front curve (simplified) */}
            <mesh position={[0, h / 2, d * 0.35]} castShadow>
                <cylinderGeometry args={[w / 2, w / 2, h, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Tank (only for non wall-hung) */}
            {!isWallHung && (
                <mesh position={[0, h + 0.2, -d * 0.25]} castShadow>
                    <boxGeometry args={[w * 0.9, 0.4, d * 0.3]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.2} />
                </mesh>
            )}
            {/* Seat */}
            <mesh position={[0, h + 0.02, d * 0.1]} castShadow>
                <boxGeometry args={[w - 0.04, 0.03, d * 0.65]} />
                <meshStandardMaterial color="#f5f5f4" roughness={0.4} />
            </mesh>
            {/* Lid */}
            <mesh position={[0, h + 0.05, d * 0.1]} castShadow>
                <boxGeometry args={[w - 0.02, 0.02, d * 0.68]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            {/* Flush button */}
            <mesh position={[0, h + (isWallHung ? 0.05 : 0.42), -d * 0.25]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
}

// Shower 3D Component
function Shower3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    const isCorner = furniture.id.includes('corner');
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Base/tray */}
            <mesh position={[0, 0.03, 0]} receiveShadow>
                <boxGeometry args={[w, 0.06, d]} />
                <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
            </mesh>
            {/* Glass panels */}
            {!isCorner ? (
                <>
                    {/* Front glass */}
                    <mesh position={[0, h / 2, d / 2 - 0.02]} castShadow>
                        <boxGeometry args={[w - 0.1, h - 0.1, 0.01]} />
                        <meshStandardMaterial color="#B0E0E6" transparent opacity={0.3} roughness={0.05} metalness={0.8} />
                    </mesh>
                    {/* Side glass */}
                    <mesh position={[w / 2 - 0.02, h / 2, 0]} castShadow>
                        <boxGeometry args={[0.01, h - 0.1, d - 0.1]} />
                        <meshStandardMaterial color="#B0E0E6" transparent opacity={0.3} roughness={0.05} metalness={0.8} />
                    </mesh>
                </>
            ) : (
                /* Corner curved glass */
                <mesh position={[0, h / 2, 0]} castShadow>
                    <cylinderGeometry args={[w / 2, w / 2, h - 0.1, 16, 1, true, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#B0E0E6" transparent opacity={0.3} roughness={0.05} metalness={0.8} side={THREE.DoubleSide} />
                </mesh>
            )}
            {/* Chrome frame - top */}
            <mesh position={[0, h - 0.03, d / 2 - 0.02]} castShadow>
                <boxGeometry args={[w - 0.08, 0.03, 0.03]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Shower head */}
            <mesh position={[0, h - 0.15, -d / 2 + 0.15]} castShadow>
                <cylinderGeometry args={[0.1, 0.08, 0.03, 16]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Shower arm */}
            <mesh position={[0, h - 0.1, -d / 2 + 0.08]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Mixer/controls */}
            <mesh position={[0, h * 0.5, -d / 2 + 0.08]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Drain */}
            <mesh position={[0, 0.065, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
                <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
            </mesh>
        </group>
    );
}

// Towel Rack 3D Component
function TowelRack3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const h = furniture.height;
    const isHeated = furniture.id.includes('heated') || furniture.id.includes('rack');
    
    return (
        <group position={[position[0], 1.0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {isHeated ? (
                <>
                    {/* Heated towel rack - ladder style */}
                    {/* Left vertical bar */}
                    <mesh position={[-w / 2 + 0.02, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.015, 0.015, h, 12]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                    </mesh>
                    {/* Right vertical bar */}
                    <mesh position={[w / 2 - 0.02, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.015, 0.015, h, 12]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                    </mesh>
                    {/* Horizontal bars */}
                    {[-0.3, -0.15, 0, 0.15, 0.3].map((y, i) => (
                        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                            <cylinderGeometry args={[0.012, 0.012, w - 0.06, 12]} />
                            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                        </mesh>
                    ))}
                </>
            ) : (
                <>
                    {/* Simple double towel bar */}
                    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.01, 0.01, w, 12]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.01, 0.01, w, 12]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                    </mesh>
                    {/* End brackets */}
                    <mesh position={[-w / 2, -0.04, 0]} castShadow>
                        <boxGeometry args={[0.04, 0.12, 0.03]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[w / 2, -0.04, 0]} castShadow>
                        <boxGeometry args={[0.04, 0.12, 0.03]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                    </mesh>
                </>
            )}
        </group>
    );
}

// Vanity 3D Component
function Vanity3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Cabinet */}
            <mesh position={[0, h / 2 - 0.05, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h - 0.1, d]} />
                <meshStandardMaterial color={furniture.color} roughness={0.7} />
            </mesh>
            {/* Counter top */}
            <mesh position={[0, h - 0.02, 0]} castShadow>
                <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
                <meshStandardMaterial color="#e7e5e4" roughness={0.3} />
            </mesh>
            {/* Sink basin */}
            <mesh position={[0, h - 0.02, 0.05]}>
                <cylinderGeometry args={[0.18, 0.15, 0.12, 24]} />
                <meshStandardMaterial color="#f5f5f4" />
            </mesh>
            {/* Faucet */}
            <mesh position={[0, h + 0.12, -d / 2 + 0.12]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.2, 12]} />
                <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

// Bathroom Cabinet 3D Component
function BathroomCabinet3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    const isMedicineCabinet = furniture.id.includes('medicine');
    
    return (
        <group position={[position[0], isMedicineCabinet ? 1.4 : 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Main cabinet body */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={furniture.color || '#ffffff'} roughness={0.5} />
            </mesh>
            {/* Mirror door for medicine cabinet */}
            {isMedicineCabinet && (
                <mesh position={[0, h / 2, d / 2 + 0.005]} castShadow>
                    <boxGeometry args={[w - 0.02, h - 0.02, 0.005]} />
                    <meshStandardMaterial color="#87CEEB" metalness={0.95} roughness={0.05} />
                </mesh>
            )}
            {/* Handle */}
            <mesh position={[w / 2 - 0.06, h / 2, d / 2 + 0.015]} castShadow>
                <boxGeometry args={[0.04, 0.08, 0.015]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Shelves (visible for regular cabinet) */}
            {!isMedicineCabinet && [0.25, 0.5, 0.75].map((ratio, i) => (
                <mesh key={i} position={[0, h * ratio, 0]}>
                    <boxGeometry args={[w - 0.04, 0.015, d - 0.02]} />
                    <meshStandardMaterial color="#e5e7eb" />
                </mesh>
            ))}
        </group>
    );
}

// Bathroom Mirror 3D Component
function BathroomMirror3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const h = furniture.height;
    const hasLED = furniture.id.includes('led');
    
    return (
        <group position={[position[0], 1.4, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Frame */}
            <mesh position={[0, 0, -0.02]} castShadow>
                <boxGeometry args={[w + 0.04, h + 0.04, 0.03]} />
                <meshStandardMaterial color="#2c2c2c" roughness={0.6} />
            </mesh>
            {/* Mirror surface */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[w, h, 0.005]} />
                <meshStandardMaterial color="#C0C0C0" metalness={0.98} roughness={0.02} />
            </mesh>
            {/* LED backlight */}
            {hasLED && (
                <>
                    <mesh position={[0, 0, -0.025]}>
                        <boxGeometry args={[w + 0.02, h + 0.02, 0.01]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
                    </mesh>
                    <pointLight position={[0, 0, 0.1]} intensity={0.5} distance={2} color="#ffffff" />
                </>
            )}
        </group>
    );
}

// Bidet 3D Component
function Bidet3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Bowl */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Inner basin */}
            <mesh position={[0, h / 2 + 0.03, 0]}>
                <boxGeometry args={[w - 0.06, h - 0.04, d - 0.08]} />
                <meshStandardMaterial color="#f0f9ff" roughness={0.3} />
            </mesh>
            {/* Faucet */}
            <mesh position={[0, h + 0.06, -d / 3]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.12, 12]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Controls */}
            <mesh position={[-w / 4, h + 0.02, -d / 3]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[w / 4, h + 0.02, -d / 3]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

// Bathroom Shelf 3D Component
function BathroomShelf3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    
    return (
        <group position={[position[0], 1.3, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Glass shelf */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[w, 0.01, d]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.4} roughness={0.1} />
            </mesh>
            {/* Chrome brackets */}
            <mesh position={[-w / 2 + 0.03, 0, 0]} castShadow>
                <boxGeometry args={[0.04, 0.05, d]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[w / 2 - 0.03, 0, 0]} castShadow>
                <boxGeometry args={[0.04, 0.05, d]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

// Toilet Paper Holder 3D Component
function ToiletPaperHolder3D({ furniture, position, rotation }: Furniture3DProps) {
    return (
        <group position={[position[0], 0.8, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Wall mount */}
            <mesh position={[0, 0, -0.02]} castShadow>
                <boxGeometry args={[0.08, 0.08, 0.02]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Arm */}
            <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.15, 12]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Paper roll */}
            <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
            {/* Roll core */}
            <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.13, 12]} />
                <meshStandardMaterial color="#a16207" roughness={0.7} />
            </mesh>
        </group>
    );
}

// Laundry Basket 3D Component  
function LaundryBasket3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Basket body (wicker style) */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color="#c4a574" roughness={0.9} />
            </mesh>
            {/* Inner lining */}
            <mesh position={[0, h / 2 + 0.02, 0]}>
                <boxGeometry args={[w - 0.04, h - 0.02, d - 0.04]} />
                <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
            </mesh>
            {/* Lid */}
            <mesh position={[0, h + 0.02, 0]} castShadow>
                <boxGeometry args={[w + 0.01, 0.03, d + 0.01]} />
                <meshStandardMaterial color="#c4a574" roughness={0.9} />
            </mesh>
            {/* Handle on lid */}
            <mesh position={[0, h + 0.06, 0]} castShadow>
                <boxGeometry args={[0.12, 0.04, 0.03]} />
                <meshStandardMaterial color="#8b7355" roughness={0.8} />
            </mesh>
        </group>
    );
}

// Bathroom Stool 3D Component
function BathroomStool3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Seat */}
            <mesh position={[0, h - 0.02, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, 0.04, d]} />
                <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
            </mesh>
            {/* Legs */}
            {[
                [-w / 2 + 0.04, -d / 2 + 0.04],
                [w / 2 - 0.04, -d / 2 + 0.04],
                [-w / 2 + 0.04, d / 2 - 0.04],
                [w / 2 - 0.04, d / 2 - 0.04]
            ].map(([x, z], i) => (
                <mesh key={i} position={[x, (h - 0.04) / 2, z]} castShadow>
                    <cylinderGeometry args={[0.015, 0.015, h - 0.04, 8]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
        </group>
    );
}

// Bathroom Scale 3D Component
function BathroomScale3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Scale body */}
            <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, 0.03, d]} />
                <meshStandardMaterial color="#333333" roughness={0.4} />
            </mesh>
            {/* Glass top */}
            <mesh position={[0, 0.032, 0]} castShadow>
                <boxGeometry args={[w - 0.01, 0.003, d - 0.01]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} roughness={0.1} />
            </mesh>
            {/* Display */}
            <mesh position={[0, 0.035, -d / 4]}>
                <boxGeometry args={[0.06, 0.002, 0.025]} />
                <meshStandardMaterial color="#1a1a1a" emissive="#00ff00" emissiveIntensity={0.3} />
            </mesh>
        </group>
    );
}

// Soap Dispenser 3D Component
function SoapDispenser3D({ furniture, position, rotation }: Furniture3DProps) {
    const h = furniture.height;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Body */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.04, h - 0.04, 16]} />
                <meshStandardMaterial color="#f0f0f0" transparent opacity={0.7} roughness={0.2} />
            </mesh>
            {/* Pump head */}
            <mesh position={[0, h - 0.01, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Pump nozzle */}
            <mesh position={[0.03, h, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Soap inside */}
            <mesh position={[0, h / 3, 0]}>
                <cylinderGeometry args={[0.035, 0.035, h / 2, 16]} />
                <meshStandardMaterial color="#ffd700" transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

// Bath Mat 3D Component
function BathMat3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            <mesh position={[0, 0.01, 0]} receiveShadow>
                <boxGeometry args={[w, 0.02, d]} />
                <meshStandardMaterial color={furniture.color || '#e0e0e0'} roughness={0.95} />
            </mesh>
        </group>
    );
}

// Kitchen Island 3D Component
function KitchenIsland3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Base cabinet */}
            <mesh position={[0, h / 2 - 0.02, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h - 0.04, d]} />
                <meshStandardMaterial color={furniture.color} roughness={0.7} />
            </mesh>
            {/* Counter top */}
            <mesh position={[0, h, 0]} castShadow>
                <boxGeometry args={[w + 0.03, 0.04, d + 0.03]} />
                <meshStandardMaterial color="#e5e7eb" roughness={0.3} />
            </mesh>
        </group>
    );
}

// Lighting Fixture 3D Component (Chandelier, Pendant, etc.)
function Light3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const h = furniture.height;
    const isChandelier = furniture.id.includes('chandelier');
    const isFloorLamp = furniture.id.includes('floor-lamp');
    const isTableLamp = furniture.id.includes('table-lamp');
    const isWallSconce = furniture.id.includes('sconce');
    
    // Warm light color
    const lightColor = '#FFF5E1';
    const glowColor = '#FFEDD5';
    
    if (isWallSconce) {
        return (
            <group position={[position[0], 1.8, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
                {/* Wall mount plate */}
                <mesh position={[0, 0, -0.02]} castShadow>
                    <boxGeometry args={[0.08, 0.12, 0.02]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Arm */}
                <mesh position={[0, 0, 0.05]} castShadow>
                    <boxGeometry args={[0.03, 0.03, 0.1]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Glass shade - glowing */}
                <mesh position={[0, 0, 0.12]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial 
                        color={glowColor} 
                        emissive={lightColor}
                        emissiveIntensity={2}
                        transparent 
                        opacity={0.9} 
                    />
                </mesh>
                {/* Light source */}
                <pointLight position={[0, 0, 0.12]} intensity={1.5} color={lightColor} distance={4} decay={2} />
            </group>
        );
    }
    
    if (isFloorLamp) {
        return (
            <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
                {/* Base */}
                <mesh position={[0, 0.02, 0]} castShadow>
                    <cylinderGeometry args={[0.15, 0.18, 0.04, 16]} />
                    <meshStandardMaterial color="#1f2937" roughness={0.6} />
                </mesh>
                {/* Stand */}
                <mesh position={[0, h / 2, 0]} castShadow>
                    <cylinderGeometry args={[0.02, 0.02, h - 0.3, 12]} />
                    <meshStandardMaterial color="#78350f" roughness={0.5} />
                </mesh>
                {/* Shade - outer */}
                <mesh position={[0, h - 0.15, 0]}>
                    <coneGeometry args={[0.18, 0.25, 16, 1, true]} />
                    <meshStandardMaterial color={furniture.color} side={THREE.DoubleSide} roughness={0.8} />
                </mesh>
                {/* Inner glow */}
                <mesh position={[0, h - 0.12, 0]}>
                    <coneGeometry args={[0.15, 0.2, 16, 1, true]} />
                    <meshStandardMaterial 
                        color={glowColor}
                        emissive={lightColor}
                        emissiveIntensity={1.5}
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                {/* Bulb glow sphere */}
                <mesh position={[0, h - 0.18, 0]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshStandardMaterial 
                        color="#FFFFFF"
                        emissive={lightColor}
                        emissiveIntensity={3}
                    />
                </mesh>
                <pointLight position={[0, h - 0.15, 0]} intensity={2} color={lightColor} distance={6} decay={2} />
                <spotLight 
                    position={[0, h - 0.1, 0]} 
                    angle={0.6} 
                    penumbra={0.5} 
                    intensity={1.5} 
                    color={lightColor} 
                    distance={4}
                    target-position={[0, 0, 0]}
                />
            </group>
        );
    }
    
    if (isTableLamp) {
        return (
            <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
                {/* Base */}
                <mesh position={[0, 0.06, 0]} castShadow>
                    <cylinderGeometry args={[0.06, 0.08, 0.12, 16]} />
                    <meshStandardMaterial color="#78350f" roughness={0.6} />
                </mesh>
                {/* Stem */}
                <mesh position={[0, 0.2, 0]} castShadow>
                    <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Shade - outer */}
                <mesh position={[0, 0.35, 0]}>
                    <coneGeometry args={[0.1, 0.15, 16, 1, true]} />
                    <meshStandardMaterial color={furniture.color} side={THREE.DoubleSide} roughness={0.8} />
                </mesh>
                {/* Inner glow */}
                <mesh position={[0, 0.34, 0]}>
                    <coneGeometry args={[0.08, 0.12, 16, 1, true]} />
                    <meshStandardMaterial 
                        color={glowColor}
                        emissive={lightColor}
                        emissiveIntensity={1.5}
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                {/* Bulb glow */}
                <mesh position={[0, 0.3, 0]}>
                    <sphereGeometry args={[0.025, 12, 12]} />
                    <meshStandardMaterial 
                        color="#FFFFFF"
                        emissive={lightColor}
                        emissiveIntensity={3}
                    />
                </mesh>
                <pointLight position={[0, 0.32, 0]} intensity={1.5} color={lightColor} distance={4} decay={2} />
            </group>
        );
    }
    
    // Ceiling lights (chandelier, pendant) - position on ceiling
    return (
        <group position={[position[0], 2.7, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Canopy */}
            <mesh position={[0, 0.48, 0]}>
                <cylinderGeometry args={[0.04, 0.05, 0.04, 16]} />
                <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Cord */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.45, 8]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>
            {/* Fixture */}
            {isChandelier ? (
                <group position={[0, 0, 0]}>
                    {/* Central hub */}
                    <mesh>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshStandardMaterial color={furniture.color} metalness={0.6} roughness={0.3} />
                    </mesh>
                    {/* Crystal/glass elements with glow */}
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                        <group key={i}>
                            {/* Arm */}
                            <mesh position={[Math.cos(angle * Math.PI / 180) * 0.15, -0.05, Math.sin(angle * Math.PI / 180) * 0.15]}>
                                <cylinderGeometry args={[0.01, 0.01, 0.12, 8]} />
                                <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
                            </mesh>
                            {/* Crystal bulb */}
                            <mesh position={[Math.cos(angle * Math.PI / 180) * 0.22, -0.1, Math.sin(angle * Math.PI / 180) * 0.22]}>
                                <sphereGeometry args={[0.035, 12, 12]} />
                                <meshStandardMaterial 
                                    color="#FFFFFF"
                                    emissive={lightColor}
                                    emissiveIntensity={2.5}
                                    transparent 
                                    opacity={0.95} 
                                />
                            </mesh>
                            {/* Individual point lights for each bulb */}
                            <pointLight 
                                position={[Math.cos(angle * Math.PI / 180) * 0.22, -0.1, Math.sin(angle * Math.PI / 180) * 0.22]} 
                                intensity={0.8} 
                                color={lightColor} 
                                distance={3}
                                decay={2}
                            />
                        </group>
                    ))}
                    {/* Center crystal drop */}
                    <mesh position={[0, -0.18, 0]}>
                        <coneGeometry args={[0.03, 0.08, 8]} />
                        <meshStandardMaterial 
                            color="#FFFFFF" 
                            emissive={lightColor}
                            emissiveIntensity={1}
                            transparent 
                            opacity={0.8} 
                        />
                    </mesh>
                </group>
            ) : (
                <group position={[0, 0, 0]}>
                    {/* Pendant shade */}
                    <mesh>
                        <cylinderGeometry args={[w / 2.5, w / 3, 0.2, 16]} />
                        <meshStandardMaterial color={furniture.color} roughness={0.6} />
                    </mesh>
                    {/* Inner glow surface */}
                    <mesh position={[0, -0.02, 0]}>
                        <cylinderGeometry args={[w / 2.8, w / 3.2, 0.15, 16]} />
                        <meshStandardMaterial 
                            color={glowColor}
                            emissive={lightColor}
                            emissiveIntensity={1.5}
                            side={THREE.BackSide}
                        />
                    </mesh>
                    {/* Bulb */}
                    <mesh position={[0, -0.05, 0]}>
                        <sphereGeometry args={[0.04, 12, 12]} />
                        <meshStandardMaterial 
                            color="#FFFFFF"
                            emissive={lightColor}
                            emissiveIntensity={3}
                        />
                    </mesh>
                </group>
            )}
            {/* Main light source */}
            <pointLight position={[0, -0.15, 0]} intensity={3} color={lightColor} distance={8} decay={2} />
            <spotLight 
                position={[0, -0.1, 0]} 
                angle={0.8} 
                penumbra={0.5} 
                intensity={2} 
                color={lightColor} 
                distance={6}
                castShadow
            />
        </group>
    );
}

// Plant 3D Component
function Plant3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const h = furniture.height;
    const isLarge = furniture.id.includes('large');
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
            {/* Pot */}
            <mesh position={[0, 0.1, 0]} castShadow>
                <cylinderGeometry args={[w / 3, w / 4, 0.2, 16]} />
                <meshStandardMaterial color="#92400e" roughness={0.8} />
            </mesh>
            {/* Soil */}
            <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[w / 3 - 0.02, w / 3 - 0.02, 0.02, 16]} />
                <meshStandardMaterial color="#3d2914" />
            </mesh>
            {/* Foliage */}
            {isLarge ? (
                <>
                    <mesh position={[0, h * 0.5, 0]} castShadow>
                        <sphereGeometry args={[w / 2.2, 12, 12]} />
                        <meshStandardMaterial color="#22c55e" roughness={0.9} />
                    </mesh>
                    <mesh position={[0.08, h * 0.65, 0.05]} castShadow>
                        <sphereGeometry args={[w / 3, 10, 10]} />
                        <meshStandardMaterial color="#16a34a" roughness={0.9} />
                    </mesh>
                </>
            ) : (
                <mesh position={[0, 0.32, 0]} castShadow>
                    <sphereGeometry args={[w / 2.5, 10, 10]} />
                    <meshStandardMaterial color="#4ade80" roughness={0.9} />
                </mesh>
            )}
        </group>
    );
}

// Door 3D Component - Positioned in wall with proper opening
function Door3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width || 0.9;
    const h = furniture.height || 2.1; // Standard door height
    const doorDepth = 0.04;
    const frameDepth = 0.12; // Match wall thickness
    const isDouble = furniture.id.includes('double');
    const openInward = rotation === 0 || rotation === undefined;
    
    // Determine which wall the door is on based on position
    const absX = Math.abs(position[0]);
    const absZ = Math.abs(position[2]);
    
    // If x position is larger than z, door is on left/right wall (needs 90° rotation)
    // If z position is larger than x, door is on front/back wall (no extra rotation)
    const isOnSideWall = absX > absZ;
    
    // Calculate door rotation based on wall position
    let doorYRotation = isOnSideWall ? Math.PI / 2 : 0;
    
    // Door swing angle - slightly open (30 degrees) to show it's a door
    // Positive angle swings into room, negative swings out
    const swingAngle = openInward ? Math.PI / 6 : -Math.PI / 6;
    
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, doorYRotation, 0]}>
            {/* Door frame - left post - matches wall thickness */}
            <mesh position={[-w / 2 - 0.03, h / 2, 0]} castShadow>
                <boxGeometry args={[0.06, h, frameDepth]} />
                <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
            </mesh>
            
            {/* Door frame - right post */}
            <mesh position={[w / 2 + 0.03, h / 2, 0]} castShadow>
                <boxGeometry args={[0.06, h, frameDepth]} />
                <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
            </mesh>
            
            {/* Door frame - header */}
            <mesh position={[0, h + 0.03, 0]} castShadow>
                <boxGeometry args={[w + 0.12, 0.06, frameDepth]} />
                <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
            </mesh>
            
            {/* Door threshold/floor piece */}
            <mesh position={[0, 0.01, 0]} castShadow>
                <boxGeometry args={[w, 0.02, frameDepth]} />
                <meshStandardMaterial color="#a8a29e" roughness={0.7} />
            </mesh>
            
            {/* Door panel - hinged on left side */}
            {isDouble ? (
                <>
                    {/* Left door panel - pivot point at left edge */}
                    <group position={[-w / 2 + 0.02, 0, 0]} rotation={[0, swingAngle, 0]}>
                        <mesh position={[(w / 2 - 0.04) / 2, h / 2, 0]} castShadow>
                            <boxGeometry args={[w / 2 - 0.04, h - 0.04, doorDepth]} />
                            <meshStandardMaterial color={furniture.color || '#8B5A2B'} roughness={0.5} />
                        </mesh>
                        {/* Panel details */}
                        <mesh position={[(w / 2 - 0.04) / 2, h * 0.65, doorDepth / 2 + 0.005]}>
                            <boxGeometry args={[w / 2 - 0.16, h * 0.25, 0.01]} />
                            <meshStandardMaterial color={furniture.color || '#6D4C2A'} roughness={0.6} />
                        </mesh>
                        <mesh position={[(w / 2 - 0.04) / 2, h * 0.3, doorDepth / 2 + 0.005]}>
                            <boxGeometry args={[w / 2 - 0.16, h * 0.35, 0.01]} />
                            <meshStandardMaterial color={furniture.color || '#6D4C2A'} roughness={0.6} />
                        </mesh>
                        {/* Handle near the swing edge */}
                        <mesh position={[w / 2 - 0.12, h / 2, doorDepth / 2 + 0.02]} castShadow>
                            <boxGeometry args={[0.03, 0.1, 0.03]} />
                            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
                        </mesh>
                    </group>
                    
                    {/* Right door panel - pivot point at right edge */}
                    <group position={[w / 2 - 0.02, 0, 0]} rotation={[0, -swingAngle, 0]}>
                        <mesh position={[-(w / 2 - 0.04) / 2, h / 2, 0]} castShadow>
                            <boxGeometry args={[w / 2 - 0.04, h - 0.04, doorDepth]} />
                            <meshStandardMaterial color={furniture.color || '#8B5A2B'} roughness={0.5} />
                        </mesh>
                        {/* Panel details */}
                        <mesh position={[-(w / 2 - 0.04) / 2, h * 0.65, doorDepth / 2 + 0.005]}>
                            <boxGeometry args={[w / 2 - 0.16, h * 0.25, 0.01]} />
                            <meshStandardMaterial color={furniture.color || '#6D4C2A'} roughness={0.6} />
                        </mesh>
                        <mesh position={[-(w / 2 - 0.04) / 2, h * 0.3, doorDepth / 2 + 0.005]}>
                            <boxGeometry args={[w / 2 - 0.16, h * 0.35, 0.01]} />
                            <meshStandardMaterial color={furniture.color || '#6D4C2A'} roughness={0.6} />
                        </mesh>
                        {/* Handle */}
                        <mesh position={[-w / 2 + 0.12, h / 2, doorDepth / 2 + 0.02]} castShadow>
                            <boxGeometry args={[0.03, 0.1, 0.03]} />
                            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
                        </mesh>
                    </group>
                </>
            ) : (
                /* Single door - pivot point at left hinge */
                <group position={[-w / 2 + 0.02, 0, 0]} rotation={[0, swingAngle, 0]}>
                    {/* Door panel - positioned so left edge is at pivot */}
                    <mesh position={[(w - 0.04) / 2, h / 2, 0]} castShadow>
                        <boxGeometry args={[w - 0.04, h - 0.04, doorDepth]} />
                        <meshStandardMaterial color={furniture.color || '#8B5A2B'} roughness={0.5} />
                    </mesh>
                    
                    {/* Door panel details - raised panels */}
                    <mesh position={[(w - 0.04) / 2, h * 0.7, doorDepth / 2 + 0.005]}>
                        <boxGeometry args={[w - 0.2, h * 0.22, 0.008]} />
                        <meshStandardMaterial color={furniture.color || '#6D4C2A'} roughness={0.6} />
                    </mesh>
                    <mesh position={[(w - 0.04) / 2, h * 0.35, doorDepth / 2 + 0.005]}>
                        <boxGeometry args={[w - 0.2, h * 0.32, 0.008]} />
                        <meshStandardMaterial color={furniture.color || '#6D4C2A'} roughness={0.6} />
                    </mesh>
                    
                    {/* Door handle - on the right side (swing edge) */}
                    <mesh position={[w - 0.12, h / 2, doorDepth / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
                        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[w - 0.12, h / 2, doorDepth / 2 + 0.06]} castShadow>
                        <sphereGeometry args={[0.02, 8, 8]} />
                        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
                    </mesh>
                </group>
            )}
        </group>
    );
}

// Window 3D Component - Realistic window with proper glass, frame, and outdoor view
function Window3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width || 1.0;
    const h = furniture.height || 1.2;
    const windowSillHeight = 0.9; // Standard window sill height
    const frameDepth = 0.12; // Match wall thickness
    
    // Determine wall orientation
    const isOnSideWall = Math.abs(position[0]) > Math.abs(position[2]);
    let windowRotation = isOnSideWall ? Math.PI / 2 : 0;
    
    // Check window type
    const isFloorToCeiling = furniture.id.includes('floor');
    const isBayWindow = furniture.id.includes('bay');
    const isLargePicture = furniture.id.includes('large');
    
    const actualSillHeight = isFloorToCeiling ? 0.05 : windowSillHeight;
    
    return (
        <group position={[position[0], actualSillHeight, position[2]]} rotation={[0, windowRotation, 0]}>
            {/* ========== EXTERIOR SIDE (Back/Outside) ========== */}
            
            {/* Exterior decorative trim/molding - outer border */}
            <mesh position={[0, h / 2, -frameDepth / 2 - 0.02]} castShadow>
                <boxGeometry args={[w + 0.2, h + 0.2, 0.03]} />
                <meshStandardMaterial color="#F5F5F0" roughness={0.3} metalness={0.05} />
            </mesh>
            
            {/* Exterior header/lintel - decorative top piece */}
            <mesh position={[0, h + 0.08, -frameDepth / 2 - 0.03]} castShadow>
                <boxGeometry args={[w + 0.25, 0.1, 0.05]} />
                <meshStandardMaterial color="#E8E4E0" roughness={0.35} />
            </mesh>
            
            {/* Exterior header crown detail */}
            <mesh position={[0, h + 0.14, -frameDepth / 2 - 0.02]} castShadow>
                <boxGeometry args={[w + 0.28, 0.04, 0.04]} />
                <meshStandardMaterial color="#D8D4D0" roughness={0.4} />
            </mesh>
            
            {/* Exterior frame - left pilaster */}
            <mesh position={[-w / 2 - 0.08, h / 2, -frameDepth / 2 - 0.03]} castShadow>
                <boxGeometry args={[0.06, h + 0.12, 0.04]} />
                <meshStandardMaterial color="#EEEBE6" roughness={0.35} />
            </mesh>
            
            {/* Exterior frame - right pilaster */}
            <mesh position={[w / 2 + 0.08, h / 2, -frameDepth / 2 - 0.03]} castShadow>
                <boxGeometry args={[0.06, h + 0.12, 0.04]} />
                <meshStandardMaterial color="#EEEBE6" roughness={0.35} />
            </mesh>
            
            {/* Exterior sill - stone/concrete ledge */}
            <mesh position={[0, -0.04, -frameDepth / 2 - 0.06]} castShadow receiveShadow>
                <boxGeometry args={[w + 0.22, 0.06, 0.1]} />
                <meshStandardMaterial color="#D0CCC8" roughness={0.6} />
            </mesh>
            
            {/* Exterior sill drip edge */}
            <mesh position={[0, -0.08, -frameDepth / 2 - 0.1]} castShadow>
                <boxGeometry args={[w + 0.2, 0.02, 0.04]} />
                <meshStandardMaterial color="#C8C4C0" roughness={0.5} />
            </mesh>
            
            {/* Exterior decorative keystones at top corners */}
            <mesh position={[-w / 2 - 0.02, h + 0.02, -frameDepth / 2 - 0.04]} castShadow>
                <boxGeometry args={[0.08, 0.08, 0.03]} />
                <meshStandardMaterial color="#E0DCD8" roughness={0.4} />
            </mesh>
            <mesh position={[w / 2 + 0.02, h + 0.02, -frameDepth / 2 - 0.04]} castShadow>
                <boxGeometry args={[0.08, 0.08, 0.03]} />
                <meshStandardMaterial color="#E0DCD8" roughness={0.4} />
            </mesh>
            
            {/* ========== MAIN FRAME STRUCTURE ========== */}
            
            {/* Outer frame - main frame structure */}
            <mesh position={[0, h / 2, 0]} castShadow>
                <boxGeometry args={[w + 0.1, h + 0.1, frameDepth]} />
                <meshStandardMaterial color="#E8E4E0" roughness={0.4} metalness={0.1} />
            </mesh>
            
            {/* Inner frame recess */}
            <mesh position={[0, h / 2, 0.01]}>
                <boxGeometry args={[w + 0.02, h + 0.02, frameDepth - 0.02]} />
                <meshStandardMaterial color="#D4D0CC" roughness={0.5} />
            </mesh>
            
            {/* Sky/outdoor background visible through window */}
            <mesh position={[0, h / 2, -0.04]}>
                <planeGeometry args={[w - 0.08, h - 0.08]} />
                <meshStandardMaterial color="#87CEEB" />
            </mesh>
            
            {/* Outdoor scene elements - clouds */}
            <mesh position={[-w * 0.2, h * 0.7, -0.035]}>
                <circleGeometry args={[h * 0.08, 16]} />
                <meshStandardMaterial color="#FFFFFF" transparent opacity={0.9} />
            </mesh>
            <mesh position={[w * 0.15, h * 0.75, -0.035]}>
                <circleGeometry args={[h * 0.06, 16]} />
                <meshStandardMaterial color="#FFFFFF" transparent opacity={0.85} />
            </mesh>
            
            {/* Distant trees/greenery at bottom */}
            <mesh position={[0, h * 0.15, -0.035]}>
                <planeGeometry args={[w - 0.1, h * 0.25]} />
                <meshStandardMaterial color="#228B22" />
            </mesh>
            
            {/* ========== INTERIOR SIDE ========== */}
            
            {/* Interior decorative casing/trim - top */}
            <mesh position={[0, h + 0.04, 0.08]} castShadow>
                <boxGeometry args={[w + 0.2, 0.08, 0.04]} />
                <meshStandardMaterial color="#F5F5F0" roughness={0.35} />
            </mesh>
            
            {/* Interior crown molding detail */}
            <mesh position={[0, h + 0.07, 0.06]} castShadow>
                <boxGeometry args={[w + 0.22, 0.03, 0.02]} />
                <meshStandardMaterial color="#EEEEE8" roughness={0.3} />
            </mesh>
            
            {/* Interior casing - left side */}
            <mesh position={[-w / 2 - 0.06, h / 2, 0.08]} castShadow>
                <boxGeometry args={[0.06, h + 0.1, 0.04]} />
                <meshStandardMaterial color="#F5F5F0" roughness={0.35} />
            </mesh>
            
            {/* Interior casing - right side */}
            <mesh position={[w / 2 + 0.06, h / 2, 0.08]} castShadow>
                <boxGeometry args={[0.06, h + 0.1, 0.04]} />
                <meshStandardMaterial color="#F5F5F0" roughness={0.35} />
            </mesh>
            
            {/* Interior apron (below sill) */}
            <mesh position={[0, -0.1, 0.08]} castShadow>
                <boxGeometry args={[w + 0.2, 0.1, 0.03]} />
                <meshStandardMaterial color="#F0F0EA" roughness={0.4} />
            </mesh>
            
            {/* Window sill - extended ledge (interior) - enhanced */}
            <mesh position={[0, -0.02, 0.12]} castShadow receiveShadow>
                <boxGeometry args={[w + 0.18, 0.06, 0.2]} />
                <meshStandardMaterial color="#FAFAF5" roughness={0.3} />
            </mesh>
            
            {/* Window sill front edge detail - rounded profile */}
            <mesh position={[0, -0.05, 0.2]} castShadow>
                <boxGeometry args={[w + 0.18, 0.02, 0.04]} />
                <meshStandardMaterial color="#F0F0EA" roughness={0.25} />
            </mesh>
            
            {/* Window sill bottom detail */}
            <mesh position={[0, -0.07, 0.14]} castShadow>
                <boxGeometry args={[w + 0.16, 0.02, 0.16]} />
                <meshStandardMaterial color="#E8E8E2" roughness={0.4} />
            </mesh>
            
            {/* Glass panes with realistic reflection */}
            {!isLargePicture ? (
                <>
                    {/* Left glass pane */}
                    <mesh position={[-w / 4, h / 2, 0.04]}>
                        <boxGeometry args={[w / 2 - 0.08, h - 0.12, 0.008]} />
                        <meshStandardMaterial 
                            color="#B0E0E6" 
                            transparent 
                            opacity={0.35} 
                            roughness={0.02}
                            metalness={0.9}
                            envMapIntensity={1}
                        />
                    </mesh>
                    
                    {/* Right glass pane */}
                    <mesh position={[w / 4, h / 2, 0.04]}>
                        <boxGeometry args={[w / 2 - 0.08, h - 0.12, 0.008]} />
                        <meshStandardMaterial 
                            color="#B0E0E6" 
                            transparent 
                            opacity={0.35} 
                            roughness={0.02}
                            metalness={0.9}
                            envMapIntensity={1}
                        />
                    </mesh>
                    
                    {/* Center mullion (vertical divider) */}
                    <mesh position={[0, h / 2, 0.045]} castShadow>
                        <boxGeometry args={[0.05, h - 0.08, 0.04]} />
                        <meshStandardMaterial color="#E8E4E0" roughness={0.4} />
                    </mesh>
                    
                    {/* Horizontal mullion */}
                    <mesh position={[0, h / 2, 0.045]} castShadow>
                        <boxGeometry args={[w - 0.06, 0.04, 0.04]} />
                        <meshStandardMaterial color="#E8E4E0" roughness={0.4} />
                    </mesh>
                </>
            ) : (
                /* Large picture window - single pane */
                <mesh position={[0, h / 2, 0.04]}>
                    <boxGeometry args={[w - 0.1, h - 0.1, 0.01]} />
                    <meshStandardMaterial 
                        color="#B0E0E6" 
                        transparent 
                        opacity={0.3} 
                        roughness={0.01}
                        metalness={0.95}
                        envMapIntensity={1.2}
                    />
                </mesh>
            )}
            
            {/* Inner frame details - top */}
            <mesh position={[0, h - 0.02, 0.05]} castShadow>
                <boxGeometry args={[w + 0.02, 0.04, 0.06]} />
                <meshStandardMaterial color="#E0DCD8" roughness={0.4} />
            </mesh>
            
            {/* Inner frame details - bottom */}
            <mesh position={[0, 0.02, 0.05]} castShadow>
                <boxGeometry args={[w + 0.02, 0.04, 0.06]} />
                <meshStandardMaterial color="#E0DCD8" roughness={0.4} />
            </mesh>
            
            {/* Inner frame details - left */}
            <mesh position={[-w / 2 + 0.01, h / 2, 0.05]} castShadow>
                <boxGeometry args={[0.04, h - 0.04, 0.06]} />
                <meshStandardMaterial color="#E0DCD8" roughness={0.4} />
            </mesh>
            
            {/* Inner frame details - right */}
            <mesh position={[w / 2 - 0.01, h / 2, 0.05]} castShadow>
                <boxGeometry args={[0.04, h - 0.04, 0.06]} />
                <meshStandardMaterial color="#E0DCD8" roughness={0.4} />
            </mesh>
            
            {/* Window latch/lock - decorative brass */}
            <mesh position={[0, h * 0.4, 0.07]} castShadow>
                <boxGeometry args={[0.08, 0.025, 0.025]} />
                <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Lock knob detail */}
            <mesh position={[0.025, h * 0.4, 0.085]} castShadow>
                <boxGeometry args={[0.02, 0.015, 0.015]} />
                <meshStandardMaterial color="#DAA520" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* Light coming through window */}
            <rectAreaLight 
                position={[0, h / 2, 0.1]}
                width={w * 0.8}
                height={h * 0.8}
                intensity={0.5}
                color="#FFFEF0"
            />
        </group>
    );
}

// Decor 3D Component (Rug, Mirror, Art, Curtains)
function Decor3D({ furniture, position, rotation }: Furniture3DProps) {
    const w = furniture.width;
    const d = furniture.length;
    const h = furniture.height;
    
    if (furniture.id.includes('rug')) {
        // Realistic rug with pattern simulation
        return (
            <group position={[position[0], 0.01, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
                <mesh receiveShadow>
                    <boxGeometry args={[w, 0.02, d]} />
                    <meshStandardMaterial color={furniture.color} roughness={0.95} />
                </mesh>
                {/* Rug border */}
                <mesh position={[0, 0.005, 0]} receiveShadow>
                    <boxGeometry args={[w - 0.1, 0.015, d - 0.1]} />
                    <meshStandardMaterial color={furniture.color} roughness={0.9} />
                </mesh>
            </group>
        );
    }
    
    const isMirror = furniture.id.includes('mirror');
    const isWallArt =
        furniture.mount === 'wall' &&
        (furniture.id.includes('art') || furniture.id.includes('artwork') || furniture.id.includes('painting'));

    if (isMirror) {
        // Realistic wall mirror with reflective surface
        return (
            <group position={[position[0], 1.4, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
                {/* Outer frame - ornate gold/wood */}
                <mesh position={[0, 0, -0.025]} castShadow>
                    <boxGeometry args={[w + 0.08, h + 0.08, 0.03]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.4} metalness={0.3} />
                </mesh>
                {/* Inner frame detail */}
                <mesh position={[0, 0, -0.015]} castShadow>
                    <boxGeometry args={[w + 0.04, h + 0.04, 0.02]} />
                    <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.6} />
                </mesh>
                {/* Mirror glass - highly reflective */}
                <mesh position={[0, 0, 0.001]} castShadow>
                    <planeGeometry args={[w, h]} />
                    <meshStandardMaterial 
                        color="#c0d0e0"
                        metalness={0.95}
                        roughness={0.02}
                        envMapIntensity={1.5}
                    />
                </mesh>
            </group>
        );
    }

    if (isWallArt) {
        // Realistic framed painting/artwork with canvas texture
        // Use furniture.color as the dominant color for the painting
        const paintingColor = furniture.color || '#6366f1';
        
        // Determine painting style based on id for Nepali art
        const isThangka = furniture.id.includes('thangka');
        const isMandala = furniture.id.includes('mandala');
        const isHimalayan = furniture.id.includes('himalayan');
        const isAbstract = furniture.id.includes('abstract');
        const isLandscape = furniture.id.includes('landscape');
        const isPortrait = furniture.id.includes('portrait');
        const isFloral = furniture.id.includes('floral') || furniture.id.includes('flower');
        
        // Frame color based on style
        const frameColor = isThangka ? '#8B0000' : isMandala ? '#D4AF37' : isAbstract ? '#1a1a1a' : '#5D4037';
        const innerFrameColor = isThangka ? '#FFD700' : isMandala ? '#B8860B' : isAbstract ? '#333333' : '#8D6E63';
        
        return (
            <group position={[position[0], 1.4, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
                {/* Shadow behind frame */}
                <mesh position={[0.02, -0.02, -0.06]}>
                    <planeGeometry args={[w + 0.12, h + 0.12]} />
                    <meshStandardMaterial color="#000000" transparent opacity={0.3} />
                </mesh>
                
                {/* Outer frame - detailed wood/gold texture */}
                <mesh position={[0, 0, -0.05]} castShadow>
                    <boxGeometry args={[w + 0.12, h + 0.12, 0.05]} />
                    <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.25} />
                </mesh>
                
                {/* Frame outer bevel */}
                <mesh position={[0, 0, -0.035]} castShadow>
                    <boxGeometry args={[w + 0.1, h + 0.1, 0.02]} />
                    <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
                </mesh>
                
                {/* Inner frame / mat board */}
                <mesh position={[0, 0, -0.025]} castShadow>
                    <boxGeometry args={[w + 0.06, h + 0.06, 0.02]} />
                    <meshStandardMaterial color={innerFrameColor} roughness={0.4} metalness={0.3} />
                </mesh>
                
                {/* Mat board - cream colored */}
                <mesh position={[0, 0, -0.015]} castShadow>
                    <boxGeometry args={[w + 0.03, h + 0.03, 0.01]} />
                    <meshStandardMaterial color="#F5F5DC" roughness={0.9} />
                </mesh>
                
                {/* Canvas backing with texture */}
                <mesh position={[0, 0, -0.008]} castShadow>
                    <boxGeometry args={[w, h, 0.008]} />
                    <meshStandardMaterial color="#FAF8F2" roughness={0.95} />
                </mesh>
                
                {/* Painting base layer */}
                <mesh position={[0, 0, -0.003]}>
                    <planeGeometry args={[w - 0.02, h - 0.02]} />
                    <meshStandardMaterial color={paintingColor} roughness={0.75} />
                </mesh>
                
                {/* Default painting - colorful abstract/modern art */}
                {!isThangka && !isMandala && !isHimalayan && !isAbstract && !isLandscape && !isPortrait && !isFloral && !furniture.id.includes('nepali-village') && !furniture.id.includes('village-life') && (
                    <>
                        {/* Background gradient layer */}
                        <mesh position={[0, 0, -0.002]}>
                            <planeGeometry args={[w - 0.03, h - 0.03]} />
                            <meshStandardMaterial color={paintingColor} roughness={0.8} />
                        </mesh>
                        
                        {/* Main focal element - large shape */}
                        <mesh position={[w * 0.05, h * 0.05, -0.001]}>
                            <circleGeometry args={[Math.min(w, h) * 0.25, 32]} />
                            <meshStandardMaterial 
                                color="#E8D5B7" 
                                roughness={0.7} 
                            />
                        </mesh>
                        
                        {/* Secondary shape */}
                        <mesh position={[-w * 0.15, -h * 0.1, 0]}>
                            <planeGeometry args={[w * 0.3, h * 0.25]} />
                            <meshStandardMaterial color="#8B7355" roughness={0.75} />
                        </mesh>
                        
                        {/* Accent strokes */}
                        <mesh position={[w * 0.2, h * 0.2, 0.001]}>
                            <planeGeometry args={[w * 0.08, h * 0.35]} />
                            <meshStandardMaterial color="#C4A35A" roughness={0.65} />
                        </mesh>
                        <mesh position={[-w * 0.25, h * 0.15, 0.001]}>
                            <planeGeometry args={[w * 0.1, h * 0.2]} />
                            <meshStandardMaterial color="#A67B5B" roughness={0.7} />
                        </mesh>
                        
                        {/* Detail elements - brush stroke effects */}
                        <mesh position={[w * 0.1, -h * 0.25, 0.002]}>
                            <planeGeometry args={[w * 0.25, h * 0.05]} />
                            <meshStandardMaterial color="#DEB887" roughness={0.6} />
                        </mesh>
                        <mesh position={[-w * 0.1, h * 0.3, 0.002]}>
                            <planeGeometry args={[w * 0.15, h * 0.04]} />
                            <meshStandardMaterial color="#D2B48C" roughness={0.65} />
                        </mesh>
                        
                        {/* Texture dots/splatter effect */}
                        <mesh position={[w * 0.3, -h * 0.15, 0.003]}>
                            <circleGeometry args={[w * 0.03, 16]} />
                            <meshStandardMaterial color="#F5DEB3" roughness={0.7} />
                        </mesh>
                        <mesh position={[-w * 0.2, -h * 0.3, 0.003]}>
                            <circleGeometry args={[w * 0.025, 16]} />
                            <meshStandardMaterial color="#FAEBD7" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.15, h * 0.25, 0.003]}>
                            <circleGeometry args={[w * 0.02, 12]} />
                            <meshStandardMaterial color="#FFE4C4" roughness={0.75} />
                        </mesh>
                    </>
                )}
                
                {/* Abstract Modern Art */}
                {isAbstract && (
                    <>
                        {/* Bold geometric shapes */}
                        <mesh position={[-w * 0.15, h * 0.1, -0.001]}>
                            <planeGeometry args={[w * 0.4, h * 0.5]} />
                            <meshStandardMaterial color="#FF6B6B" roughness={0.6} />
                        </mesh>
                        <mesh position={[w * 0.2, -h * 0.05, 0]}>
                            <circleGeometry args={[Math.min(w, h) * 0.28, 32]} />
                            <meshStandardMaterial color="#4ECDC4" roughness={0.55} />
                        </mesh>
                        <mesh position={[w * 0.1, h * 0.2, 0.001]}>
                            <planeGeometry args={[w * 0.25, h * 0.3]} />
                            <meshStandardMaterial color="#FFE66D" roughness={0.5} />
                        </mesh>
                        {/* Black accent lines */}
                        <mesh position={[0, 0, 0.002]}>
                            <planeGeometry args={[w * 0.02, h * 0.8]} />
                            <meshStandardMaterial color="#2C2C2C" roughness={0.4} />
                        </mesh>
                        <mesh position={[-w * 0.1, -h * 0.2, 0.002]}>
                            <planeGeometry args={[w * 0.5, h * 0.02]} />
                            <meshStandardMaterial color="#2C2C2C" roughness={0.4} />
                        </mesh>
                    </>
                )}
                
                {/* Landscape Painting */}
                {isLandscape && (
                    <>
                        {/* Sky - gradient effect */}
                        <mesh position={[0, h * 0.2, -0.001]}>
                            <planeGeometry args={[w - 0.04, h * 0.45]} />
                            <meshStandardMaterial color="#87CEEB" roughness={0.85} />
                        </mesh>
                        <mesh position={[0, h * 0.35, 0]}>
                            <planeGeometry args={[w - 0.04, h * 0.15]} />
                            <meshStandardMaterial color="#B0E2FF" roughness={0.8} />
                        </mesh>
                        
                        {/* Clouds */}
                        <mesh position={[-w * 0.2, h * 0.28, 0.001]}>
                            <circleGeometry args={[w * 0.08, 16]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.85} />
                        </mesh>
                        <mesh position={[w * 0.15, h * 0.32, 0.001]}>
                            <circleGeometry args={[w * 0.06, 16]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.8} />
                        </mesh>
                        
                        {/* Mountains - layered */}
                        <mesh position={[0, h * 0.02, 0.002]}>
                            <planeGeometry args={[w - 0.04, h * 0.35]} />
                            <meshStandardMaterial color="#6B7B8C" roughness={0.75} />
                        </mesh>
                        <mesh position={[-w * 0.15, h * 0.05, 0.003]}>
                            <planeGeometry args={[w * 0.4, h * 0.25]} />
                            <meshStandardMaterial color="#5A6A7A" roughness={0.7} />
                        </mesh>
                        
                        {/* Snow caps */}
                        <mesh position={[-w * 0.15, h * 0.12, 0.004]}>
                            <planeGeometry args={[w * 0.25, h * 0.08]} />
                            <meshStandardMaterial color="#F0F8FF" roughness={0.6} />
                        </mesh>
                        
                        {/* Green valley/meadow */}
                        <mesh position={[0, -h * 0.22, 0.003]}>
                            <planeGeometry args={[w - 0.04, h * 0.25]} />
                            <meshStandardMaterial color="#228B22" roughness={0.85} />
                        </mesh>
                        
                        {/* Lake/water reflection */}
                        <mesh position={[w * 0.1, -h * 0.32, 0.004]}>
                            <planeGeometry args={[w * 0.35, h * 0.12]} />
                            <meshStandardMaterial color="#4169E1" roughness={0.3} metalness={0.4} />
                        </mesh>
                        
                        {/* Trees */}
                        <mesh position={[-w * 0.3, -h * 0.18, 0.005]}>
                            <planeGeometry args={[w * 0.08, h * 0.15]} />
                            <meshStandardMaterial color="#006400" roughness={0.8} />
                        </mesh>
                        <mesh position={[-w * 0.35, -h * 0.2, 0.004]}>
                            <planeGeometry args={[w * 0.06, h * 0.12]} />
                            <meshStandardMaterial color="#004d00" roughness={0.85} />
                        </mesh>
                    </>
                )}
                
                {/* Portrait Style */}
                {isPortrait && (
                    <>
                        {/* Background - warm tone */}
                        <mesh position={[0, 0, -0.001]}>
                            <planeGeometry args={[w - 0.04, h - 0.04]} />
                            <meshStandardMaterial color="#8B7355" roughness={0.85} />
                        </mesh>
                        
                        {/* Figure silhouette - bust */}
                        <mesh position={[0, -h * 0.15, 0]}>
                            <planeGeometry args={[w * 0.5, h * 0.45]} />
                            <meshStandardMaterial color="#4A4A4A" roughness={0.7} />
                        </mesh>
                        
                        {/* Head oval */}
                        <mesh position={[0, h * 0.15, 0.001]}>
                            <circleGeometry args={[Math.min(w, h) * 0.18, 32]} />
                            <meshStandardMaterial color="#E8C39E" roughness={0.75} />
                        </mesh>
                        
                        {/* Hair */}
                        <mesh position={[0, h * 0.22, 0.002]}>
                            <circleGeometry args={[Math.min(w, h) * 0.15, 32]} />
                            <meshStandardMaterial color="#2C1810" roughness={0.9} />
                        </mesh>
                        
                        {/* Clothing detail */}
                        <mesh position={[0, -h * 0.1, 0.002]}>
                            <planeGeometry args={[w * 0.4, h * 0.25]} />
                            <meshStandardMaterial color="#800020" roughness={0.7} />
                        </mesh>
                    </>
                )}
                
                {/* Floral Painting */}
                {isFloral && (
                    <>
                        {/* Background - soft cream */}
                        <mesh position={[0, 0, -0.001]}>
                            <planeGeometry args={[w - 0.04, h - 0.04]} />
                            <meshStandardMaterial color="#FFF8DC" roughness={0.85} />
                        </mesh>
                        
                        {/* Large central flower */}
                        <mesh position={[0, h * 0.05, 0]}>
                            <circleGeometry args={[Math.min(w, h) * 0.22, 32]} />
                            <meshStandardMaterial color="#FF69B4" roughness={0.65} />
                        </mesh>
                        <mesh position={[0, h * 0.05, 0.001]}>
                            <circleGeometry args={[Math.min(w, h) * 0.15, 32]} />
                            <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
                        </mesh>
                        <mesh position={[0, h * 0.05, 0.002]}>
                            <circleGeometry args={[Math.min(w, h) * 0.06, 24]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} />
                        </mesh>
                        
                        {/* Side flowers */}
                        <mesh position={[-w * 0.25, h * 0.2, 0]}>
                            <circleGeometry args={[Math.min(w, h) * 0.12, 24]} />
                            <meshStandardMaterial color="#E6E6FA" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.28, -h * 0.15, 0]}>
                            <circleGeometry args={[Math.min(w, h) * 0.1, 24]} />
                            <meshStandardMaterial color="#DDA0DD" roughness={0.7} />
                        </mesh>
                        <mesh position={[-w * 0.2, -h * 0.25, 0.001]}>
                            <circleGeometry args={[Math.min(w, h) * 0.08, 20]} />
                            <meshStandardMaterial color="#FFA07A" roughness={0.65} />
                        </mesh>
                        
                        {/* Leaves and stems */}
                        <mesh position={[-w * 0.1, -h * 0.1, -0.001]}>
                            <planeGeometry args={[w * 0.08, h * 0.2]} />
                            <meshStandardMaterial color="#228B22" roughness={0.75} />
                        </mesh>
                        <mesh position={[w * 0.15, h * 0.15, -0.001]}>
                            <planeGeometry args={[w * 0.12, h * 0.08]} />
                            <meshStandardMaterial color="#2E8B57" roughness={0.8} />
                        </mesh>
                        <mesh position={[w * 0.05, -h * 0.3, -0.001]}>
                            <planeGeometry args={[w * 0.06, h * 0.15]} />
                            <meshStandardMaterial color="#3CB371" roughness={0.75} />
                        </mesh>
                    </>
                )}
                
                {/* Thangka: Detailed Buddha painting with traditional elements */}
                {isThangka && (
                    <>
                        {/* Background - deep red/maroon traditional color */}
                        <mesh position={[0, 0, 0.002]}>
                            <planeGeometry args={[w - 0.06, h - 0.06]} />
                            <meshStandardMaterial color="#8B0000" roughness={0.8} />
                        </mesh>
                        
                        {/* Decorative border pattern - gold trim */}
                        <mesh position={[0, (h - 0.06) / 2 - 0.02, 0.003]}>
                            <planeGeometry args={[w - 0.08, 0.03]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
                        </mesh>
                        <mesh position={[0, -(h - 0.06) / 2 + 0.02, 0.003]}>
                            <planeGeometry args={[w - 0.08, 0.03]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
                        </mesh>
                        
                        {/* Large circular halo/aureole behind Buddha */}
                        <mesh position={[0, h * 0.08, 0.004]}>
                            <circleGeometry args={[Math.min(w, h) * 0.32, 64]} />
                            <meshStandardMaterial color="#FF8C00" roughness={0.6} />
                        </mesh>
                        <mesh position={[0, h * 0.08, 0.005]}>
                            <circleGeometry args={[Math.min(w, h) * 0.28, 64]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
                        </mesh>
                        <mesh position={[0, h * 0.08, 0.006]}>
                            <circleGeometry args={[Math.min(w, h) * 0.24, 64]} />
                            <meshStandardMaterial color="#FFA500" roughness={0.6} />
                        </mesh>
                        
                        {/* Buddha head - oval shape */}
                        <mesh position={[0, h * 0.15, 0.007]}>
                            <circleGeometry args={[Math.min(w, h) * 0.08, 32]} />
                            <meshStandardMaterial color="#E8B86D" roughness={0.7} />
                        </mesh>
                        {/* Buddha ushnisha (crown protrusion) */}
                        <mesh position={[0, h * 0.22, 0.008]}>
                            <circleGeometry args={[Math.min(w, h) * 0.03, 16]} />
                            <meshStandardMaterial color="#1C1C1C" roughness={0.8} />
                        </mesh>
                        {/* Buddha hair */}
                        <mesh position={[0, h * 0.18, 0.0065]}>
                            <circleGeometry args={[Math.min(w, h) * 0.065, 32]} />
                            <meshStandardMaterial color="#1C1C1C" roughness={0.9} />
                        </mesh>
                        
                        {/* Buddha body/torso - triangular robe shape */}
                        <mesh position={[0, -h * 0.02, 0.007]}>
                            <planeGeometry args={[Math.min(w, h) * 0.28, Math.min(w, h) * 0.3]} />
                            <meshStandardMaterial color="#FF6600" roughness={0.7} />
                        </mesh>
                        {/* Inner robe detail */}
                        <mesh position={[0, -h * 0.04, 0.008]}>
                            <planeGeometry args={[Math.min(w, h) * 0.22, Math.min(w, h) * 0.24]} />
                            <meshStandardMaterial color="#CC5500" roughness={0.7} />
                        </mesh>
                        
                        {/* Buddha hands in meditation mudra */}
                        <mesh position={[0, -h * 0.12, 0.009]}>
                            <circleGeometry args={[Math.min(w, h) * 0.06, 24]} />
                            <meshStandardMaterial color="#E8B86D" roughness={0.7} />
                        </mesh>
                        
                        {/* Lotus throne base */}
                        <mesh position={[0, -h * 0.28, 0.007]}>
                            <planeGeometry args={[Math.min(w, h) * 0.35, Math.min(w, h) * 0.12]} />
                            <meshStandardMaterial color="#FF69B4" roughness={0.6} />
                        </mesh>
                        {/* Lotus petals detail */}
                        <mesh position={[0, -h * 0.24, 0.008]}>
                            <planeGeometry args={[Math.min(w, h) * 0.32, Math.min(w, h) * 0.05]} />
                            <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
                        </mesh>
                        
                        {/* Small decorative clouds */}
                        <mesh position={[-w * 0.25, h * 0.25, 0.006]}>
                            <circleGeometry args={[Math.min(w, h) * 0.04, 16]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.7} />
                        </mesh>
                        <mesh position={[w * 0.25, h * 0.25, 0.006]}>
                            <circleGeometry args={[Math.min(w, h) * 0.04, 16]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.7} />
                        </mesh>
                        
                        {/* Corner floral motifs */}
                        <mesh position={[-w * 0.32, -h * 0.35, 0.006]}>
                            <circleGeometry args={[Math.min(w, h) * 0.05, 16]} />
                            <meshStandardMaterial color="#228B22" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.32, -h * 0.35, 0.006]}>
                            <circleGeometry args={[Math.min(w, h) * 0.05, 16]} />
                            <meshStandardMaterial color="#228B22" roughness={0.7} />
                        </mesh>
                    </>
                )}
                {/* Mandala: Concentric circles pattern */}
                {isMandala && (
                    <>
                        <mesh position={[0, 0, 0.002]}>
                            <ringGeometry args={[Math.min(w, h) * 0.3, Math.min(w, h) * 0.35, 32]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
                        </mesh>
                        <mesh position={[0, 0, 0.003]}>
                            <ringGeometry args={[Math.min(w, h) * 0.15, Math.min(w, h) * 0.2, 32]} />
                            <meshStandardMaterial color="#E8B923" roughness={0.5} metalness={0.3} />
                        </mesh>
                        <mesh position={[0, 0, 0.004]}>
                            <circleGeometry args={[Math.min(w, h) * 0.08, 32]} />
                            <meshStandardMaterial color="#DC143C" roughness={0.6} />
                        </mesh>
                    </>
                )}
                {/* Himalayan: Mountain silhouette */}
                {isHimalayan && (
                    <>
                        {/* Sky gradient (upper part) */}
                        <mesh position={[0, h * 0.15, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.4]} />
                            <meshStandardMaterial color="#87CEEB" roughness={0.8} />
                        </mesh>
                        {/* Mountain peaks */}
                        <mesh position={[0, -h * 0.1, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.35]} />
                            <meshStandardMaterial color="#F5F5F5" roughness={0.7} />
                        </mesh>
                        {/* Foreground */}
                        <mesh position={[0, -h * 0.3, 0.004]}>
                            <planeGeometry args={[w - 0.06, h * 0.2]} />
                            <meshStandardMaterial color="#228B22" roughness={0.8} />
                        </mesh>
                    </>
                )}
                {/* Nepali Village Scene */}
                {furniture.id.includes('nepali-village') && (
                    <>
                        {/* Sky */}
                        <mesh position={[0, h * 0.2, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.35]} />
                            <meshStandardMaterial color="#87CEEB" roughness={0.8} />
                        </mesh>
                        {/* Distant mountains */}
                        <mesh position={[0, h * 0.05, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.25]} />
                            <meshStandardMaterial color="#6B8E23" roughness={0.7} />
                        </mesh>
                        {/* Village houses - left */}
                        <mesh position={[-w * 0.25, -h * 0.1, 0.004]}>
                            <planeGeometry args={[w * 0.2, h * 0.25]} />
                            <meshStandardMaterial color="#CD853F" roughness={0.8} />
                        </mesh>
                        {/* Roof - left */}
                        <mesh position={[-w * 0.25, h * 0.02, 0.005]}>
                            <planeGeometry args={[w * 0.24, h * 0.1]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.7} />
                        </mesh>
                        {/* Village houses - right */}
                        <mesh position={[w * 0.2, -h * 0.15, 0.004]}>
                            <planeGeometry args={[w * 0.18, h * 0.22]} />
                            <meshStandardMaterial color="#DEB887" roughness={0.8} />
                        </mesh>
                        {/* Roof - right */}
                        <mesh position={[w * 0.2, -h * 0.02, 0.005]}>
                            <planeGeometry args={[w * 0.22, h * 0.08]} />
                            <meshStandardMaterial color="#A0522D" roughness={0.7} />
                        </mesh>
                        {/* Path */}
                        <mesh position={[0, -h * 0.3, 0.004]}>
                            <planeGeometry args={[w * 0.15, h * 0.2]} />
                            <meshStandardMaterial color="#D2691E" roughness={0.9} />
                        </mesh>
                        {/* Green fields */}
                        <mesh position={[0, -h * 0.35, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.15]} />
                            <meshStandardMaterial color="#228B22" roughness={0.8} />
                        </mesh>
                    </>
                )}
                {/* Village Life - Farmers scene */}
                {furniture.id.includes('village-life') && (
                    <>
                        {/* Golden sky - evening */}
                        <mesh position={[0, h * 0.25, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.3]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.7} />
                        </mesh>
                        {/* Rice paddies */}
                        <mesh position={[0, 0, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.35]} />
                            <meshStandardMaterial color="#9ACD32" roughness={0.8} />
                        </mesh>
                        {/* Farmer figure - left */}
                        <mesh position={[-w * 0.15, -h * 0.05, 0.005]}>
                            <circleGeometry args={[h * 0.06, 16]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.8} />
                        </mesh>
                        {/* Farmer body */}
                        <mesh position={[-w * 0.15, -h * 0.18, 0.004]}>
                            <planeGeometry args={[h * 0.08, h * 0.15]} />
                            <meshStandardMaterial color="#DC143C" roughness={0.8} />
                        </mesh>
                        {/* Buffalo */}
                        <mesh position={[w * 0.15, -h * 0.15, 0.005]}>
                            <planeGeometry args={[w * 0.2, h * 0.15]} />
                            <meshStandardMaterial color="#2F4F4F" roughness={0.8} />
                        </mesh>
                        {/* Ground */}
                        <mesh position={[0, -h * 0.35, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.15]} />
                            <meshStandardMaterial color="#8B7355" roughness={0.9} />
                        </mesh>
                    </>
                )}
                {/* Mount Everest */}
                {furniture.id.includes('everest') && (
                    <>
                        {/* Deep blue sky */}
                        <mesh position={[0, h * 0.2, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.4]} />
                            <meshStandardMaterial color="#1E3A5F" roughness={0.7} />
                        </mesh>
                        {/* Snow clouds */}
                        <mesh position={[-w * 0.2, h * 0.25, 0.003]}>
                            <circleGeometry args={[h * 0.08, 16]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.6} />
                        </mesh>
                        {/* Everest peak - main */}
                        <mesh position={[0, h * 0.05, 0.004]}>
                            <planeGeometry args={[w * 0.4, h * 0.5]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
                        </mesh>
                        {/* Rocky areas */}
                        <mesh position={[0, -h * 0.1, 0.005]}>
                            <planeGeometry args={[w * 0.35, h * 0.2]} />
                            <meshStandardMaterial color="#696969" roughness={0.8} />
                        </mesh>
                        {/* Surrounding peaks */}
                        <mesh position={[-w * 0.3, -h * 0.05, 0.003]}>
                            <planeGeometry args={[w * 0.25, h * 0.35]} />
                            <meshStandardMaterial color="#E8E8E8" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.3, -h * 0.08, 0.003]}>
                            <planeGeometry args={[w * 0.25, h * 0.32]} />
                            <meshStandardMaterial color="#DCDCDC" roughness={0.7} />
                        </mesh>
                        {/* Base camp area */}
                        <mesh position={[0, -h * 0.35, 0.004]}>
                            <planeGeometry args={[w - 0.06, h * 0.15]} />
                            <meshStandardMaterial color="#4A4A4A" roughness={0.9} />
                        </mesh>
                    </>
                )}
                {/* Annapurna Range */}
                {furniture.id.includes('annapurna') && (
                    <>
                        {/* Morning sky gradient */}
                        <mesh position={[0, h * 0.25, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.35]} />
                            <meshStandardMaterial color="#FFB6C1" roughness={0.7} />
                        </mesh>
                        {/* Multiple peaks panorama */}
                        <mesh position={[-w * 0.3, h * 0.0, 0.003]}>
                            <planeGeometry args={[w * 0.3, h * 0.4]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
                        </mesh>
                        <mesh position={[0, h * 0.05, 0.004]}>
                            <planeGeometry args={[w * 0.35, h * 0.45]} />
                            <meshStandardMaterial color="#F5F5F5" roughness={0.6} />
                        </mesh>
                        <mesh position={[w * 0.3, -h * 0.02, 0.003]}>
                            <planeGeometry args={[w * 0.3, h * 0.38]} />
                            <meshStandardMaterial color="#E8E8E8" roughness={0.6} />
                        </mesh>
                        {/* Green foothills */}
                        <mesh position={[0, -h * 0.25, 0.005]}>
                            <planeGeometry args={[w - 0.06, h * 0.2]} />
                            <meshStandardMaterial color="#2E8B57" roughness={0.8} />
                        </mesh>
                        {/* Lake reflection */}
                        <mesh position={[0, -h * 0.38, 0.006]}>
                            <planeGeometry args={[w * 0.6, h * 0.1]} />
                            <meshStandardMaterial color="#4169E1" roughness={0.3} metalness={0.4} />
                        </mesh>
                    </>
                )}
                {/* Paubha - Newari religious art */}
                {furniture.id.includes('paubha') && (
                    <>
                        {/* Deep red background */}
                        <mesh position={[0, 0, 0.002]}>
                            <planeGeometry args={[w - 0.06, h - 0.06]} />
                            <meshStandardMaterial color="#8B0000" roughness={0.8} />
                        </mesh>
                        {/* Gold border patterns */}
                        <mesh position={[0, (h - 0.06) / 2 - 0.015, 0.003]}>
                            <planeGeometry args={[w - 0.08, 0.025]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
                        </mesh>
                        <mesh position={[0, -(h - 0.06) / 2 + 0.015, 0.003]}>
                            <planeGeometry args={[w - 0.08, 0.025]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
                        </mesh>
                        {/* Central deity figure */}
                        <mesh position={[0, h * 0.05, 0.004]}>
                            <circleGeometry args={[Math.min(w, h) * 0.25, 32]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
                        </mesh>
                        {/* Deity body */}
                        <mesh position={[0, -h * 0.1, 0.005]}>
                            <planeGeometry args={[w * 0.35, h * 0.35]} />
                            <meshStandardMaterial color="#0000CD" roughness={0.7} />
                        </mesh>
                        {/* Decorative elements */}
                        <mesh position={[-w * 0.28, h * 0.2, 0.004]}>
                            <circleGeometry args={[h * 0.06, 16]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.4} />
                        </mesh>
                        <mesh position={[w * 0.28, h * 0.2, 0.004]}>
                            <circleGeometry args={[h * 0.06, 16]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.4} />
                        </mesh>
                    </>
                )}
                {/* Pashupatinath Temple */}
                {furniture.id.includes('pashupatinath') && (
                    <>
                        {/* Orange sky */}
                        <mesh position={[0, h * 0.2, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.3]} />
                            <meshStandardMaterial color="#FF8C00" roughness={0.7} />
                        </mesh>
                        {/* Temple pagoda structure */}
                        <mesh position={[0, h * 0.1, 0.003]}>
                            <planeGeometry args={[w * 0.35, h * 0.15]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
                        </mesh>
                        <mesh position={[0, -h * 0.02, 0.004]}>
                            <planeGeometry args={[w * 0.4, h * 0.12]} />
                            <meshStandardMaterial color="#CD853F" roughness={0.6} />
                        </mesh>
                        <mesh position={[0, -h * 0.12, 0.005]}>
                            <planeGeometry args={[w * 0.45, h * 0.1]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.7} />
                        </mesh>
                        {/* Temple base */}
                        <mesh position={[0, -h * 0.25, 0.004]}>
                            <planeGeometry args={[w * 0.5, h * 0.15]} />
                            <meshStandardMaterial color="#A9A9A9" roughness={0.8} />
                        </mesh>
                        {/* Bagmati river */}
                        <mesh position={[0, -h * 0.38, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.12]} />
                            <meshStandardMaterial color="#4682B4" roughness={0.4} />
                        </mesh>
                    </>
                )}
                {/* Living Goddess Kumari */}
                {furniture.id.includes('kumari') && (
                    <>
                        {/* Deep red background */}
                        <mesh position={[0, 0, 0.002]}>
                            <planeGeometry args={[w - 0.06, h - 0.06]} />
                            <meshStandardMaterial color="#8B0000" roughness={0.8} />
                        </mesh>
                        {/* Gold ornate frame inner */}
                        <mesh position={[0, 0, 0.003]}>
                            <ringGeometry args={[Math.min(w, h) * 0.35, Math.min(w, h) * 0.38, 32]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
                        </mesh>
                        {/* Face */}
                        <mesh position={[0, h * 0.1, 0.004]}>
                            <circleGeometry args={[h * 0.12, 32]} />
                            <meshStandardMaterial color="#DEB887" roughness={0.7} />
                        </mesh>
                        {/* Hair with crown */}
                        <mesh position={[0, h * 0.22, 0.005]}>
                            <planeGeometry args={[w * 0.25, h * 0.12]} />
                            <meshStandardMaterial color="#1C1C1C" roughness={0.9} />
                        </mesh>
                        {/* Crown/headdress */}
                        <mesh position={[0, h * 0.28, 0.006]}>
                            <planeGeometry args={[w * 0.2, h * 0.08]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.6} />
                        </mesh>
                        {/* Third eye */}
                        <mesh position={[0, h * 0.15, 0.006]}>
                            <circleGeometry args={[h * 0.02, 16]} />
                            <meshStandardMaterial color="#FF0000" roughness={0.6} />
                        </mesh>
                        {/* Traditional dress */}
                        <mesh position={[0, -h * 0.15, 0.004]}>
                            <planeGeometry args={[w * 0.35, h * 0.35]} />
                            <meshStandardMaterial color="#FF0000" roughness={0.7} />
                        </mesh>
                        {/* Gold jewelry */}
                        <mesh position={[0, -h * 0.02, 0.005]}>
                            <planeGeometry args={[w * 0.25, h * 0.05]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
                        </mesh>
                    </>
                )}
                {/* Rice Terraces */}
                {furniture.id.includes('rice-fields') && (
                    <>
                        {/* Blue sky */}
                        <mesh position={[0, h * 0.25, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.3]} />
                            <meshStandardMaterial color="#87CEEB" roughness={0.8} />
                        </mesh>
                        {/* Terraced layers */}
                        <mesh position={[0, h * 0.08, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.12]} />
                            <meshStandardMaterial color="#90EE90" roughness={0.8} />
                        </mesh>
                        <mesh position={[0, -h * 0.02, 0.004]}>
                            <planeGeometry args={[w - 0.06, h * 0.1]} />
                            <meshStandardMaterial color="#32CD32" roughness={0.8} />
                        </mesh>
                        <mesh position={[0, -h * 0.12, 0.005]}>
                            <planeGeometry args={[w - 0.06, h * 0.1]} />
                            <meshStandardMaterial color="#228B22" roughness={0.8} />
                        </mesh>
                        <mesh position={[0, -h * 0.22, 0.006]}>
                            <planeGeometry args={[w - 0.06, h * 0.1]} />
                            <meshStandardMaterial color="#006400" roughness={0.8} />
                        </mesh>
                        {/* Water reflection in paddies */}
                        <mesh position={[-w * 0.2, -h * 0.08, 0.007]}>
                            <planeGeometry args={[w * 0.15, h * 0.06]} />
                            <meshStandardMaterial color="#4682B4" roughness={0.3} transparent opacity={0.6} />
                        </mesh>
                        <mesh position={[w * 0.15, -h * 0.18, 0.007]}>
                            <planeGeometry args={[w * 0.12, h * 0.05]} />
                            <meshStandardMaterial color="#4682B4" roughness={0.3} transparent opacity={0.6} />
                        </mesh>
                        {/* Farmer */}
                        <mesh position={[w * 0.25, -h * 0.05, 0.008]}>
                            <circleGeometry args={[h * 0.04, 16]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.8} />
                        </mesh>
                    </>
                )}
                {/* Kathmandu Durbar Square */}
                {furniture.id.includes('kathmandu-durbar') && (
                    <>
                        {/* Sky */}
                        <mesh position={[0, h * 0.25, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.3]} />
                            <meshStandardMaterial color="#87CEEB" roughness={0.8} />
                        </mesh>
                        {/* Temple 1 - Pagoda */}
                        <mesh position={[-w * 0.25, h * 0.05, 0.003]}>
                            <planeGeometry args={[w * 0.22, h * 0.35]} />
                            <meshStandardMaterial color="#8B0000" roughness={0.7} />
                        </mesh>
                        <mesh position={[-w * 0.25, h * 0.18, 0.004]}>
                            <planeGeometry args={[w * 0.18, h * 0.08]} />
                            <meshStandardMaterial color="#CD853F" roughness={0.6} />
                        </mesh>
                        {/* Temple 2 */}
                        <mesh position={[w * 0.15, -h * 0.02, 0.003]}>
                            <planeGeometry args={[w * 0.25, h * 0.4]} />
                            <meshStandardMaterial color="#A0522D" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.15, h * 0.15, 0.004]}>
                            <planeGeometry args={[w * 0.2, h * 0.1]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.6} />
                        </mesh>
                        {/* Courtyard/plaza */}
                        <mesh position={[0, -h * 0.32, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.18]} />
                            <meshStandardMaterial color="#D2691E" roughness={0.9} />
                        </mesh>
                        {/* People */}
                        <mesh position={[-w * 0.1, -h * 0.28, 0.005]}>
                            <circleGeometry args={[h * 0.025, 12]} />
                            <meshStandardMaterial color="#DC143C" roughness={0.8} />
                        </mesh>
                        <mesh position={[w * 0.05, -h * 0.3, 0.005]}>
                            <circleGeometry args={[h * 0.025, 12]} />
                            <meshStandardMaterial color="#4169E1" roughness={0.8} />
                        </mesh>
                    </>
                )}
                {/* Traditional Newari Window */}
                {furniture.id.includes('newari-window') && (
                    <>
                        {/* Brick wall background */}
                        <mesh position={[0, 0, 0.002]}>
                            <planeGeometry args={[w - 0.06, h - 0.06]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.9} />
                        </mesh>
                        {/* Outer carved frame */}
                        <mesh position={[0, 0, 0.003]}>
                            <ringGeometry args={[Math.min(w, h) * 0.28, Math.min(w, h) * 0.35, 32]} />
                            <meshStandardMaterial color="#4A2500" roughness={0.6} />
                        </mesh>
                        {/* Inner frame detail */}
                        <mesh position={[0, 0, 0.004]}>
                            <ringGeometry args={[Math.min(w, h) * 0.22, Math.min(w, h) * 0.26, 32]} />
                            <meshStandardMaterial color="#6B3800" roughness={0.5} />
                        </mesh>
                        {/* Window opening */}
                        <mesh position={[0, 0, 0.005]}>
                            <circleGeometry args={[Math.min(w, h) * 0.2, 32]} />
                            <meshStandardMaterial color="#1C1C1C" roughness={0.9} />
                        </mesh>
                        {/* Lattice pattern */}
                        <mesh position={[0, 0, 0.006]}>
                            <ringGeometry args={[Math.min(w, h) * 0.1, Math.min(w, h) * 0.12, 8]} />
                            <meshStandardMaterial color="#4A2500" roughness={0.6} />
                        </mesh>
                    </>
                )}
                {/* Prayer Flags */}
                {furniture.id.includes('prayer-flags') && (
                    <>
                        {/* Mountain background */}
                        <mesh position={[0, h * 0.1, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.5]} />
                            <meshStandardMaterial color="#87CEEB" roughness={0.7} />
                        </mesh>
                        <mesh position={[0, -h * 0.05, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.3]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
                        </mesh>
                        {/* Prayer flag string */}
                        <mesh position={[0, h * 0.2, 0.004]}>
                            <planeGeometry args={[w - 0.1, h * 0.01]} />
                            <meshStandardMaterial color="#2F2F2F" roughness={0.8} />
                        </mesh>
                        {/* Flag colors - Blue */}
                        <mesh position={[-w * 0.32, h * 0.12, 0.005]}>
                            <planeGeometry args={[w * 0.12, h * 0.18]} />
                            <meshStandardMaterial color="#0000FF" roughness={0.8} />
                        </mesh>
                        {/* White */}
                        <mesh position={[-w * 0.16, h * 0.12, 0.005]}>
                            <planeGeometry args={[w * 0.12, h * 0.18]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
                        </mesh>
                        {/* Red */}
                        <mesh position={[0, h * 0.12, 0.005]}>
                            <planeGeometry args={[w * 0.12, h * 0.18]} />
                            <meshStandardMaterial color="#FF0000" roughness={0.8} />
                        </mesh>
                        {/* Green */}
                        <mesh position={[w * 0.16, h * 0.12, 0.005]}>
                            <planeGeometry args={[w * 0.12, h * 0.18]} />
                            <meshStandardMaterial color="#00FF00" roughness={0.8} />
                        </mesh>
                        {/* Yellow */}
                        <mesh position={[w * 0.32, h * 0.12, 0.005]}>
                            <planeGeometry args={[w * 0.12, h * 0.18]} />
                            <meshStandardMaterial color="#FFFF00" roughness={0.8} />
                        </mesh>
                        {/* Ground */}
                        <mesh position={[0, -h * 0.35, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.15]} />
                            <meshStandardMaterial color="#4A4A4A" roughness={0.9} />
                        </mesh>
                    </>
                )}
                {/* Mithila Art */}
                {furniture.id.includes('mithila') && (
                    <>
                        {/* Cream background */}
                        <mesh position={[0, 0, 0.002]}>
                            <planeGeometry args={[w - 0.06, h - 0.06]} />
                            <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
                        </mesh>
                        {/* Central fish motif (common in Mithila) */}
                        <mesh position={[0, 0, 0.003]}>
                            <circleGeometry args={[Math.min(w, h) * 0.2, 32]} />
                            <meshStandardMaterial color="#FF4500" roughness={0.7} />
                        </mesh>
                        <mesh position={[0, 0, 0.004]}>
                            <circleGeometry args={[Math.min(w, h) * 0.12, 32]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.6} />
                        </mesh>
                        {/* Border patterns */}
                        <mesh position={[0, (h - 0.06) / 2 - 0.025, 0.003]}>
                            <planeGeometry args={[w - 0.08, 0.04]} />
                            <meshStandardMaterial color="#FF0000" roughness={0.7} />
                        </mesh>
                        <mesh position={[0, -(h - 0.06) / 2 + 0.025, 0.003]}>
                            <planeGeometry args={[w - 0.08, 0.04]} />
                            <meshStandardMaterial color="#FF0000" roughness={0.7} />
                        </mesh>
                        {/* Corner flowers */}
                        <mesh position={[-w * 0.3, h * 0.3, 0.004]}>
                            <circleGeometry args={[h * 0.08, 16]} />
                            <meshStandardMaterial color="#FF69B4" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.3, h * 0.3, 0.004]}>
                            <circleGeometry args={[h * 0.08, 16]} />
                            <meshStandardMaterial color="#FF69B4" roughness={0.7} />
                        </mesh>
                        <mesh position={[-w * 0.3, -h * 0.3, 0.004]}>
                            <circleGeometry args={[h * 0.08, 16]} />
                            <meshStandardMaterial color="#32CD32" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.3, -h * 0.3, 0.004]}>
                            <circleGeometry args={[h * 0.08, 16]} />
                            <meshStandardMaterial color="#32CD32" roughness={0.7} />
                        </mesh>
                        {/* Peacock figures */}
                        <mesh position={[-w * 0.15, h * 0.15, 0.004]}>
                            <circleGeometry args={[h * 0.05, 16]} />
                            <meshStandardMaterial color="#0000CD" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.15, -h * 0.15, 0.004]}>
                            <circleGeometry args={[h * 0.05, 16]} />
                            <meshStandardMaterial color="#0000CD" roughness={0.7} />
                        </mesh>
                    </>
                )}
                {/* Sherpa Mountain Life */}
                {furniture.id.includes('sherpa-life') && (
                    <>
                        {/* Sky */}
                        <mesh position={[0, h * 0.2, 0.002]}>
                            <planeGeometry args={[w - 0.06, h * 0.35]} />
                            <meshStandardMaterial color="#4682B4" roughness={0.7} />
                        </mesh>
                        {/* Snowy mountains */}
                        <mesh position={[0, h * 0.02, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.3]} />
                            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
                        </mesh>
                        {/* Sherpa house */}
                        <mesh position={[-w * 0.2, -h * 0.15, 0.004]}>
                            <planeGeometry args={[w * 0.25, h * 0.2]} />
                            <meshStandardMaterial color="#808080" roughness={0.8} />
                        </mesh>
                        {/* Roof */}
                        <mesh position={[-w * 0.2, -h * 0.03, 0.005]}>
                            <planeGeometry args={[w * 0.28, h * 0.06]} />
                            <meshStandardMaterial color="#2F4F4F" roughness={0.8} />
                        </mesh>
                        {/* Yak */}
                        <mesh position={[w * 0.2, -h * 0.2, 0.004]}>
                            <planeGeometry args={[w * 0.18, h * 0.12]} />
                            <meshStandardMaterial color="#1C1C1C" roughness={0.9} />
                        </mesh>
                        {/* Sherpa figure */}
                        <mesh position={[w * 0.05, -h * 0.18, 0.005]}>
                            <circleGeometry args={[h * 0.05, 16]} />
                            <meshStandardMaterial color="#DEB887" roughness={0.8} />
                        </mesh>
                        <mesh position={[w * 0.05, -h * 0.28, 0.004]}>
                            <planeGeometry args={[h * 0.08, h * 0.12]} />
                            <meshStandardMaterial color="#8B0000" roughness={0.8} />
                        </mesh>
                        {/* Ground */}
                        <mesh position={[0, -h * 0.38, 0.003]}>
                            <planeGeometry args={[w - 0.06, h * 0.1]} />
                            <meshStandardMaterial color="#696969" roughness={0.9} />
                        </mesh>
                    </>
                )}
                {/* Peacock Window - Famous Bhaktapur */}
                {furniture.id.includes('peacock-window') && (
                    <>
                        {/* Dark wood background */}
                        <mesh position={[0, 0, 0.002]}>
                            <planeGeometry args={[w - 0.06, h - 0.06]} />
                            <meshStandardMaterial color="#3D2314" roughness={0.7} />
                        </mesh>
                        {/* Outer ornate frame */}
                        <mesh position={[0, 0, 0.003]}>
                            <ringGeometry args={[Math.min(w, h) * 0.32, Math.min(w, h) * 0.38, 32]} />
                            <meshStandardMaterial color="#5D3A1A" roughness={0.6} />
                        </mesh>
                        {/* Peacock body - center */}
                        <mesh position={[0, -h * 0.05, 0.005]}>
                            <circleGeometry args={[Math.min(w, h) * 0.12, 32]} />
                            <meshStandardMaterial color="#006400" roughness={0.7} />
                        </mesh>
                        {/* Peacock head */}
                        <mesh position={[0, h * 0.08, 0.006]}>
                            <circleGeometry args={[Math.min(w, h) * 0.06, 24]} />
                            <meshStandardMaterial color="#0000CD" roughness={0.7} />
                        </mesh>
                        {/* Crown feathers */}
                        <mesh position={[0, h * 0.15, 0.007]}>
                            <planeGeometry args={[w * 0.08, h * 0.06]} />
                            <meshStandardMaterial color="#006400" roughness={0.7} />
                        </mesh>
                        {/* Tail feathers - fanned out */}
                        <mesh position={[-w * 0.15, h * 0.1, 0.004]}>
                            <circleGeometry args={[h * 0.08, 24]} />
                            <meshStandardMaterial color="#006400" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.15, h * 0.1, 0.004]}>
                            <circleGeometry args={[h * 0.08, 24]} />
                            <meshStandardMaterial color="#006400" roughness={0.7} />
                        </mesh>
                        <mesh position={[-w * 0.22, h * 0.0, 0.004]}>
                            <circleGeometry args={[h * 0.07, 24]} />
                            <meshStandardMaterial color="#0000CD" roughness={0.7} />
                        </mesh>
                        <mesh position={[w * 0.22, h * 0.0, 0.004]}>
                            <circleGeometry args={[h * 0.07, 24]} />
                            <meshStandardMaterial color="#0000CD" roughness={0.7} />
                        </mesh>
                        {/* Eye spots on feathers */}
                        <mesh position={[-w * 0.15, h * 0.1, 0.005]}>
                            <circleGeometry args={[h * 0.025, 16]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
                        </mesh>
                        <mesh position={[w * 0.15, h * 0.1, 0.005]}>
                            <circleGeometry args={[h * 0.025, 16]} />
                            <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
                        </mesh>
                        {/* Intricate carved border */}
                        <mesh position={[0, (h - 0.06) / 2 - 0.02, 0.004]}>
                            <planeGeometry args={[w - 0.08, 0.03]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.6} />
                        </mesh>
                        <mesh position={[0, -(h - 0.06) / 2 + 0.02, 0.004]}>
                            <planeGeometry args={[w - 0.08, 0.03]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.6} />
                        </mesh>
                    </>
                )}
            </group>
        );
    }
    
    if (furniture.id.includes('curtain')) {
        return (
            <group position={[position[0], 0, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
                {/* Curtain rod */}
                <mesh position={[0, h + 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.015, 0.015, w + 0.1, 8]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Curtain fabric */}
                <mesh position={[0, h / 2, 0]} castShadow>
                    <boxGeometry args={[w, h, 0.03]} />
                    <meshStandardMaterial color={furniture.color} side={THREE.DoubleSide} roughness={0.9} />
                </mesh>
            </group>
        );
    }
    
    // Default box for other decor
    return (
        <mesh position={[position[0], h / 2, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={furniture.color} roughness={0.7} />
        </mesh>
    );
}

// Generic Box Fallback
function GenericFurniture3D({ furniture, position, rotation }: Furniture3DProps) {
    return (
        <mesh position={[position[0], furniture.height / 2, position[2]]} rotation={[0, (rotation * Math.PI) / 180, 0]} castShadow receiveShadow>
            <boxGeometry args={[furniture.width, furniture.height, furniture.length]} />
            <meshStandardMaterial color={furniture.color} roughness={0.7} />
        </mesh>
    );
}

// Furniture Renderer - picks correct 3D component based on category
function Furniture3DRenderer({ furniture, position, rotation }: Furniture3DProps) {
    const category = furniture.category.toLowerCase();
    const id = furniture.id.toLowerCase();
    
    // Seating
    if (category === 'seating') {
        if (id.includes('sofa') || id.includes('loveseat')) {
            return <Sofa3D furniture={furniture} position={position} rotation={rotation} />;
        }
        return <Chair3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Tables
    if (category === 'tables') {
        return <Table3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Beds
    if (category === 'beds') {
        return <Bed3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Storage
    if (category === 'storage') {
        return <Storage3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Bathroom
    if (category === 'bathroom') {
        if (id.includes('bathtub')) {
            return <Bathtub3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('toilet')) {
            return <Toilet3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('shower')) {
            return <Shower3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('towel-rack') || id.includes('towel-bar')) {
            return <TowelRack3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('cabinet') || id.includes('medicine')) {
            return <BathroomCabinet3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('mirror')) {
            return <BathroomMirror3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('bidet')) {
            return <Bidet3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('shelf')) {
            return <BathroomShelf3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('toilet-paper')) {
            return <ToiletPaperHolder3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('laundry')) {
            return <LaundryBasket3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('stool')) {
            return <BathroomStool3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('scale')) {
            return <BathroomScale3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('soap-dispenser')) {
            return <SoapDispenser3D furniture={furniture} position={position} rotation={rotation} />;
        }
        if (id.includes('bath-mat')) {
            return <BathMat3D furniture={furniture} position={position} rotation={rotation} />;
        }
        return <Vanity3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Kitchen
    if (category === 'kitchen') {
        return <KitchenIsland3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Lighting
    if (category === 'lighting') {
        return <Light3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Decor
    if (category === 'decor') {
        if (id.includes('plant')) {
            return <Plant3D furniture={furniture} position={position} rotation={rotation} />;
        }
        return <Decor3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Doors
    if (category === 'doors') {
        if (id.includes('window')) {
            return <Window3D furniture={furniture} position={position} rotation={rotation} />;
        }
        return <Door3D furniture={furniture} position={position} rotation={rotation} />;
    }
    
    // Fallback
    return <GenericFurniture3D furniture={furniture} position={position} rotation={rotation} />;
}

function ThreeViewport({ room, placements, catalog }: { room: InteriorRoom | null; placements: FurniturePlacement[]; catalog: InteriorCatalog | null }) {
    if (!room) return <div className="h-full w-full bg-slate-900 flex items-center justify-center text-slate-500">Select a room to see 3D view</div>
    
    // Get furniture details from catalog
    const getFurnitureById = (furnitureId: string) => {
        return catalog?.furniture.find(f => f.id === furnitureId) || null;
    };
    
    const floorColor = room.floorColor || '#d4a574'
    const wallColor = room.wallColor || '#FAF9F6'
    
    // Find all doors and windows to create wall openings
    const doorWindowPlacements = placements.filter(p => {
        const furniture = getFurnitureById(p.furnitureId);
        // Only real doors/windows should cut openings in walls
        return furniture?.category === 'Doors';
    }).map(p => {
        const furniture = getFurnitureById(p.furnitureId)!;
        const isWindow = furniture.id.toLowerCase().includes('window');
        return {
            ...p,
            furniture,
            isWindow,
            width: furniture.width || 0.9,
            height: furniture.height || (isWindow ? 1.2 : 2.1)
        };
    });
    
    // Helper to render wall segments with openings
    const renderWallWithOpenings = (
        wall: 'back' | 'front' | 'left' | 'right',
        wallLength: number,
        wallHeight: number,
        wallThickness: number,
        position: [number, number, number],
        isVertical: boolean
    ) => {
        // Find openings on this wall - use <= 0.05 and >= 0.95 thresholds
        const openings = doorWindowPlacements.filter(p => {
            const nearTop = p.offsetY <= 0.05;
            const nearBottom = p.offsetY >= 0.95;
            const nearLeft = p.offsetX <= 0.05;
            const nearRight = p.offsetX >= 0.95;
            
            if (wall === 'back' && nearTop) return true;
            if (wall === 'front' && nearBottom) return true;
            if (wall === 'left' && nearLeft) return true;
            if (wall === 'right' && nearRight) return true;
            return false;
        }).map(p => {
            // Calculate position along the wall (0 to 1)
            const posAlongWall = isVertical ? p.offsetY : p.offsetX;
            // Convert to actual position
            const centerPos = (posAlongWall - 0.5) * wallLength;
            return {
                center: centerPos,
                width: p.width + 0.12, // Add frame width
                height: p.height,
                isWindow: p.isWindow,
                sillHeight: p.isWindow ? 0.9 : 0
            };
        }).sort((a, b) => a.center - b.center);
        
        if (openings.length === 0) {
            // No openings, render solid wall
            return (
                <mesh position={position} receiveShadow>
                    <boxGeometry args={isVertical ? [wallThickness, wallHeight, wallLength] : [wallLength, wallHeight, wallThickness]} />
                    <meshStandardMaterial color={wallColor} roughness={0.9} />
                </mesh>
            );
        }
        
        // Render wall segments around openings
        const segments: React.ReactElement[] = [];
        let lastEnd = -wallLength / 2;
        
        openings.forEach((opening, idx) => {
            const openingStart = opening.center - opening.width / 2;
            const openingEnd = opening.center + opening.width / 2;
            
            // Wall segment before this opening
            if (openingStart > lastEnd + 0.01) {
                const segmentWidth = openingStart - lastEnd;
                const segmentCenter = (lastEnd + openingStart) / 2;
                
                if (isVertical) {
                    segments.push(
                        <mesh key={`wall-${wall}-seg-${idx}-before`} position={[position[0], position[1], segmentCenter]} receiveShadow>
                            <boxGeometry args={[wallThickness, wallHeight, segmentWidth]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    );
                } else {
                    segments.push(
                        <mesh key={`wall-${wall}-seg-${idx}-before`} position={[segmentCenter, position[1], position[2]]} receiveShadow>
                            <boxGeometry args={[segmentWidth, wallHeight, wallThickness]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    );
                }
            }
            
            // Wall segment above the opening (for doors that don't reach ceiling, or above windows)
            const topOfOpening = opening.sillHeight + opening.height;
            if (topOfOpening < wallHeight) {
                const aboveHeight = wallHeight - topOfOpening;
                const aboveCenter = topOfOpening + aboveHeight / 2;
                
                if (isVertical) {
                    segments.push(
                        <mesh key={`wall-${wall}-above-${idx}`} position={[position[0], aboveCenter, opening.center]} receiveShadow>
                            <boxGeometry args={[wallThickness, aboveHeight, opening.width]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    );
                } else {
                    segments.push(
                        <mesh key={`wall-${wall}-above-${idx}`} position={[opening.center, aboveCenter, position[2]]} receiveShadow>
                            <boxGeometry args={[opening.width, aboveHeight, wallThickness]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    );
                }
            }
            
            // Wall segment below windows (sill area)
            if (opening.isWindow && opening.sillHeight > 0) {
                if (isVertical) {
                    segments.push(
                        <mesh key={`wall-${wall}-below-${idx}`} position={[position[0], opening.sillHeight / 2, opening.center]} receiveShadow>
                            <boxGeometry args={[wallThickness, opening.sillHeight, opening.width]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    );
                } else {
                    segments.push(
                        <mesh key={`wall-${wall}-below-${idx}`} position={[opening.center, opening.sillHeight / 2, position[2]]} receiveShadow>
                            <boxGeometry args={[opening.width, opening.sillHeight, wallThickness]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    );
                }
            }
            
            lastEnd = openingEnd;
        });
        
        // Wall segment after last opening
        if (lastEnd < wallLength / 2 - 0.01) {
            const segmentWidth = wallLength / 2 - lastEnd;
            const segmentCenter = (lastEnd + wallLength / 2) / 2;
            
            if (isVertical) {
                segments.push(
                    <mesh key={`wall-${wall}-seg-end`} position={[position[0], position[1], segmentCenter]} receiveShadow>
                        <boxGeometry args={[wallThickness, wallHeight, segmentWidth]} />
                        <meshStandardMaterial color={wallColor} roughness={0.9} />
                    </mesh>
                );
            } else {
                segments.push(
                    <mesh key={`wall-${wall}-seg-end`} position={[segmentCenter, position[1], position[2]]} receiveShadow>
                        <boxGeometry args={[segmentWidth, wallHeight, wallThickness]} />
                        <meshStandardMaterial color={wallColor} roughness={0.9} />
                    </mesh>
                );
            }
        }
        
        return <>{segments}</>;
    };
    
    return (
        <Canvas shadows className="h-full w-full">
            <Suspense fallback={null}>
                <ambientLight intensity={0.4} />
                <hemisphereLight intensity={0.3} color="#fef3c7" groundColor={floorColor} />
                <Sky sunPosition={[100, 20, 100]} />
                <directionalLight 
                    position={[30, 45, 25]} 
                    intensity={0.8} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-far={100}
                    shadow-camera-left={-20}
                    shadow-camera-right={20}
                    shadow-camera-top={20}
                    shadow-camera-bottom={-20}
                />
                <group position={[0, 0, 0]}>
                    {/* Floor with custom color */}
                    <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[room.width, room.length]} />
                        <meshStandardMaterial color={floorColor} roughness={0.8} />
                    </mesh>
                    {/* Floor planks pattern (for wood-like colors) */}
                    {floorColor.match(/#[89abcd]/i) && Array.from({ length: Math.ceil(room.width / 0.15) }).map((_, i) => (
                        <mesh key={`plank-${i}`} position={[-room.width / 2 + i * 0.15 + 0.075, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[0.01, room.length]} />
                            <meshStandardMaterial color="#5D4037" opacity={0.3} transparent />
                        </mesh>
                    ))}
                    
                    {/* Walls with openings for doors/windows */}
                    {renderWallWithOpenings('back', room.width, 3, 0.12, [0, 1.5, -room.length / 2], false)}
                    {renderWallWithOpenings('front', room.width, 3, 0.12, [0, 1.5, room.length / 2], false)}
                    {renderWallWithOpenings('left', room.length, 3, 0.12, [-room.width / 2, 1.5, 0], true)}
                    {renderWallWithOpenings('right', room.length, 3, 0.12, [room.width / 2, 1.5, 0], true)}
                    
                    {/* Baseboards */}
                    <mesh position={[0, 0.05, -room.length / 2 + 0.07]}>
                        <boxGeometry args={[room.width - 0.1, 0.1, 0.02]} />
                        <meshStandardMaterial color="#f5f5f4" />
                    </mesh>
                    <mesh position={[0, 0.05, room.length / 2 - 0.07]}>
                        <boxGeometry args={[room.width - 0.1, 0.1, 0.02]} />
                        <meshStandardMaterial color="#f5f5f4" />
                    </mesh>
                    <mesh position={[-room.width / 2 + 0.07, 0.05, 0]}>
                        <boxGeometry args={[0.02, 0.1, room.length - 0.1]} />
                        <meshStandardMaterial color="#f5f5f4" />
                    </mesh>
                    <mesh position={[room.width / 2 - 0.07, 0.05, 0]}>
                        <boxGeometry args={[0.02, 0.1, room.length - 0.1]} />
                        <meshStandardMaterial color="#f5f5f4" />
                    </mesh>
                    
                    {/* Furniture - rendered with proper 3D models */}
                    {placements.map(p => {
                        const furniture = getFurnitureById(p.furnitureId);
                        if (!furniture) return null;
                        
                        let x = (p.offsetX - 0.5) * room.width;
                        let z = (p.offsetY - 0.5) * room.length;
                        
                        // For wall-mounted items, position exactly at wall
                        const isWallMounted = isWallMountedFurniture(furniture);
                        const WALL_THICKNESS = 0.06; // Half of wall thickness (0.12/2)
                        if (isWallMounted) {
                            // Determine which wall based on offset - use <= 0.05 and >= 0.95 thresholds
                            const nearTop = p.offsetY <= 0.05;
                            const nearBottom = p.offsetY >= 0.95;
                            const nearLeft = p.offsetX <= 0.05;
                            const nearRight = p.offsetX >= 0.95;
                            
                            if (nearTop) {
                                z = -room.length / 2 + WALL_THICKNESS; // Back wall - align with wall center
                            } else if (nearBottom) {
                                z = room.length / 2 - WALL_THICKNESS; // Front wall
                            } else if (nearLeft) {
                                x = -room.width / 2 + WALL_THICKNESS; // Left wall
                            } else if (nearRight) {
                                x = room.width / 2 - WALL_THICKNESS; // Right wall
                            }
                        }
                        
                        return (
                            <Furniture3DRenderer 
                                key={p.id}
                                furniture={furniture}
                                position={[x, 0, z]}
                                rotation={p.rotation || 0}
                            />
                        );
                    })}
                </group>
                <PerspectiveCamera makeDefault position={[room.width * 1.2, room.width * 0.9, room.length * 1.2]} fov={45} />
                <OrbitControls 
                    target={[0, 0.5, 0]} 
                    maxPolarAngle={Math.PI / 2.1}
                    minDistance={3}
                    maxDistance={30}
                />
            </Suspense>
        </Canvas>
    )
}
