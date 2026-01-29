<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Inertia\Inertia;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        $url = $user && $user->role === 'admin'
            ? route('admin.dashboard')
            : route('dashboard');

        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false, 'redirect' => $url]);
        }

        // For Inertia requests, use Inertia::location for full page redirect
        if ($request->header('X-Inertia')) {
            return Inertia::location($url);
        }

        return redirect()->intended($url);
    }
}
