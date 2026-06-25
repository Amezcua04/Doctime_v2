<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Presupuesto Dental - {{ $budget->patient->name }}</title>
    <style>
        @page {
            margin: 40px 50px;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 13px;
            color: #374151;
            line-height: 1.5;
        }

        #watermark {
            position: fixed;
            top: 25%;
            left: 0%;
            width: 100%;
            opacity: 0.15;
            z-index: -1;
            text-align: center;
        }

        #watermark img {
            width: 80%;
            max-width: 600px;
            height: auto;
        }

        .header-table {
            width: 100%;
            border-bottom: 2px solid #2c65cc;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }

        .header-logo {
            width: 80px;
            vertical-align: middle;
        }

        .header-logo img {
            width: 100%;
            border-radius: 8px;
        }

        .clinic-info {
            vertical-align: middle;
            padding-left: 15px;
        }

        .clinic-info h1 {
            margin: 0;
            font-size: 22px;
            color: #111827;
            letter-spacing: -0.5px;
        }

        .clinic-info p {
            margin: 2px 0 0 0;
            color: #6b7280;
            font-size: 12px;
        }

        .doc-details {
            text-align: right;
            vertical-align: middle;
        }

        .doc-details h2 {
            margin: 0;
            color: #2c65cc;
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .doc-details p {
            margin: 5px 0 0 0;
            font-weight: bold;
            color: #4b5563;
        }

        .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 30px;
            width: 100%;
        }

        .info-table {
            width: 100%;
        }

        .info-table td {
            padding: 4px 0;
        }

        .label {
            font-weight: bold;
            color: #475569;
            width: 120px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            color: #2c65cc;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid rgba(0, 119, 196, 0.3);
        }

        .items-table th.text-right {
            text-align: right;
        }

        .items-table td { 
            padding: 12px 10px; 
            border-bottom: 1px solid #e5e7eb; 
            color: #1f2937; 
        }

        .text-right {
            text-align: right;
        }

        .totals-wrapper {
            width: 100%;
        }

        .totals-table {
            width: 35%;
            float: right;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
        }

        .totals-table tr:last-child td {
            border-bottom: none;
        }

        .total-row td {
            font-weight: bold;
            font-size: 16px;
            color: #111827;
            background-color: #f3f4f6;
        }

        .notes-section {
            clear: both;
            padding-top: 40px;
        }

        .notes-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
            font-size: 12px;
            text-transform: uppercase;
        }

        .notes-content {
            font-size: 12px;
            color: #6b7280;
            background-color: #fefce8;
            border-left: 4px solid #facc15;
            padding: 10px;
        }

        .footer {
            position: fixed;
            bottom: -20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
    </style>
</head>

<body>

    <div id="watermark">
        @php
            $path = public_path('apple-touch-icon.png');
            $type = pathinfo($path, PATHINFO_EXTENSION);
            if (file_exists($path)) {
                $data = file_get_contents($path);
                $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            } else {
                $base64 = '';
            }
        @endphp
        @if ($base64)
            <img src="{{ $base64 }}" alt="Marca de Agua">
        @endif
    </div>

    <table class="header-table">
        <tr>
            <td class="header-logo">
                @if ($base64)
                    <img src="{{ $base64 }}" alt="Logo">
                @endif
            </td>
            <td class="clinic-info">
                <h1>{{ $clinic->name ?? 'Clínica Dental' }}</h1>
                <p>Atención por: Dr(a). {{ $budget->doctor->name }}</p>
                <p>
                    @if (isset($clinic->phone))
                        Tel: {{ $clinic->phone }} |
                    @endif
                    @if (isset($clinic->address))
                        {{ $clinic->address }}
                    @endif
                </p>
            </td>
            <td class="doc-details">
                <h2>COTIZACIÓN</h2>
                <p>{{ $budget->folio ?? '# ' . str_pad($budget->id, 6, '0', STR_PAD_LEFT) }}</p>
            </td>
        </tr>
    </table>

    <div class="info-box">
        <table class="info-table">
            <tr>
                <td class="label">Paciente:</td>
                <td>{{ $budget->patient->name }}</td>
                <td class="label" style="text-align: right; padding-right: 15px;">Fecha Emisión:</td>
                <td>{{ $budget->created_at->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td class="label">Teléfono:</td>
                <td>{{ $budget->patient->phone ?? 'No registrado' }}</td>
                <td class="label" style="text-align: right; padding-right: 15px;">Vigencia hasta:</td>
                <td>
                    @if ($budget->valid_until)
                        {{ \Carbon\Carbon::parse($budget->valid_until)->format('d/m/Y') }}
                    @else
                        Sujeto a cambios
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Descripción del Tratamiento</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-right">Descuento</th>
                <th class="text-right">Importe</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($budget->details as $detail)
                <tr>
                    <td>{{ $detail->concept }}</td>
                    <td class="text-right">${{ number_format($detail->unit_price, 2) }}</td>
                    <td class="text-right">
                        @if ($detail->discount > 0)
                            -${{ number_format($detail->discount, 2) }}
                        @else
                            -
                        @endif
                    </td>
                    <td class="text-right font-medium">${{ number_format($detail->total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals-wrapper">
        <table class="totals-table">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">${{ number_format($budget->subtotal, 2) }}</td>
            </tr>
            @if ($budget->discount > 0)
                <tr>
                    <td style="color: #ef4444;">Descuento Global</td>
                    <td class="text-right" style="color: #ef4444;">-${{ number_format($budget->discount, 2) }}</td>
                </tr>
            @endif
            <tr class="total-row">
                <td>Total a Pagar</td>
                <td class="text-right">${{ number_format($budget->total, 2) }}</td>
            </tr>
        </table>
    </div>

    @if ($budget->notes)
        <div class="notes-section">
            <div class="notes-title">Observaciones y Condiciones:</div>
            <div class="notes-content">
                {!! nl2br(e($budget->notes)) !!}
            </div>
        </div>
    @endif

    <div class="footer">
        Este documento es una cotización de servicios dentales y no representa un comprobante fiscal. <br>
        Generado automáticamente por el sistema administrativo.
    </div>

</body>

</html>
