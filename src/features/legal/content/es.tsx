import Link from "next/link";

import { brand } from "@/config/brand";

/**
 * Long-form legal texts in Spanish. They are content, not UI strings, so they live here
 * instead of messages/es.json (ADR-0010). For a new locale add `content/<locale>.tsx`.
 * IMPORTANT: have a lawyer review any change before publishing.
 */
const owner = brand.legalOwner;

function OwnerData() {
  return (
    <ul>
      <li>
        <strong>Titular:</strong> {owner.name}
      </li>
      <li>
        <strong>Nombre comercial:</strong> {brand.name}
      </li>
      <li>
        <strong>NIF:</strong> {owner.taxId}
      </li>
      <li>
        <strong>Domicilio:</strong> {owner.address}
      </li>
      <li>
        <strong>Correo electrónico:</strong> {brand.email}
      </li>
    </ul>
  );
}

export function LegalNotice() {
  return (
    <>
      <section>
        <h2>1. Datos identificativos</h2>
        <OwnerData />
      </section>
      <section>
        <h2>2. Objeto</h2>
        <p>
          Este aviso legal regula el acceso y uso del sitio web {brand.domain} (el «Sitio Web»).{" "}
          {brand.name} es un tablón de anuncios en el que personas y empresas («Promotores»)
          publican oportunidades de inversión inmobiliaria y otros usuarios («Inversores») pueden
          consultarlas y contactar directamente con ellos.
        </p>
        <p>
          {brand.name} no intermedia en las operaciones, no recibe ni gestiona fondos, no presta
          asesoramiento financiero y no es parte de ningún acuerdo entre Promotores e Inversores.
        </p>
      </section>
      <section>
        <h2>3. Condiciones de acceso</h2>
        <p>
          La consulta de oportunidades es libre. Para ver los datos de contacto de los Promotores,
          descargar documentación o publicar oportunidades es necesario registrarse. El uso de la
          plataforma implica la aceptación de las <Link href="/terminos">condiciones de uso</Link>.
        </p>
      </section>
      <section>
        <h2>4. Responsabilidad</h2>
        <ul>
          <li>
            La información de cada oportunidad (rentabilidades, plazos, documentación, fotos) es
            publicada por su Promotor, que es el único responsable de su veracidad y exactitud.
          </li>
          <li>
            Las rentabilidades mostradas son estimaciones del Promotor y no están garantizadas. Toda
            inversión conlleva riesgos, incluida la pérdida total o parcial del capital.
          </li>
          <li>
            El contenido del Sitio Web tiene carácter informativo y no constituye una oferta
            vinculante ni asesoramiento financiero, legal o fiscal. Antes de invertir, revisa la
            documentación y consulta con profesionales independientes.
          </li>
          <li>
            {brand.name} no garantiza la disponibilidad ininterrumpida del Sitio Web y retirará los
            contenidos que infrinjan la ley o sus condiciones cuando tenga conocimiento de ellos.
          </li>
        </ul>
      </section>
      <section>
        <h2>5. Propiedad intelectual</h2>
        <p>
          La marca, el diseño y el software del Sitio Web pertenecen a su titular. Los Promotores
          conservan los derechos sobre los contenidos que publican y conceden a {brand.name} una
          licencia no exclusiva para mostrarlos en la plataforma.
        </p>
      </section>
      <section>
        <h2>6. Legislación aplicable</h2>
        <p>
          Se aplica la legislación española. Para cualquier controversia, las partes se someten a
          los juzgados y tribunales de {owner.jurisdiction}, salvo que la normativa de consumidores
          establezca otro fuero.
        </p>
      </section>
    </>
  );
}

