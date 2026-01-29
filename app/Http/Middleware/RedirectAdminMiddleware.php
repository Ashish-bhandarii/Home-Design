<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Redirects admin and designer users to their respective dashboards when they try to access user pages.
 * This ensures they stay within their designated panels.
 */
class RedirectAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            if ($request->user()->hasRole('admin')) {
                return redirect()->route('admin.dashboard');
            }
            
            if ($request->user()->hasRole('designer')) {
                return redirect()->route('designer.dashboard');
            }
        }

        return $next($request);
    }
}
