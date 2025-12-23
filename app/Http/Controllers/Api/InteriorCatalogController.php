<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InteriorDefaultRoom;
use App\Models\InteriorFurnitureItem;
use App\Models\InteriorInspiration;
use App\Models\InteriorLightingPreset;
use App\Models\InteriorMaterial;
use App\Models\InteriorRoomTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InteriorCatalogController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $materials = InteriorMaterial::active()->orderBy('name')->get();
        $lighting = InteriorLightingPreset::active()->orderBy('name')->get();
        $furniture = InteriorFurnitureItem::active()->orderBy('name')->get();
        $roomTemplates = InteriorRoomTemplate::with(['defaultMaterial', 'defaultLighting'])
            ->active()
            ->orderBy('name')
            ->get();
        $defaultRooms = InteriorDefaultRoom::with('roomTemplate')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        $inspiration = InteriorInspiration::active()->orderBy('label')->get();

        $materialsPayload = $materials->map(fn (InteriorMaterial $material) => [
            'id' => $material->slug,
            'name' => $material->name,
            'floor' => $material->floor_color,
            'wall' => $material->wall_color,
            'accent' => $material->accent_color,
            'lighting' => $material->lighting_color,
            'description' => $material->description,
            'mood' => Str::title($material->mood ?? ''),
            'appliesTo' => $material->applies_to ?? [],
        ])->values();

        $lightingPayload = $lighting->map(fn (InteriorLightingPreset $preset) => [
            'id' => $preset->slug,
            'name' => $preset->name,
            'temperature' => $preset->temperature,
            'brightness' => $preset->brightness,
            'tint' => $preset->tint,
            'description' => $preset->description,
        ])->values();

        $furniturePayload = $furniture->map(fn (InteriorFurnitureItem $item) => [
            'id' => $item->slug,
            'name' => $item->name,
            'category' => $item->category,
            'style' => $item->style,
            'width' => $item->width !== null ? (float) $item->width : null,
            'length' => $item->length !== null ? (float) $item->length : null,
            'height' => $item->height !== null ? (float) $item->height : null,
            'price' => $item->price,
            'suitableFor' => $item->suitable_for ?? [],
            'color' => $item->primary_color,
            'finish' => $item->finish,
            'thumbnail' => $item->thumbnail_path,
            'model' => $item->model_path,
        ])->values();

        $templatesPayload = $roomTemplates->mapWithKeys(function (InteriorRoomTemplate $template) {
            $defaultMaterialSlug = optional($template->defaultMaterial)->slug;
            $defaultLightingSlug = optional($template->defaultLighting)->slug;

            return [
                $template->slug => [
                    'id' => $template->slug,
                    'name' => $template->name,
                    'width' => $template->width !== null ? (float) $template->width : null,
                    'length' => $template->length !== null ? (float) $template->length : null,
                    'level' => $template->level,
                    'description' => $template->description,
                    'tags' => $template->tags ?? [],
                    'defaultMaterialId' => $defaultMaterialSlug,
                    'defaultLightingId' => $defaultLightingSlug,
                ],
            ];
        });

        $defaultRoomsPayload = $defaultRooms
            ->filter(fn (InteriorDefaultRoom $room) => $room->roomTemplate !== null && $room->roomTemplate->is_active)
            ->map(fn (InteriorDefaultRoom $room) => [
                'templateId' => $room->roomTemplate?->slug,
                'name' => $room->display_name,
            ])
            ->values();

        $inspirationPayload = $inspiration->map(fn (InteriorInspiration $item) => [
            'id' => $item->slug,
            'label' => $item->label,
            'category' => $item->category,
            'swatch' => $item->swatch,
            'note' => $item->note,
            'asset' => $item->asset_path,
            'sourceUrl' => $item->source_url,
        ])->values();

        return response()->json([
            'version' => now()->toAtomString(),
            'materials' => $materialsPayload,
            'lighting' => $lightingPayload,
            'furniture' => $furniturePayload,
            'templates' => $templatesPayload,
            'inspiration' => $inspirationPayload,
            'defaultRooms' => $defaultRoomsPayload,
        ]);
    }
}
