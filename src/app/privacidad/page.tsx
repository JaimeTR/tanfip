import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo TANFIP trata tus datos personales y de salud.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      titulo="Política de privacidad"
      intro="Para atenderte necesitamos algunos datos personales y de salud. Aquí te explicamos cuáles, para qué los usamos y cómo los cuidamos, conforme a la Ley N.° 29733, Ley de Protección de Datos Personales del Perú, y su reglamento."
    >
      <section>
        <h2>1. Quién es la responsable</h2>
        <p>
          {site.owner}, titular de {site.name} (fisioterapia y Pilates en Mat), es la responsable del tratamiento de tus datos. Puedes escribirnos por WhatsApp o
          llamar al {site.phoneDisplay}.
        </p>
      </section>

      <section>
        <h2>2. Qué datos recogemos</h2>
        <ul>
          <li>Datos de contacto: nombre, edad, teléfono, correo y, si lo indicas, DNI y dirección.</li>
          <li>Datos de tu cita: servicio, fecha y hora elegidos.</li>
          <li>Datos de salud (datos sensibles): motivo de consulta, zonas de dolor, patología, antecedentes y medicamentos, solo los que tú nos compartes en el formulario o durante la atención.</li>
          <li>Durante el tratamiento: notas de evolución, plan de tratamiento y los informes o estudios que decidas entregarnos.</li>
        </ul>
      </section>

      <section>
        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Gestionar tu solicitud y tu cita, y avisarte si cambia (por WhatsApp, llamada o correo).</li>
          <li>Enviarte un recordatorio un día antes de tu cita.</li>
          <li>Valorar tu caso y darte una atención fisioterapéutica segura y personalizada.</li>
          <li>Llevar tu historia clínica y cumplir las obligaciones legales de la atención de salud.</li>
        </ul>
        <p>No vendemos tus datos ni los usamos para publicidad de terceros.</p>
      </section>

      <section>
        <h2>4. Tu consentimiento</h2>
        <p>
          Al marcar la casilla del formulario nos autorizas a tratar tus datos, incluidos los de salud, para las finalidades anteriores. Puedes retirar tu
          consentimiento en cualquier momento; esto no afecta al tratamiento realizado antes, y puede impedir que sigamos atendiéndote.
        </p>
      </section>

      <section>
        <h2>5. Con quién los compartimos</h2>
        <p>
          Solo con proveedores que nos permiten operar el sitio: alojamiento y base de datos, y el servicio de envío de correos. Actúan por encargo nuestro y no
          pueden usar tus datos para otros fines. Los datos de salud solo los ve la profesional; el personal de recepción accede únicamente a tus datos de
          contacto y de la cita. Solo los entregaremos a una autoridad cuando la ley lo exija.
        </p>
      </section>

      <section>
        <h2>6. Cuánto tiempo los conservamos</h2>
        <p>
          Mientras dure la atención y durante el plazo que exige la normativa para las historias clínicas. Las solicitudes que no se convierten en atención se
          eliminan cuando dejan de ser necesarias.
        </p>
      </section>

      <section>
        <h2>7. Cómo los protegemos</h2>
        <p>
          El panel de gestión exige usuario y contraseña, separa lo que ve cada rol, y las conexiones van cifradas. Los archivos clínicos solo se abren con sesión
          de la profesional. Ningún sistema es infalible, pero aplicamos medidas razonables para evitar accesos no autorizados.
        </p>
      </section>

      <section>
        <h2>8. Tus derechos</h2>
        <p>
          Puedes pedir acceso a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO). Escríbenos por WhatsApp o llama al {site.phoneDisplay}
          indicando tu nombre y qué necesitas; responderemos en los plazos de la ley. Si consideras que no atendimos tu pedido, puedes acudir a la Autoridad
          Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.
        </p>
      </section>

      <section>
        <h2>9. Cookies y almacenamiento</h2>
        <p>
          Esta web no usa cookies de publicidad ni de seguimiento. Solo guarda en tu navegador, de forma temporal, el resumen de tu solicitud para mostrarte la
          página de confirmación. El panel de gestión usa una cookie técnica de sesión, necesaria para iniciar sesión.
        </p>
      </section>

      <section>
        <h2>10. Cambios</h2>
        <p>Si actualizamos esta política, publicaremos la nueva versión en esta página con su fecha.</p>
      </section>
    </LegalPage>
  );
}
