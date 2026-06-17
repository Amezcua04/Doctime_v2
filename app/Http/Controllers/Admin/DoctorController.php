<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MedicalProfile;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DoctorController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    $query = User::role('doctor')->with('medicalProfile.specialties');

    if ($request->filled('search')) {
      $search = $request->input('search');
      $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%")
          ->orWhereHas('medicalProfile.specialties', function ($mq) use ($search) {
            $mq->where('name', 'like', "%{$search}%");
          });
      });
    }

    $sort = $request->input('sort', 'created_at');
    $direction = $request->input('direction', 'desc');
    $allowedSorts = ['name', 'email', 'created_at'];

    $query->reorder();

    if (in_array($sort, $allowedSorts)) {
      $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
    } else {
      $query->orderBy('created_at', 'desc');
    }

    $doctors = $query->paginate(7)->withQueryString();
    $specialties = Specialty::where('is_active', true)->orderBy('name')->get();

    return Inertia::render('admin/doctors/index', [
      'doctors' => $doctors,
      'specialties' => $specialties,
      'filters' => [
        'search' => $request->input('search', ''),
        'sort' => $request->input('sort', ''),
        'direction' => $request->input('direction', ''),
      ],
    ]);
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
    $request->validate([
      'name' => 'required|string|max:255',
      'color' => 'nullable|string|max:7',
      'email' => 'required|string|email|max:255|unique:users',
      'password' => 'required|string|min:8|confirmed',
      'specialty_ids' => 'required|array|min:1',
      'specialty_ids.*' => 'exists:specialties,id',
      'license' => 'nullable|string|max:50',
      'bio' => 'nullable|string',
      'is_public' => 'boolean',
      'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    DB::transaction(function () use ($request) {
      $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'color' => $request->color ?? '#3b82f6',
      ]);

      $user->assignRole('doctor');

      $photoPath = null;
      if ($request->hasFile('photo')) {
        $photoPath = $request->file('photo')->store('doctors', 'public');
      }

      $medicalProfile = MedicalProfile::create([
        'user_id' => $user->id,
        'license' => $request->license,
        'bio' => $request->bio,
        'is_public' => $request->boolean('is_public'),
        'photo_path' => $photoPath,
      ]);

      $medicalProfile->specialties()->sync($request->specialty_ids);
    });

    return redirect()->back()->with('success', 'Médico registrado exitosamente.');
  }

  /**
   * Display the specified resource.
   */
  public function show(string $id)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(string $id)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, User $doctor)
  {
    if (!$doctor->hasRole('doctor')) {
      abort(403, 'El usuario seleccionado no es un médico.');
    }

    $request->validate([
      'name' => 'required|string|max:255',
      'color' => 'nullable|string|max:7',
      'email' => 'required|string|email|max:255|unique:users,email,' . $doctor->id,
      'password' => 'nullable|string|min:8|confirmed',
      'specialty_ids' => 'required|array|min:1',
      'specialty_ids.*' => 'exists:specialties,id',
      'license' => 'nullable|string|max:50',
      'bio' => 'nullable|string',
      'is_public' => 'boolean',
      'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    DB::transaction(function () use ($request, $doctor) {
      $userData = [
        'name' => $request->name,
        'email' => $request->email,
        'color' => $request->color ?? '#3b82f6',
      ];

      if ($request->filled('password')) {
        $userData['password'] = Hash::make($request->password);
      }
      $doctor->update($userData);

      $profile = $doctor->medicalProfile ?? new MedicalProfile(['user_id' => $doctor->id]);

      $profile->license = $request->license;
      $profile->bio = $request->bio;
      $profile->is_public = $request->boolean('is_public');

      if ($request->hasFile('photo')) {
        if ($profile->photo_path && Storage::disk('public')->exists($profile->photo_path)) {
          Storage::disk('public')->delete($profile->photo_path);
        }

        $profile->photo_path = $request->file('photo')->store('doctors', 'public');
      }

      $doctor->medicalProfile()->save($profile);
      $profile->specialties()->sync($request->specialty_ids);
    });

    return redirect()->back()->with('success', 'Perfil del médico actualizado correctamente.');
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(User $doctor)
  {
    if (!$doctor->hasRole('doctor')) {
      abort(403, 'Acción no permitida.');
    }

    DB::transaction(function () use ($doctor) {
      if ($doctor->medicalProfile && $doctor->medicalProfile->photo_path) {
        if (Storage::disk('public')->exists($doctor->medicalProfile->photo_path)) {
          Storage::disk('public')->delete($doctor->medicalProfile->photo_path);
        }
      }

      $doctor->delete();
    });

    return redirect()->back()->with('success', 'Médico eliminado del sistema.');
  }
}
