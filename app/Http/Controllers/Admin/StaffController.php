<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'doctors.medicalProfile.specialties'])
            ->whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', ['super_admin', 'doctor']);
            });

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
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

        $users = $query->paginate(8)->withQueryString();

        $allowedRoleNames = Auth::user()->hasRole('super_admin')
            ? ['admin', 'assistant']
            : ['assistant'];

        $roles = Role::whereIn('name', $allowedRoleNames)->get();

        $doctors = User::role('doctor')
            ->with(['medicalProfile.specialties'])
            ->get();

        return Inertia::render('admin/staff/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'sort', 'direction']),
            'doctors' => $doctors,
            'roles' => $roles,
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
    public function store(StoreStaffRequest $request)
    {
        if ($request->role === 'admin' && !Auth::user()->hasRole('super_admin')) {
            abort(403, 'No tienes permisos para crear administradores.');
        }

        if ($request->role === 'doctor' || $request->role === 'super_admin') {
            abort(403, 'Rol inválido para este módulo.');
        }

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $user->assignRole($request->role);

            if ($request->role === 'assistant' && $request->has('assigned_doctor_ids')) {
                $user->doctors()->sync($request->assigned_doctor_ids);
            }
        });

        return redirect()->back()->with('success', 'Usuario creado correctamente.');
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
    public function update(UpdateStaffRequest $request, User $user)
    {
        if ($user->hasRole(['super_admin', 'doctor'])) {
            abort(403, 'No puedes editar a este usuario desde aquí.');
        }

        if ($request->role === 'admin' && !Auth::user()->hasRole('super_admin')) {
            abort(403, 'No tienes permisos para asignar el rol de administrador.');
        }

        DB::transaction(function () use ($request, $user) {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);
            $user->syncRoles([$request->role]);

            if ($request->role === 'assistant') {
                $user->doctors()->sync($request->assigned_doctor_ids ?? []);
            } else {
                $user->doctors()->detach();
            }
        });

        return redirect()->back()->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        if ($user->hasRole(['super_admin', 'doctor'])) {
            abort(403, 'No puedes eliminar a este usuario desde aquí.');
        }

        if ($user->hasRole('admin') && !Auth::user()->hasRole('super_admin')) {
            abort(403, 'Solo el super administrador puede eliminar administradores.');
        }

        $user->delete();
        return redirect()->back()->with('success', 'Usuario desactivado correctamente.');
    }
}
