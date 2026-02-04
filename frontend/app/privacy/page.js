'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 text-rose-200 hover:text-rose-300 mb-8 transition font-light">
          <FiArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-light mb-8 bg-gradient-to-r from-rose-300 to-rose-200 bg-clip-text text-transparent">
          Política de Privacidad
        </h1>

        <div className="space-y-8 text-white/80 font-light">
          <section>
            <h2 className="text-2xl font-light text-rose-200 mb-4">1. Introducción</h2>
            <p>
              LushSecret ("nosotros", "nuestro" o "nos") opera el sitio web LushSecret.com. Esta página te informa sobre nuestras políticas 
              respecto a la recopilación, uso y divulgación de datos personales cuando usas nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-rose-200 mb-4">2. Información que Recopilamos</h2>
            <p className="mb-3">Recopilamos varios tipos de información en conexión con los servicios que proporcionamos, incluyendo:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Información de Cuenta:</strong> Nombre, correo electrónico, número de teléfono, dirección</li>
              <li><strong>Información de Pago:</strong> Datos de tarjeta de crédito/débito (procesados de forma segura)</li>
              <li><strong>Información de Envío:</strong> Dirección de envío, información de seguimiento</li>
              <li><strong>Información de Navegación:</strong> Historial de búsqueda, productos visualizados, preferencias</li>
              <li><strong>Cookies y Tecnologías Similares:</strong> Identificadores de dispositivo, datos de sesión</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-rose-200 mb-4">3. Cómo Utilizamos Tu Información</h2>
            <p className="mb-3">Utilizamos la información recopilada para:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Procesar tu pedido y enviar productos</li>
              <li>Comunicarme contigo sobre tu cuenta y pedidos</li>
              <li>Mejorar nuestros servicios y la experiencia del usuario</li>
              <li>Enviar promociones y actualizaciones (con tu consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Prevenir fraude y actividad ilegal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-rose-200 mb-4">4. Seguridad de Datos</h2>
            <p>
              Implementamos medidas de seguridad apropiadas para proteger tu información personal contra acceso no autorizado, 
              alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico 
              es 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-rose-200 mb-4">5. Cookies y Tecnologías de Rastreo</h2>
            <p className="mb-3">
              Utilizamos cookies para mejorar tu experiencia. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo. 
              Puedes controlar las cookies a través de la configuración de tu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-rose-200 mb-4">6. Terceros y Compartición de Datos</h2>
            <p className="mb-3">
              Podemos compartir tu información con:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Proveedores de servicios de pago (para procesar pagos)</li>
              <li>Empresas de envío y logística</li>
              <li>Proveedores de email y marketing</li>
              <li>Autoridades legales (cuando sea requerido por ley)</li>
            </ul>
            <p className="mt-3">
              No vendemos tu información personal a terceros para propósitos de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-rose-200 mb-4">7. Tus Derechos</h2>
            <p className="mb-3">Según la ley aplicable, tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Acceder a tu información personal</li>
              <li>Solicitar la corrección de datos inexactos</li>
              <li>Solicitar la eliminación de tu información</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
              <li>Recibir una copia de tus datos</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, contáctanos en privacy@lushsecret.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Retención de Datos</h2>
            <p>
              Conservamos tu información personal durante el tiempo necesario para proporcionarte nuestros servicios y cumplir 
              con obligaciones legales. Los datos de pago se eliminan después de completar la transacción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cambios en Esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos enviando 
              un aviso a tu correo electrónico o publicando la política actualizada en nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad o nuestras prácticas de privacidad, contáctanos en:
            </p>
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <p><strong>Email:</strong> privacy@lushsecret.com</p>
              <p><strong>Sitio Web:</strong> www.lushsecret.com</p>
            </div>
          </section>

          <section className="pt-8 border-t border-white/10">
            <p className="text-sm text-white/60">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
