<?php

namespace Database\Seeders;

use App\Models\ContractTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContractTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dentalConsentHtml = '
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
            <h2 style="text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">
                Consentimiento Informado para Tratamiento Clínico
            </h2>
            
            <p style="text-align: right; margin-bottom: 30px;">
                Fecha: <strong>{{ date }}</strong>
            </p>
            
            <p>
                Yo, <strong>{{ patient_name }}</strong>, por mi propio derecho y en pleno uso de mis facultades mentales, 
                autorizo al equipo médico e instalaciones correspondientes a realizar el procedimiento diagnóstico y/o terapéutico necesario.
            </p>
            
            <h3 style="color: #1e3a8a; margin-top: 20px;">Declaraciones del Paciente:</h3>
            <ul style="margin-bottom: 30px;">
                <li style="margin-bottom: 10px;">Se me ha explicado de manera clara, sencilla y comprensible la naturaleza y propósito del procedimiento.</li>
                <li style="margin-bottom: 10px;">Comprendo que, como en todo acto médico, existen riesgos inherentes, efectos secundarios y posibles complicaciones asociadas (como dolor, inflamación, sangrado o infección).</li>
                <li style="margin-bottom: 10px;">He tenido la oportunidad de hacer todas las preguntas que consideré pertinentes y todas han sido respondidas a mi entera satisfacción.</li>
                <li style="margin-bottom: 10px;">Me comprometo a seguir rigurosamente las indicaciones médicas y cuidados postoperatorios que se me proporcionen.</li>
            </ul>

            <p style="margin-bottom: 50px;">
                Por lo tanto, otorgo mi consentimiento libre, informado y voluntario para someterme a dicho tratamiento.
            </p>

            <table style="width: 100%; margin-top: 50px;">
                <tr>
                    <td style="text-align: center; width: 100%;">
                        <div style="min-height: 120px; margin-bottom: 10px;">
                            {{ signature_image }}
                        </div>
                        <hr style="width: 250px; border: 1px solid #000; margin: 0 auto;">
                        <p style="margin-top: 10px; font-size: 14px;"><strong>Firma del Paciente</strong></p>
                        <p style="margin-top: 5px; font-size: 14px;">{{ patient_name }}</p>
                    </td>
                </tr>
            </table>
        </div>
        ';

        // ContractTemplate::create([
        //     'title' => 'Consentimiento informado estándar',
        //     'content' => trim($dentalConsentHtml),
        //     'type' => 'consentimiento',
        //     'is_active' => true,
        // ]);

        $privacyNoticeHtml = '
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
            <h2 style="text-align: center; color: #1e3a8a;">Aviso de Privacidad y Tratamiento de Datos Personales</h2>
            <p style="text-align: right;">Fecha: <strong>{{ date }}</strong></p>
            
            <p>
                En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, 
                se le informa a <strong>{{ patient_name }}</strong> que sus datos personales y sensibles, 
                incluyendo su historial clínico, serán utilizados de manera estrictamente confidencial con fines médicos, 
                diagnósticos y de contacto.
            </p>

            <table style="width: 100%; margin-top: 80px;">
                <tr>
                    <td style="text-align: center; width: 100%;">
                        <div style="min-height: 120px; margin-bottom: 10px;">
                            {{ signature_image }}
                        </div>
                        <hr style="width: 250px; border: 1px solid #000; margin: 0 auto;">
                        <p style="margin-top: 10px; font-size: 14px;"><strong>Acepto los términos</strong></p>
                        <p style="margin-top: 5px; font-size: 14px;">{{ patient_name }}</p>
                    </td>
                </tr>
            </table>
        </div>
        ';

        // ContractTemplate::create([
        //     'title' => 'Aviso de privacidad',
        //     'content' => trim($privacyNoticeHtml),
        //     'type' => 'aviso_privacidad',
        //     'is_active' => true,
        // ]);
        $serviceContractHtml = '
        <div style="position: fixed; top: 25%; left: 0; width: 100%; text-align: center; z-index: -1; opacity: 0.15;">
            <img src="{{ clinica_logo }}" style="width: 80%; max-width: 600px; height: auto;">
        </div>

        <div style="font-family: \'DejaVu Sans\', Arial, sans-serif; color: #333; padding: 20px;">
            
            <div style="text-align: right; margin-bottom: 30px; font-size: 14px;">
                Tepic, Nayarit a los {{ dia_actual }} días del mes de {{ mes_actual }} del año {{ anio_actual }}
            </div>

            <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">
                Convenio de Prestación de Servicios
            </h3>

            <p style="text-align: justify; line-height: 1.6; font-size: 14px;">
                En el PRESENTE contrato de prestación de servicios dentales profesionales que celebran por una parte la <strong>“{{ clinica_nombre }}”</strong>, que en lo sucesivo se le denominará <strong>“LA CLÍNICA”</strong>, y por otra el paciente <strong>{{ patient_name }}</strong> que en lo sucesivo se le denominará <strong>“EL PACIENTE”</strong> respecto al tratamiento de: <strong>{{ tratamiento_descripcion }}</strong>.
            </p>

            <p style="text-align: justify; line-height: 1.6; font-size: 14px;">
                Dicho tratamiento tiene un costo inicial de <strong>${{ costo_inicial_numero }}</strong> (<strong>{{ costo_inicial_letra }} MN</strong>).
            </p>

            <p style="text-align: justify; line-height: 1.6; font-size: 14px;">
                En caso de tratamiento de <strong>ORTODONCIA</strong> el pago inicial incluye: Valoración Inicial, RX de diagnóstico iniciales (lat. de Cráneo y Ortopantomografía) y la Colocación de los BRACKETS SUPERIORES. Iniciando su primera mensualidad al realizar la colocación de los BRACKETS INFERIORES. Las mensualidades del tratamiento de ORTODONCIA tienen un costo de $600 pesos.
            </p>

            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #ccc;">

            <h4 style="text-transform: uppercase; margin-bottom: 15px;">Cláusulas</h4>

            <ol style="text-align: justify; line-height: 1.6; font-size: 13px; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Compromiso de Calidad:</strong> LA CLINICA se compromete a realizar el tratamiento descrito, con las más altas normas de calidad y eficiencia profesional que rigen las reglas de salud y ética profesional.</li>
                <li style="margin-bottom: 8px;"><strong>Intervención de Terceros:</strong> LA CLINICA NO SE HACE RESPONSABLE si una persona ajena cambia o modifica los tratamientos realizados por nuestros profesionales y LA CLINICA SE DESLINDA DE TODA RESPONSABILIDAD.</li>
                <li style="margin-bottom: 8px;"><strong>Responsabilidad del Paciente:</strong> EL PACIENTE se compromete a cumplir su responsabilidad en cuanto a realizarse TODOS los tratamientos indicados por nuestros profesionales.</li>
                <li style="margin-bottom: 8px;"><strong>Mantenimiento Preventivo:</strong> En caso de tratamientos de ORTODONCIA, EL PACIENTE deberá hacerse sus limpiezas cada 4 meses con la finalidad de prevenir cualquier tipo de infección periodontal, extracciones en caso de ser necesario y Cirugías de terceras molares.</li>
                <li style="margin-bottom: 8px;"><strong>Incumplimiento:</strong> LA CLINICA podrá abstenerse de continuar con los tratamientos en caso de que el paciente no cumpla con sus responsabilidades.</li>
                <li style="margin-bottom: 8px;"><strong>Factores Biológicos:</strong> EL PACIENTE acepta que el desarrollo de nuestros tratamientos y el resultado de estos estará influenciado por la respuesta biológica de los tejidos, higiene, crecimiento y desarrollo, hábitos, etc. En caso de tratamientos ORTODONTICOS además dependerá que el paciente use sus retenedores siguiendo las indicaciones de nuestros profesionales.</li>
                <li style="margin-bottom: 8px;"><strong>Abandono de Tratamiento:</strong> Si EL PACIENTE falta a sus CITAS por un periodo mayor a 3 meses, se considerara como tratamiento SUSPENDIDO, en este caso EL PACIENTE se hará responsable de las consecuencias que puedan presentarse y la clínica se deslinda de toda responsabilidad.</li>
                <li style="margin-bottom: 8px;"><strong>Reanudación:</strong> En caso de que EL PACIENTE quiera retomar su tratamiento será valorado y evaluado por nuestros profesionales; para retomar el tratamiento SUSPENDIDO EL PACIENTE deberá pagar una multa de 600 pesos a cuenta de los meses de ausencia; sin embargo, la clínica se reserva si se retoma o no el tratamiento.</li>
                <li style="margin-bottom: 8px;"><strong>Riesgos y Limitaciones:</strong> En caso de tratamientos de ORTODONCIA EL PACIENTE esta consciente y conoce los riesgos, limitaciones y posibles consecuencias que implica como por ejemplo manchas en el esmalte, inflamación y sangrado de las encías, reabsorción de las raíces dentales, así como también recidiva por falta de uso de los retenedores, etc.</li>
                <li style="margin-bottom: 8px;"><strong>Facturación e Impuestos:</strong> En caso de requerir recibos de honorarios para deducción de impuestos, solicitarlo en el momento de su pago correspondiente. No se expedirán recibos fiscales de pagos realizados en otro mes que no sea el mes en curso.</li>
                <li style="margin-bottom: 8px;"><strong>Videovigilancia:</strong> Se hace del conocimiento de EL PACIENTE que por su seguridad, la clínica cuenta con sistema de video vigilancia las 24 hrs.</li>
                <li style="margin-bottom: 8px;"><strong>Políticas de Reembolso:</strong> Una vez aceptado el presente contrato, no se harán devoluciones de dinero (pagos u abonos).</li>
                <li style="margin-bottom: 8px;"><strong>Propiedad Clínica:</strong> El EXPEDIENTE CLINICO ASI COMO SUS AUXILIARES DE DIAGNOSTICO SON PROPIEDAD EXCLUSIVA DE LA CLINICA.</li>
            </ol>

            <table style="width: 100%; text-align: center; font-size: 14px; margin-top: 50px; border-collapse: collapse;">
                <tr>
                    <td style="width: 50%;"></td>
                    <td style="width: 50%; border-bottom: 1px solid #000; padding-bottom: 5px; height: 110px; vertical-align: bottom;">
                        {{ signature_image }}
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td style="padding-top: 5px; font-style: italic; font-size: 12px; color: #555;">
                        Firma de conformidad<br>
                        <strong>{{ patient_name }}</strong>
                    </td>
                </tr>
            </table>
        </div>
        ';

        ContractTemplate::create([
            'title' => 'Contrato de servicios',
            'content' => trim($serviceContractHtml),
            'type' => 'contrato',
            'is_active' => true,
        ]);
    }
}
