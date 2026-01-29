<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HomeDesignsPublicController;
use App\Http\Controllers\InteriorDesignsPublicController;
use App\Http\Controllers\InteriorDesignProjectController;
use App\Http\Controllers\FloorPlanProjectController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\User\FurnitureController as UserFurnitureController;
use App\Http\Controllers\User\MaterialsController as UserMaterialsController;
use App\Http\Controllers\DesignerBookingController;

// CSRF token refresh endpoint
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
})->name('csrf.token');

Route::get('/', [LandingController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified', 'redirect.admin'])->group(function () {
    Route::get('dashboard', function () {
        $upcomingBookings = \App\Models\DesignerBooking::where('user_id', Auth::id())
            ->where('booking_date', '>=', now()->toDateString())
            ->whereIn('status', ['pending', 'confirmed'])
            ->with(['designer:id,name,email,specialty,avatar'])
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->take(5)
            ->get(['id', 'user_id', 'designer_id', 'booking_date', 'booking_time', 'consultation_type', 'status', 'project_type', 'description', 'meeting_link']);

        return Inertia::render('user/dashboard', [
            'upcomingBookings' => $upcomingBookings,
        ]);
    })->name('dashboard');

    Route::get('floor-plan', function () {
        return Inertia::render('user/floor-plan');
    })->name('floor-plan');

    Route::get('floor-plan/{project}', function (App\Models\FloorPlanProject $project) {
        if ($project->user_id !== Auth::id()) {
            abort(403);
        }
        return Inertia::render('user/floor-plan', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'thumbnail' => $project->thumbnail,
                'requirements' => $project->requirements ?? [],
                'generated_plans' => $project->generated_plans ?? null,
                'selected_plan_index' => $project->selected_plan_index ?? 0,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ]
        ]);
    })->name('floor-plan.edit');

    // Floor Plan Projects API
    Route::prefix('api/floor-plan-projects')->name('floor-plan-projects.')->group(function () {
        Route::get('/', [FloorPlanProjectController::class, 'index'])->name('index');
        Route::post('/', [FloorPlanProjectController::class, 'store'])->name('store');
        Route::get('/{project}', [FloorPlanProjectController::class, 'show'])->name('show');
        Route::put('/{project}', [FloorPlanProjectController::class, 'update'])->name('update');
        Route::delete('/{project}', [FloorPlanProjectController::class, 'destroy'])->name('destroy');
        Route::post('/{project}/duplicate', [FloorPlanProjectController::class, 'duplicate'])->name('duplicate');
    });

    // Home Design public pages
    Route::get('design-home', [HomeDesignsPublicController::class, 'index'])->name('design-home');
    Route::get('design-home/{homeDesign}', [HomeDesignsPublicController::class, 'show'])->name('design-home.show');
    Route::get('design-home/{homeDesign}/download', [HomeDesignsPublicController::class, 'download'])->name('design-home.download');

    Route::get('interior-design', function () {
        return Inertia::render('user/interior-design');
    })->name('interior-design');

    Route::get('interior-design/{project}', function (App\Models\InteriorDesignProject $project) {
        if ($project->user_id !== Auth::id()) {
            abort(403);
        }
        return Inertia::render('user/interior-design', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'thumbnail' => $project->thumbnail,
                'rooms' => $project->rooms ?? [],
                'placements' => $project->placements ?? [],
                'room_designs' => $project->room_designs ?? [],
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ]
        ]);
    })->name('interior-design.edit');

    // Interior Design Projects API
    Route::prefix('api/interior-projects')->name('interior-projects.')->group(function () {
        Route::get('/', [InteriorDesignProjectController::class, 'index'])->name('index');
        Route::post('/', [InteriorDesignProjectController::class, 'store'])->name('store');
        Route::get('/{project}', [InteriorDesignProjectController::class, 'show'])->name('show');
        Route::put('/{project}', [InteriorDesignProjectController::class, 'update'])->name('update');
        Route::delete('/{project}', [InteriorDesignProjectController::class, 'destroy'])->name('destroy');
        Route::post('/{project}/duplicate', [InteriorDesignProjectController::class, 'duplicate'])->name('duplicate');
    });

    // User pages
    Route::get('projects', function () {
        $projects = \App\Models\InteriorDesignProject::where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc')
            ->get();
        return Inertia::render('user/projects', ['projects' => $projects]);
    })->name('projects');

    Route::get('gallery', [GalleryController::class, 'index'])->name('gallery');
    Route::get('gallery/{interiorDesign}', [InteriorDesignsPublicController::class, 'show'])->name('gallery.show');
    Route::get('gallery/{interiorDesign}/download', [InteriorDesignsPublicController::class, 'download'])->name('gallery.download');

    Route::get('library/furniture', [UserFurnitureController::class, 'index'])->name('library.furniture');
    Route::get('library/materials', [UserMaterialsController::class, 'index'])->name('library.materials');

    Route::get('settings', function () {
        return Inertia::render('user/settings');
    })->name('settings');

    Route::get('help', function () {
        return Inertia::render('user/help');
    })->name('help');

    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist');
    Route::post('wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::get('wishlist/check', [WishlistController::class, 'check'])->name('wishlist.check');
    
    // API-style wishlist routes for AJAX calls
    Route::post('api/wishlist/toggle', [WishlistController::class, 'toggleApi'])->name('api.wishlist.toggle');
    Route::get('api/wishlist/check', [WishlistController::class, 'checkApi'])->name('api.wishlist.check');
    Route::get('api/wishlist/furniture-ids', [WishlistController::class, 'getFurnitureIds'])->name('api.wishlist.furniture-ids');
    Route::get('api/wishlist/material-ids', [WishlistController::class, 'getMaterialIds'])->name('api.wishlist.material-ids');

    // Cart routes
    Route::get('cart', [CartController::class, 'index'])->name('cart');
    Route::post('api/cart/add', [CartController::class, 'addToCart'])->name('api.cart.add');
    Route::post('api/cart/remove', [CartController::class, 'removeFromCart'])->name('api.cart.remove');
    Route::post('api/cart/update-quantity', [CartController::class, 'updateQuantity'])->name('api.cart.update-quantity');
    Route::get('api/cart/furniture-ids', [CartController::class, 'getFurnitureIds'])->name('api.cart.furniture-ids');
    Route::get('api/cart/material-ids', [CartController::class, 'getMaterialIds'])->name('api.cart.material-ids');
    Route::get('api/cart/count', [CartController::class, 'getCount'])->name('api.cart.count');
    Route::post('api/cart/clear', [CartController::class, 'clearCart'])->name('api.cart.clear');

    // Order routes
    Route::get('checkout', [OrderController::class, 'checkout'])->name('checkout');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders', [OrderController::class, 'index'])->name('orders');
    Route::get('orders/{order}/success', [OrderController::class, 'success'])->name('orders.success');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

    Route::get('tools/measurements', function () {
        return Inertia::render('user/measurements');
    })->name('tools.measurements');

    // Designer Booking Routes
    Route::get('designers', [DesignerBookingController::class, 'index'])->name('designers');
    Route::get('designers/{designer}', [DesignerBookingController::class, 'show'])->name('designers.show');
    Route::post('designers/book', [DesignerBookingController::class, 'store'])->name('designers.book');
    Route::get('my-bookings', [DesignerBookingController::class, 'myBookings'])->name('my-bookings');
    Route::post('my-bookings/{booking}/cancel', [DesignerBookingController::class, 'cancel'])->name('bookings.cancel');
});

