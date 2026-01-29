<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\DesignerMiddleware;
use App\Http\Middleware\RedirectAdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Route aliases
        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'designer' => DesignerMiddleware::class,
            'redirect.admin' => RedirectAdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle CSRF token mismatch - regenerate token and allow retry
        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, $request) {
            // Regenerate the session token to get a fresh CSRF token
            $request->session()->regenerateToken();
            
            if ($request->header('X-Inertia')) {
                // For Inertia requests, redirect back with fresh token
                // This allows the page to get the new token without a full reload
                return back()->with('csrf_refreshed', true);
            }
            
            if ($request->expectsJson()) {
                // For AJAX requests, return 419 with new token in header
                return response()->json([
                    'message' => 'CSRF token mismatch. Please retry.',
                    'csrf_token' => csrf_token(),
                ], 419);
            }
            
            return redirect()
                ->back()
                ->withInput($request->except('password', 'password_confirmation'));
        });
    })->create();
