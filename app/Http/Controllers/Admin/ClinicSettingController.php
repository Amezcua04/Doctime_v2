<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\ClinicSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClinicSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ClinicSetting $clinicSetting)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit()
    {
        return Inertia::render('admin/clinic/edit', [
            'clinic' => ClinicSetting::firstOrFail(),
            'banners' => Banner::orderBy('created_at', 'desc')->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $settings = ClinicSetting::first() ?? new ClinicSetting([
            'name' => 'Sunrise',
            'slogan' => 'Bienvenido'
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'hero_title' => 'nullable|string|max:255',
            'hero_description' => 'nullable|string',
            'logo' => 'nullable|image|max:7168',
            'favicon' => 'nullable|file|mimes:ico,png,svg,jpg,jpeg|max:1024',
            'enable_email_reminders' => 'boolean',
            'enable_whatsapp_reminders' => 'boolean',
            'reminder_hours_before' => 'required|integer|in:12,24,48,72',
            'whatsapp_phone_id' => 'nullable|string|max:255',
            'whatsapp_api_token' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            $path = $request->file('logo')->store('clinic', 'public');
            $settings->logo_path = $path;
        }

        if ($request->hasFile('favicon')) {
            if ($settings->favicon_path) {
                Storage::disk('public')->delete($settings->favicon_path);
            }

            $extension = $request->file('favicon')->getClientOriginalExtension();
            $path = $request->file('favicon')->storeAs('clinic', 'favicon.' . $extension, 'public');
            $settings->favicon_path = $path;
        }

        $settings->fill($request->except(['logo', 'favicon']));

        $settings->save();

        Cache::forget('clinic_settings');

        return back()->with('success', 'Configuración actualizada correctamente.');
    }

    public function uploadBanner(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:3072',
            'image_mobile' => 'nullable|image|max:3072',
        ]);

        $data = [];

        $data['image_path'] = $request->file('image')->store('banners', 'public');

        if ($request->hasFile('image_mobile')) {
            $data['image_mobile_path'] = $request->file('image_mobile')->store('banners', 'public');
        }

        Banner::create($data);

        return back()->with('success', 'Banner agregado correctamente.');
    }

    public function uploadBatch(Request $request)
    {
        $request->validate([
            'banners' => 'required|array',
            'banners.*.desktop' => 'required|image|max:5120',
            'banners.*.mobile' => 'nullable|image|max:5120',
        ]);

        $banners = $request->input('banners');

        if ($request->allFiles()['banners']) {
            foreach ($request->allFiles()['banners'] as $item) {
                $desktopFile = $item['desktop'];
                $mobileFile = $item['mobile'] ?? null;

                $data = [
                    'image_path' => $desktopFile->store('banners', 'public'),
                ];

                if ($mobileFile) {
                    $data['image_mobile_path'] = $mobileFile->store('banners', 'public');
                }

                Banner::create($data);
            }
        }

        return back()->with('success', 'Banners subidos correctamente.');
    }

    public function deleteBanner(Banner $banner)
    {
        if (Storage::disk('public')->exists($banner->image_path)) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return back()->with('success', 'Banner eliminado.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClinicSetting $clinicSetting)
    {
        //
    }
}
