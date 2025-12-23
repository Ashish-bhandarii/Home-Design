<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = SiteSetting::allSettings();

        return Inertia::render('admin/settings', [
            'settings' => [
                'contact_email' => $settings['contact_email'] ?? '',
                'contact_phone' => $settings['contact_phone'] ?? '',
                'contact_address' => $settings['contact_address'] ?? '',
                'facebook_url' => $settings['facebook_url'] ?? '',
                'twitter_url' => $settings['twitter_url'] ?? '',
                'instagram_url' => $settings['instagram_url'] ?? '',
                'linkedin_url' => $settings['linkedin_url'] ?? '',
                'about_text' => $settings['about_text'] ?? '',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_address' => 'nullable|string|max:500',
            'facebook_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'about_text' => 'nullable|string|max:1000',
        ]);

        foreach ($validated as $key => $value) {
            SiteSetting::set($key, $value, 'contact');
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
