<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures only designer users can access designer routes.
 */
class DesignerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasRole('designer')) {
            if ($request->user() && $request->user()->hasRole('admin')) {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
