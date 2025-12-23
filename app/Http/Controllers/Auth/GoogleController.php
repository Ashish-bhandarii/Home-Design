<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Authentication failed. Please try again.');
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'User',
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(Str::random(32)),
                'role' => 'user',
                'email_verified_at' => now(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
            ]);
        } else {
            $user->forceFill([
                'google_id' => $user->google_id ?: $googleUser->getId(),
                'avatar' => $googleUser->getAvatar() ?: $user->avatar,
            ])->save();
        }

        Auth::login($user, remember: true);

        // Redirect based on role
        return redirect($user->role === 'admin' ? route('admin.dashboard') : route('dashboard'));
    }
}
