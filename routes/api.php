<?php

use App\Http\Controllers\Api\FurnitureController;
use App\Http\Controllers\Api\InteriorCatalogController;
use App\Http\Controllers\FloorPlanProjectController;
use App\Http\Controllers\InteriorDesignProjectController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('furniture', [FurnitureController::class, 'index'])
    ->name('api.furniture.index');

// Wishlist API (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('wishlist/toggle', [WishlistController::class, 'toggleApi']);
    Route::get('wishlist/check', [WishlistController::class, 'checkApi']);
    Route::get('wishlist/furniture-ids', [WishlistController::class, 'getFurnitureIds']);
    Route::get('wishlist/material-ids', [WishlistController::class, 'getMaterialIds']);
});

Route::get('interior/catalog', InteriorCatalogController::class)
    ->name('api.interior.catalog');

// Floor plan projects API (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('floor-plan-projects', [FloorPlanProjectController::class, 'index']);
    Route::post('floor-plan-projects', [FloorPlanProjectController::class, 'store']);
    Route::get('floor-plan-projects/{project}', [FloorPlanProjectController::class, 'show']);
    Route::put('floor-plan-projects/{project}', [FloorPlanProjectController::class, 'update']);
    Route::delete('floor-plan-projects/{project}', [FloorPlanProjectController::class, 'destroy']);
    Route::post('floor-plan-projects/{project}/duplicate', [FloorPlanProjectController::class, 'duplicate']);
    
    Route::get('interior-design-projects', [InteriorDesignProjectController::class, 'index']);
    Route::post('interior-design-projects', [InteriorDesignProjectController::class, 'store']);
    Route::get('interior-design-projects/{project}', [InteriorDesignProjectController::class, 'show']);
    Route::put('interior-design-projects/{project}', [InteriorDesignProjectController::class, 'update']);
    Route::delete('interior-design-projects/{project}', [InteriorDesignProjectController::class, 'destroy']);
});
