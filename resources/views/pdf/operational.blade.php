<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte operativo</title>
    <style>
        body { 
            font-family: 'Instrument Sans', Helvetica, Arial, sans-serif; 
            color: #1e293b; 
            font-size: 12px; 
            margin: 0; 
            padding: 20px; 
            background-color: #f8fafc; 
        }

        table.grid { width: 100%; border-collapse: separate; border-spacing: 15px 0; margin-left: -15px; margin-right: -15px; margin-bottom: 15px; }
        td.grid-cell { vertical-align: top; }

        /* Estilo general de las Tarjetas (Cards) */
        .card { 
            background: #ffffff; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 15px; 
        }

        /* Tarjetas KPI Superiores */
        .kpi-card { border-left-width: 4px; border-left-style: solid; }
        .border-blue { border-left-color: #3b82f6; }
        .border-red { border-left-color: #ef4444; }
        .border-purple { border-left-color: #a855f7; }
        
        .kpi-title { font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 10px; }
        .kpi-value { font-size: 28px; font-weight: bold; }
        .kpi-subtitle { font-size: 11px; color: #64748b; margin-top: 5px; }

        .text-blue { color: #0f172a; } /* Según imagen, es negro/oscuro */
        .text-red { color: #ef4444; }
        .text-purple { color: #a855f7; }

        /* Títulos de las gráficas */
        .chart-title { font-size: 14px; font-weight: bold; color: #475569; margin-bottom: 15px; }

        /* Tabla de Registros */
        .table-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0; overflow: hidden; }
        .table-header { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 16px; font-weight: bold; color: #0f172a; }
        
        table.data-table { width: 100%; border-collapse: collapse; }
        table.data-table th { text-align: left; padding: 12px 15px; color: #0f172a; font-size: 12px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; }
        table.data-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; }
        
        .text-muted { color: #64748b; font-size: 11px; }

        /* Badges exactos de tu imagen */
        .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; text-align: center; display: inline-block; }
        .badge-confirmed { background-color: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
        .badge-scheduled { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .badge-cancelled { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        
    </style>
</head>
<body>

    <table class="grid" style="table-layout: fixed;">
        <tr>
            <td class="grid-cell" style="width: 33.33%;">
                <div class="card kpi-card border-blue">
                    <div class="kpi-title">Volumen de citas</div>
                    <div class="kpi-value text-blue">{{ $kpis['total'] }}</div>
                    <div class="kpi-subtitle">Agendadas en el período</div>
                </div>
            </td>
            <td class="grid-cell" style="width: 33.33%;">
                <div class="card kpi-card border-red">
                    <div class="kpi-title">Tasa de cancelación</div>
                    <div class="kpi-value text-red">{{ $kpis['tasa_cancelacion'] }}</div>
                    <div class="kpi-subtitle">Proporción de inasistencias</div>
                </div>
            </td>
            <td class="grid-cell" style="width: 33.33%;">
                <div class="card kpi-card border-purple">
                    <div class="kpi-title">Horas ahorradas (Bot)</div>
                    <div class="kpi-value text-purple">{{ $kpis['horas_bot'] }} hrs</div>
                    <div class="kpi-subtitle">Trabajo manual automatizado</div>
                </div>
            </td>
        </tr>
    </table>

    <table class="grid" style="table-layout: fixed;">
        <tr>
            <td class="grid-cell" style="width: 48%;">
                <div class="card" style="text-align: center;">
                    <div class="chart-title" style="text-align: left;">Tasa de asistencia vs cancelación</div>
                    @if(!empty($pieChartBase64))
                        <img src="{{ $pieChartBase64 }}" width="350" height="200" style="margin-top: 10px;">
                    @else
                        <div style="height: 200px; color: #cbd5e1; padding-top: 80px;">Sin datos para graficar</div>
                    @endif
                </div>
            </td>
            <td class="grid-cell" style="width: 48%;">
                <div class="card" style="text-align: center;">
                    <div class="chart-title" style="text-align: left;">Ocupación por horarios (horas pico)</div>
                    @if(!empty($areaChartBase64))
                        <img src="{{ $areaChartBase64 }}" width="400" height="200" style="margin-top: 10px;">
                    @else
                        <div style="height: 200px; color: #cbd5e1; padding-top: 80px;">Sin datos para graficar</div>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <div class="table-container">
        <div class="table-header">Registro de citas</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th style="text-align: right;">Estatus</th>
                </tr>
            </thead>
            <tbody>
                @foreach($appointments as $app)
                <tr>
                    <td>
                        {{ $app->start_time->format('d/m/Y') }}
                    </td>
                    <td class="text-muted">
                        {{ $app->start_time->format('H:i') }} - {{ $app->end_time->format('H:i') }}
                    </td>
                    <td style="font-weight: bold; color: #0f172a;">{{ $app->patient->name ?? 'N/A' }}</td>
                    <td class="text-muted">
                        {{ $app->doctor->name ?? 'N/A' }}
                    </td>
                    <td style="text-align: right;">
                        @php
                            $badgeClass = match($app->status) {
                                'confirmed', 'completed' => 'badge-confirmed',
                                'cancelled' => 'badge-cancelled',
                                'scheduled' => 'badge-scheduled',
                                default => ''
                            };
                            $badgeName = match($app->status) {
                                'completed', 'confirmed' => 'Confirmada',
                                'cancelled' => 'Cancelada',
                                'scheduled' => 'Agendada',
                                default => ucfirst($app->status)
                            };
                        @endphp
                        <span class="badge {{ $badgeClass }}">{{ $badgeName }}</span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

</body>
</html>