export function Terms() {
  return (
    <>
      <section>
        <h2>1. Qué es {brand.name}</h2>
        <p>
          Un marketplace que facilita el contacto entre Promotores e Inversores. Publicar y
          consultar oportunidades es gratuito. {brand.name} no participa en las operaciones ni cobra
          comisiones por ellas.
        </p>
      </section>
      <section>
        <h2>2. Cuenta de usuario</h2>
        <ul>
          <li>Debes facilitar datos veraces y mantener la confidencialidad de tu acceso.</li>
          <li>Una misma cuenta puede consultar oportunidades y publicarlas.</li>
          <li>
            Para publicar es obligatorio indicar un teléfono de contacto. Puedes elegir mostrarlo u
            ofrecer en su lugar un enlace para agendar citas.
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Política de publicación</h2>
        <p>Al publicar una oportunidad, el Promotor declara que:</p>
        <ul>
          <li>Tiene capacidad y autorización para ofrecerla.</li>
          <li>La información, cifras, fotos y documentos son veraces y no inducen a error.</li>
          <li>
            Cumple la normativa aplicable (incluida la relativa a la captación de financiación).
          </li>
        </ul>
        <p>Está prohibido publicar:</p>
        <ul>
          <li>Oportunidades ficticias, duplicadas o de terceros sin autorización.</li>
          <li>Promesas de rentabilidad garantizada o información engañosa.</li>
          <li>Contenido ilícito, ofensivo, discriminatorio o que vulnere derechos de terceros.</li>
          <li>Datos personales de terceros sin su consentimiento.</li>
          <li>Publicidad ajena a oportunidades inmobiliarias concretas.</li>
        </ul>
      </section>
      <section>
        <h2>4. Moderación</h2>
        <p>
          Los anuncios se publican de inmediato. Cualquier usuario puede denunciar un anuncio.{" "}
          {brand.name} puede retirar anuncios que incumplan estas condiciones (indicando el motivo
          al Promotor) y suspender las cuentas de quienes las incumplan de forma grave o reiterada.
        </p>
      </section>
      <section>
        <h2>5. «Me interesa» y datos de contacto</h2>
        <p>
          Al pulsar «Me interesa» compartes tu nombre y correo electrónico con el Promotor de esa
          oportunidad para que pueda contactarte. Los datos de contacto que obtengas en la
          plataforma solo pueden usarse para tratar la oportunidad correspondiente.
        </p>
      </section>
      <section>
        <h2>6. Anuncios sin fecha de cierre</h2>
        <p>
          Si el Promotor no indica una fecha de cierre, el anuncio permanece visible hasta que lo
          retire. En el buscador se priorizan las oportunidades destacadas y, después, las más
          recientes.
        </p>
      </section>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <section>
        <h2>1. Responsable del tratamiento</h2>
        <OwnerData />
      </section>
      <section>
        <h2>2. Qué datos tratamos y para qué</h2>
        <ul>
          <li>
            <strong>Cuenta:</strong> nombre, correo electrónico y credenciales de acceso, para
            gestionar tu registro y tu sesión.
          </li>
          <li>
            <strong>Promotores:</strong> teléfono y, opcionalmente, un enlace de agenda, para que
            los Inversores registrados puedan contactarte.
          </li>
          <li>
            <strong>Inversores que pulsan «Me interesa»:</strong> nombre y correo electrónico, que
            se muestran al Promotor de esa oportunidad.
          </li>
          <li>
            <strong>Contenido publicado</strong> (anuncios, fotos, documentos) y denuncias, para
            prestar el servicio y moderarlo.
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Base jurídica</h2>
        <ul>
          <li>Ejecución del servicio que solicitas al registrarte (art. 6.1.b RGPD).</li>
          <li>
            Tu consentimiento al pulsar «Me interesa» (art. 6.1.a RGPD), que puedes retirar
            desmarcándolo.
          </li>
          <li>
            Interés legítimo en mantener la seguridad y moderar la plataforma (art. 6.1.f RGPD).
          </li>
        </ul>
      </section>
      <section>
        <h2>4. Encargados del tratamiento</h2>
        <p>
          Los datos de tu cuenta (nombre, correo y teléfono) se almacenan en Clerk, Inc., proveedor
          de autenticación que actúa como encargado del tratamiento con garantías adecuadas
          (cláusulas contractuales tipo). Nuestra base de datos solo guarda un identificador técnico
          de tu cuenta, no tus datos personales. Los archivos se almacenan en Cloudflare R2 y la web
          se aloja en Vercel.
        </p>
        <p>No cedemos tus datos a terceros salvo obligación legal.</p>
      </section>
      <section>
        <h2>5. Conservación</h2>
        <p>
          Mientras mantengas tu cuenta. Si la eliminas, tus anuncios se retiran y tus datos se
          suprimen, salvo los que debamos conservar por obligación legal.
        </p>
      </section>
      <section>
        <h2>6. Tus derechos</h2>
        <p>
          Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y
          portabilidad escribiendo a {brand.email}. También puedes reclamar ante la Agencia Española
          de Protección de Datos (aepd.es).
        </p>
      </section>
    </>
  );
}

export function Cookies() {
  return (
    <>
      <section>
        <h2>1. Qué son las cookies</h2>
        <p>
          Pequeños ficheros que un sitio web guarda en tu navegador para funcionar correctamente o
          recordar información.
        </p>
      </section>
      <section>
        <h2>2. Cookies que usamos</h2>
        <ul>
          <li>
            <strong>No usamos cookies de análisis, publicidad ni seguimiento.</strong>
          </li>
          <li>
            Solo usamos cookies técnicas estrictamente necesarias, principalmente las de Clerk para
            mantener tu sesión iniciada de forma segura. Estas cookies están exentas de
            consentimiento.
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Cómo gestionarlas</h2>
        <p>
          Puedes bloquear o eliminar las cookies desde la configuración de tu navegador; si bloqueas
          las técnicas, no podrás iniciar sesión.
        </p>
      </section>
    </>
  );
}
