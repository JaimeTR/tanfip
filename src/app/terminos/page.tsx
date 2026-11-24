import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones para reservar y recibir atención en TANFIP.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <LegalPage
      titulo="Términos y condiciones"
      intro={`Al usar esta web y solicitar una cita con ${site.name} aceptas las siguientes condiciones. Son simples y buscan que la atención sea clara para ti y para nosotros.`}
    >
      <section>
        <h2>1. Qué ofrecemos</h2>
        <p>
          Servicios de fisioterapia y Pilates en Mat a cargo de {site.owner}. Esta web sirve para informarte y solicitar una cita; no es una consulta médica en
          línea ni reemplaza la valoración presencial.
        </p>
      </section>

      <section>
        <h2>2. Cómo funcionan las citas</h2>
        <ul>
          <li>Enviar el formulario es una solicitud: la cita queda confirmada cuando te respondemos por WhatsApp, llamada o correo.</li>
          <li>Podemos proponerte otro horario si el elegido ya no está disponible.</li>
          <li>Las reservas se hacen con al menos un día de anticipación.</li>
          <li>Te enviaremos un recordatorio un día antes; no recibirlo no cancela tu cita.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cambios y cancelaciones</h2>
        <p>
          Si no puedes asistir, avísanos con la mayor anticipación posible para reprogramar y dejar el espacio a otra persona. Las inasistencias repetidas sin
          aviso pueden limitar nuevas reservas.
        </p>
      </section>

      <section>
        <h2>4. Información de salud</h2>
        <p>
          Debes darnos información veraz y completa sobre tu estado de salud, antecedentes y medicamentos. El tratamiento se adapta a esos datos; omitirlos puede
          poner en riesgo tu seguridad.
        </p>
      </section>

      <section>
        <h2>5. Alcance de la atención</h2>
        <p>
          La fisioterapia no sustituye la atención médica. Si tienes una urgencia o síntomas graves (dolor intenso repentino, pérdida de fuerza o sensibilidad,
          dificultad para respirar, entre otros), acude de inmediato a un servicio de emergencias. Los resultados dependen de cada persona y no se garantizan.
        </p>
      </section>

      <section>
        <h2>6. Pagos</h2>
        <p>El precio y la forma de pago se te informan antes o al inicio de la atención. Enviar el formulario no genera ningún cobro.</p>
      </section>

      <section>
        <h2>7. Uso de la web</h2>
        <p>
          Los textos, fotos y marca de {site.name} pertenecen a sus titulares o se usan con licencia (ver <a href="/creditos">créditos de fotos</a>). No está
          permitido copiarlos con fines comerciales ni usar el formulario para enviar datos falsos o de otras personas sin su permiso.
        </p>
      </section>

      <section>
        <h2>8. Datos personales</h2>
        <p>
          Tratamos tus datos como explicamos en la <a href="/privacidad">política de privacidad</a>.
        </p>
      </section>

      <section>
        <h2>9. Cambios y contacto</h2>
        <p>
          Podemos actualizar estos términos; la versión vigente es la publicada aquí. Para consultas, escríbenos por WhatsApp o llama al {site.phoneDisplay}. Se
          aplica la legislación peruana.
        </p>
      </section>
    </LegalPage>
  );
}