// Designer routes - separate panel for designers
Route::middleware(['auth', 'verified', 'designer'])->prefix('designer')->group(function () {
    Route::get('/', [\App\Http\Controllers\Designer\DashboardController::class, 'index'])->name('designer.dashboard');
    
    // Designer Bookings Management
    Route::get('/bookings', [\App\Http\Controllers\Designer\BookingController::class, 'index'])->name('designer.bookings');
    Route::get('/bookings/{booking}', [\App\Http\Controllers\Designer\BookingController::class, 'show'])->name('designer.bookings.show');
    Route::post('/bookings/{booking}/confirm', [\App\Http\Controllers\Designer\BookingController::class, 'confirm'])->name('designer.bookings.confirm');
    Route::post('/bookings/{booking}/complete', [\App\Http\Controllers\Designer\BookingController::class, 'complete'])->name('designer.bookings.complete');
    Route::post('/bookings/{booking}/cancel', [\App\Http\Controllers\Designer\BookingController::class, 'cancel'])->name('designer.bookings.cancel');
    Route::patch('/bookings/{booking}/notes', [\App\Http\Controllers\Designer\BookingController::class, 'updateNotes'])->name('designer.bookings.notes');
    
    // Designer Profile
    Route::get('/profile', [\App\Http\Controllers\Designer\ProfileController::class, 'index'])->name('designer.profile');
    Route::post('/profile', [\App\Http\Controllers\Designer\ProfileController::class, 'update'])->name('designer.profile.update');
    Route::post('/profile/avatar', [\App\Http\Controllers\Designer\ProfileController::class, 'uploadAvatar'])->name('designer.profile.avatar');
    Route::post('/profile/availability', [\App\Http\Controllers\Designer\ProfileController::class, 'toggleAvailability'])->name('designer.profile.toggle-availability');
    Route::post('/profile/availability-settings', [\App\Http\Controllers\Designer\ProfileController::class, 'updateAvailability'])->name('designer.profile.availability-settings');
});

