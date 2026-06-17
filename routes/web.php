<?php

use App\Http\Controllers\Admin\AppointmentBillingController;
use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CheckoutController;
use App\Http\Controllers\Admin\ClinicalRecordController;
use App\Http\Controllers\Admin\ClinicSettingController;
use App\Http\Controllers\Admin\DoctorController;
use App\Http\Controllers\Admin\FinancialReportController;
use App\Http\Controllers\Admin\MedicalAttachmentController;
use App\Http\Controllers\Admin\MyScheduleController;
use App\Http\Controllers\Admin\OperationalReportController;
use App\Http\Controllers\Admin\PatientContractController;
use App\Http\Controllers\Admin\PatientController;
use App\Http\Controllers\Admin\SpecialtyController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\OrthodonticNoteController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReminderLogController;
use App\Http\Controllers\WhatsAppWebhookController;
use App\Models\ClinicSetting;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/webhook/whatsapp', [WhatsAppWebhookController::class, 'verify']);
Route::post('/webhook/whatsapp', [WhatsAppWebhookController::class, 'handle'])
    ->withoutMiddleware([PreventRequestForgery::class]);

Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Acceso global
    |--------------------------------------------------------------------------
    */
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notificaciones
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::post('/{id}/read', function (Request $request, $id) {
            $request->user()->notifications()->where('id', $id)->first()?->markAsRead();
            return back();
        })->name('read');

        Route::post('/mark-all', function (Request $request) {
            $request->user()->unreadNotifications->markAsRead();
            return back();
        })->name('markAll');
    });

    // Chat interno
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::post('/', [ChatController::class, 'store'])->name('store');
        Route::post('/typing', [ChatController::class, 'typing'])->name('typing');
        Route::get('/{receiver}', [ChatController::class, 'show'])->name('show');
    });

    /*
    |--------------------------------------------------------------------------
    | Doctores
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:doctor'])->group(function () {
        Route::prefix('my-schedule')->group(function () {
            Route::get('/', [MyScheduleController::class, 'edit'])->name('edit');
            Route::post('/', [MyScheduleController::class, 'updateSchedule'])->name('update');
            Route::post('/absences', [MyScheduleController::class, 'storeAbsence'])->name('absences.store');
            Route::delete('/absences/{absence}', [MyScheduleController::class, 'destroyAbsence'])->name('absences.destroy');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Operación clínica (asistentes, doctores y administradores)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:super_admin|admin|doctor|assistant'])->group(function () {
        Route::prefix('admin')->group(function () {
            // Gestión de pacientes y expedientes
            Route::resource('patients', PatientController::class)->except(['create', 'show', 'edit']);

            Route::prefix('patients/{patient}')->name('patients.')->group(function () {
                // Ortodoncia
                Route::post('/orthodontic-notes', [OrthodonticNoteController::class, 'sync'])->name('orthodontic-notes.sync');
                Route::delete('/orthodontic-notes/{note}', [OrthodonticNoteController::class, 'destroy'])->name('orthodontic-notes.destroy');

                // Historia clínica
                Route::get('/medical-record', [ClinicalRecordController::class, 'show'])->name('medical-record.show');
                Route::put('/medical-record', [ClinicalRecordController::class, 'update'])->name('medical-record.update');

                // Anexos multimedia
                Route::post('/attachments', [MedicalAttachmentController::class, 'store'])->name('attachments.store');
                Route::delete('/attachments/{attachment}', [MedicalAttachmentController::class, 'destroy'])->name('attachments.destroy');
                Route::get('/attachments/{attachment}/view', [MedicalAttachmentController::class, 'viewFile']);
                Route::get('/attachments/{attachment}/download', [MedicalAttachmentController::class, 'downloadFile']);

                // Contratos
                Route::post('/contracts', [PatientContractController::class, 'store'])->name('contracts.store');
                Route::patch('/contracts/{contract}/sign', [PatientContractController::class, 'markAsSigned'])->name('contracts.sign');
                Route::delete('/contracts/{contract}', [PatientContractController::class, 'destroy'])->name('contracts.destroy');
                Route::get('/contracts/{contract}/view', [PatientContractController::class, 'viewFile']);
                Route::get('/contracts/{contract}/download', [PatientContractController::class, 'downloadFile']);
                Route::post('/contracts/generate', [PatientContractController::class, 'generate'])->name('contracts.generate');
            });

            // Agenda y finanzas operativas
            Route::resource('appointments', AppointmentController::class);
            Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');
            Route::post('/appointments/{appointment}/send-reminder', [AppointmentController::class, 'sendManualReminder'])->name('appointments.send-reminder');
            Route::post('/appointments/{appointment}/services', [AppointmentBillingController::class, 'addService'])->name('appointments.services.add');
            Route::delete('/appointments/{appointment}/services/{service}', [AppointmentBillingController::class, 'removeService'])->name('appointments.services.remove');
            Route::post('/appointments/{appointment}/payments', [AppointmentBillingController::class, 'addPayment'])->name('appointments.payments.add');
            Route::delete('/appointments/{appointment}/payments/{payment}', [AppointmentBillingController::class, 'destroyPayment'])->name('appointments.payments.destroy');
            Route::get('/appointments/{appointment}/receipt', [CheckoutController::class, 'downloadReceipt'])->name('appointments.receipt');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Gestión administrativa
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:super_admin|admin'])->prefix('admin')->name('admin.')->group(function () {

        // Catálogos
        Route::resource('services', ServiceController::class)->except(['create', 'show', 'edit']);
        Route::resource('payment-methods', PaymentMethodController::class)->except(['create', 'show', 'edit']);
        Route::resource('specialties', SpecialtyController::class)->except(['create', 'show', 'edit']);

        // Usuarios
        Route::resource('staff', StaffController::class)->parameters(['staff' => 'user'])->except(['create', 'edit', 'show']);
        Route::resource('doctors', DoctorController::class);

        // Reportes
        Route::get('/reports/financial', [FinancialReportController::class, 'index'])->name('admin.reports.financial');
        Route::get('/reports/financial/export', [FinancialReportController::class, 'export'])->name('admin.reports.financial.export');

        Route::get('/reports/operational', [OperationalReportController::class, 'index'])->name('admin.reports.operational.index');
        Route::get('/reports/operational/export', [OperationalReportController::class, 'export'])->name('admin.reports.operational.export');
        Route::get('/reports/operational/pdf', [OperationalReportController::class, 'exportPdf'])->name('admin.reports.operational.pdf');

        // Auditoría
        Route::get('/audit', [AuditLogController::class, 'index'])->name('audit.index');
        Route::get('/reminders', [ReminderLogController::class, 'index'])
            ->name('admin.reminders.audit');

        // Configuración de la clínica
        Route::get('/clinic', [ClinicSettingController::class, 'edit'])->name('clinic.edit');
        Route::post('/clinic', [ClinicSettingController::class, 'update'])->name('clinic..update');
        Route::post('/clinic/banners', [ClinicSettingController::class, 'uploadBanner'])->name('banners.store');
        Route::delete('/clinic/banners/{banner}', [ClinicSettingController::class, 'deleteBanner'])->name('banners.destroy');
        Route::post('/clinic/banners/batch', [ClinicSettingController::class, 'uploadBatch'])->name('banners.batch');
    });
});

require __DIR__ . '/settings.php';
