<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DesignFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'designable_id',
        'designable_type',
        'file_type',
        'title',
        'file_path',
        'file_extension',
        'file_size',
        'sort_order',
    ];

    /**
     * Get the parent designable model (HomeDesign, FloorDesign, or InteriorDesign).
     */
    public function designable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * File type options.
     */
    public static function fileTypeOptions(): array
    {
        return [
            '2d_plan' => '2D Floor Plan',
            '3d_render' => '3D Render/Image',
            '3d_model' => '3D Model File',
            'video' => 'Video/Walkthrough',
            'cad' => 'CAD File (DWG/DXF)',
            'pdf' => 'PDF Document',
            'sketchup' => 'SketchUp File',
            'revit' => 'Revit File',
            'other' => 'Other',
        ];
    }

    /**
     * Get human-readable file size.
     */
    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes === null) {
            return 'Unknown';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
