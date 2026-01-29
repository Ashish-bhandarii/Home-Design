<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\User;
use App\Observers\OrderObserver;
use App\Observers\UserObserver;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind Fortify login response to role-aware redirect
        // Role-aware redirects after login / register
        $this->app->singleton(LoginResponseContract::class, function () {
            return new class implements LoginResponseContract {
                public function toResponse($request)
                {
                    $user = $request->user();
                    $target = $user && $user->hasRole('admin') ? route('admin.dashboard') : route('dashboard');
                    return redirect()->intended($target);
                }
            };
        });

        $this->app->singleton(RegisterResponseContract::class, function () {
            return new class implements RegisterResponseContract {
                public function toResponse($request)
                {
                    $user = $request->user();
                    $target = $user && $user->hasRole('admin') ? route('admin.dashboard') : route('dashboard');
                    return redirect()->intended($target);
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observers
        Order::observe(OrderObserver::class);
        User::observe(UserObserver::class);
    }
}
