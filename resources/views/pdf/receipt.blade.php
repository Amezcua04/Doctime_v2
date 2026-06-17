<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Ticket Cita #{{ $appointment->id }}</title>
    <style>
        @page {
            margin: 8px;
        }

        body {
            font-family: 'Courier', 'Helvetica', Arial, sans-serif;
            color: #000;
            font-size: 10px;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .bold {
            font-weight: bold;
        }

        .clinic-title {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .clinic-info {
            font-size: 9px;
            margin-bottom: 2px;
        }

        .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
        }

        .ticket-table {
            width: 100%;
            border-collapse: collapse;
        }

        .ticket-table th {
            border-bottom: 1px dashed #000;
            text-align: left;
            padding: 3px 0;
            font-size: 9px;
        }

        .ticket-table td {
            padding: 4px 0;
            vertical-align: top;
            font-size: 9.5px;
        }

        .totals-section {
            width: 100%;
            margin-top: 4px;
        }

        .totals-section td {
            padding: 2px 0;
        }

        .footer {
            margin-top: 15px;
            font-size: 8.5px;
            line-height: 1.4;
        }
    </style>
</head>

<body>

    <div class="text-center">
        <div class="clinic-title">{{ $clinic['name'] }}</div>
        <div class="clinic-info">{{ $clinic['address'] }}</div>
        <div class="clinic-info">Tel: {{ $clinic['phone'] }}</div>
    </div>

    <div class="divider"></div>

    <div>
        <span class="bold">FOLIO CITA:</span> {{ 'CI-' . str_pad($appointment->id, 5, '0', STR_PAD_LEFT) }}<br>
        <span class="bold">FECHA:</span> {{ \Carbon\Carbon::now()->format('d M Y H:i') }}<br>
        <span class="bold">PACIENTE:</span> {{ $appointment->patient->name ?? 'N/A' }}<br>
        <span class="bold">ID PACIENTE:</span>
        {{ 'PA-' . str_pad($appointment->patient_id, 5, '0', STR_PAD_LEFT) }}<br>
        <span class="bold">MÉDICO:</span> {{ $appointment->doctor->name ?? 'N/A' }}
    </div>

    <div class="divider"></div>

    <div class="bold" style="margin-bottom: 3px;">TRATAMIENTOS / SERVICIOS</div>
    <table class="ticket-table">
        <thead>
            <tr>
                <th>Cant / Descripción</th>
                <th class="text-right" style="width: 60px;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($appointment->services as $service)
                <tr>
                    <td>
                        {{ $service->pivot->quantity }} x {{ substr($service->name, 0, 24) }}
                        @if (strlen($service->name) > 24)
                            ...
                        @endif
                    </td>
                    <td class="text-right">${{ number_format($service->pivot->price * $service->pivot->quantity, 2) }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if ($appointment->payments && $appointment->payments->count() > 0)
        <div class="divider"></div>
        <div class="bold" style="margin-bottom: 3px;">HISTORIAL DE ABONOS</div>
        <table class="ticket-table">
            <tbody>
                @foreach ($appointment->payments as $payment)
                    <tr>
                        <td>
                            {{ \Carbon\Carbon::parse($payment->created_at)->format('d/m/y') }}
                            <span
                                style="font-size: 8px;">({{ substr($payment->method->name ?? 'Abono', 0, 10) }})</span>
                        </td>
                        <td class="text-right" style="color: #000;">${{ number_format($payment->amount, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="divider"></div>

    <table class="totals-section">
        <tr>
            <td>Total Cuenta:</td>
            <td class="text-right bold">${{ number_format($appointment->total, 2) }}</td>
        </tr>
        <tr>
            <td>Total Pagado:</td>
            <td class="text-right bold">${{ number_format($appointment->paid_amount, 2) }}</td>
        </tr>

        @if ($appointment->paid_amount - $appointment->total > 0)
            <tr>
                <td class="bold">Cambio a Devolver:</td>
                <td class="text-right bold" style="font-size: 11px;">
                    ${{ number_format($appointment->paid_amount - $appointment->total, 2) }}</td>
            </tr>
        @else
            <tr>
                <td class="bold">Saldo Pendiente:</td>
                <td class="text-right bold" style="font-size: 11px;">${{ number_format($appointment->balance, 2) }}
                </td>
            </tr>
        @endif
    </table>

    <div class="divider"></div>

    <div class="text-center footer">
        ¡Gracias por su confianza!<br>
        Conserve este ticket para controles de su tratamiento.<br>
        DocTime Control de Agenda
    </div>

</body>

</html>
