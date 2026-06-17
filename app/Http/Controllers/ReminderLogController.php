<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ReminderLogController extends Controller
{
    public function index()
    {
        $cronJobs = Activity::where('log_name', 'system_jobs')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $patientLogs = Activity::where('log_name', 'reminders')
            ->with(['subject'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/audit/reminders', [
            'cronJobs' => $cronJobs,
            'patientLogs' => $patientLogs
        ]);
    }
}