// Admin routes - separate group without redirect.admin middleware
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])
        ->name('admin.analytics');

    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])
        ->name('admin.settings');
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])
        ->name('admin.settings.update');

    // Admin Home Designs Management
    Route::prefix('home-designs')->name('admin.home-designs.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'store'])->name('store');
        Route::get('/{homeDesign}/edit', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'edit'])->name('edit');
        Route::put('/{homeDesign}', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'update'])->name('update');
        Route::delete('/{homeDesign}', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'destroy'])->name('destroy');
        Route::post('/{homeDesign}/toggle-featured', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'toggleFeatured'])->name('toggle-featured');
        Route::post('/{homeDesign}/toggle-active', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'toggleActive'])->name('toggle-active');
        Route::delete('/{homeDesign}/images/{image}', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'deleteImage'])->name('delete-image');
        Route::delete('/{homeDesign}/files/{file}', [\App\Http\Controllers\Admin\HomeDesignsController::class, 'deleteFile'])->name('delete-file');
    });

    // Admin Interior Designs Management
    Route::prefix('interior-designs')->name('admin.interior-designs.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'store'])->name('store');
        Route::get('/{interiorDesign}/edit', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'edit'])->name('edit');
        Route::put('/{interiorDesign}', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'update'])->name('update');
        Route::delete('/{interiorDesign}', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'destroy'])->name('destroy');
        Route::post('/{interiorDesign}/toggle-featured', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'toggleFeatured'])->name('toggle-featured');
        Route::post('/{interiorDesign}/toggle-active', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'toggleActive'])->name('toggle-active');
        Route::delete('/{interiorDesign}/images/{image}', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'deleteImage'])->name('delete-image');
        Route::delete('/{interiorDesign}/files/{file}', [\App\Http\Controllers\Admin\InteriorDesignsController::class, 'deleteFile'])->name('delete-file');
    });

    // Admin Users
    Route::prefix('users')->name('admin.users.')->group(function () {
        Route::get('/', [UsersController::class, 'index'])->name('index');
        Route::get('/{user}/edit', [UsersController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UsersController::class, 'update'])->name('update');
        Route::delete('/{user}', [UsersController::class, 'destroy'])->name('destroy');
    });

    // Admin Furniture Library
    Route::prefix('furniture')->name('admin.furniture.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\FurnitureController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\FurnitureController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\FurnitureController::class, 'store'])->name('store');
        Route::get('/{furniture}/edit', [\App\Http\Controllers\Admin\FurnitureController::class, 'edit'])->name('edit');
        Route::put('/{furniture}', [\App\Http\Controllers\Admin\FurnitureController::class, 'update'])->name('update');
        Route::delete('/{furniture}', [\App\Http\Controllers\Admin\FurnitureController::class, 'destroy'])->name('destroy');
        Route::post('/{furniture}/toggle-active', [\App\Http\Controllers\Admin\FurnitureController::class, 'toggleActive'])->name('toggle-active');
        Route::post('/{furniture}/toggle-featured', [\App\Http\Controllers\Admin\FurnitureController::class, 'toggleFeatured'])->name('toggle-featured');
    });

    // Admin Materials
    Route::prefix('materials')->name('admin.materials.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\MaterialsController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\MaterialsController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\MaterialsController::class, 'store'])->name('store');
        Route::get('/{material}/edit', [\App\Http\Controllers\Admin\MaterialsController::class, 'edit'])->name('edit');
        Route::put('/{material}', [\App\Http\Controllers\Admin\MaterialsController::class, 'update'])->name('update');
        Route::delete('/{material}', [\App\Http\Controllers\Admin\MaterialsController::class, 'destroy'])->name('destroy');
        Route::post('/{material}/toggle-active', [\App\Http\Controllers\Admin\MaterialsController::class, 'toggleActive'])->name('toggle-active');
        Route::post('/{material}/toggle-featured', [\App\Http\Controllers\Admin\MaterialsController::class, 'toggleFeatured'])->name('toggle-featured');
    });

    // Admin Orders Management
    Route::prefix('orders')->name('admin.orders.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\OrderController::class, 'index'])->name('index');
        Route::get('/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->name('show');
        Route::patch('/{order}/status', [\App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('update-status');
        Route::patch('/{order}/payment-status', [\App\Http\Controllers\Admin\OrderController::class, 'updatePaymentStatus'])->name('update-payment-status');
        Route::delete('/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'destroy'])->name('destroy');
    });

    // Admin Designers Management
    Route::prefix('designers')->name('admin.designers.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\DesignerController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\DesignerController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\DesignerController::class, 'store'])->name('store');
        Route::get('/{designer}/edit', [\App\Http\Controllers\Admin\DesignerController::class, 'edit'])->name('edit');
        Route::put('/{designer}', [\App\Http\Controllers\Admin\DesignerController::class, 'update'])->name('update');
        Route::delete('/{designer}', [\App\Http\Controllers\Admin\DesignerController::class, 'destroy'])->name('destroy');
        Route::post('/{designer}/avatar', [\App\Http\Controllers\Admin\DesignerController::class, 'uploadAvatar'])->name('avatar');
        Route::post('/{designer}/toggle-availability', [\App\Http\Controllers\Admin\DesignerController::class, 'toggleAvailability'])->name('toggle-availability');
        Route::post('/{designer}/availability', [\App\Http\Controllers\Admin\DesignerController::class, 'updateAvailability'])->name('availability');
    });

    // Admin Bookings Management
    Route::prefix('bookings')->name('admin.bookings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\BookingController::class, 'index'])->name('index');
        Route::get('/{booking}', [\App\Http\Controllers\Admin\BookingController::class, 'show'])->name('show');
        Route::patch('/{booking}/status', [\App\Http\Controllers\Admin\BookingController::class, 'updateStatus'])->name('update-status');
        Route::delete('/{booking}', [\App\Http\Controllers\Admin\BookingController::class, 'destroy'])->name('destroy');
    });

    // Admin Notifications
    Route::prefix('notifications')->name('admin.notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('index');
        Route::get('/recent', [\App\Http\Controllers\Admin\NotificationController::class, 'recent'])->name('recent');
        Route::get('/unread-count', [\App\Http\Controllers\Admin\NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{notification}/read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notification}', [\App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('destroy');
        Route::delete('/', [\App\Http\Controllers\Admin\NotificationController::class, 'clearAll'])->name('clear-all');
    });
});

require __DIR__.'/settings.php';

// Google OAuth
Route::get('/auth/google/redirect', [\App\Http\Controllers\Auth\GoogleController::class, 'redirect'])->name('oauth.google.redirect');
Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\GoogleController::class, 'callback'])->name('oauth.google.callback');

// Public pages
Route::get('about', function () {
    return Inertia::render('about');
})->name('about');

Route::get('privacy-policy', function () {
    return Inertia::render('privacy-policy');
})->name('privacy-policy');

Route::get('terms', function () {
    return Inertia::render('terms');
})->name('terms');
