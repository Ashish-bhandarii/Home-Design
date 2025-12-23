<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        $url = $user && $user->role === 'admin'
            ? route('admin.dashboard')
            : route('dashboard');

        return redirect()->intended($url);
    }
}
