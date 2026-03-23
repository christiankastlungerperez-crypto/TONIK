const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

(async function() {
  console.log("--- Diagnóstico Resend ---");
  console.log("Clave detectada:", process.env.RESEND_API_KEY ? "SÍ (empieza por " + process.env.RESEND_API_KEY.substring(0,5) + "...)" : "NO");

  try {
    const data = await resend.emails.send({
      from: 'Agencia Tonik <notificaciones@agenciatonik.com>',
      to: ['christian.kastlunger.perez@gmail.com'], // Cambiar por tu email de registro
      subject: 'Test de Conexión CRM',
      html: '<strong>Si lees esto, la configuración de Resend en el servidor es correcta.</strong>'
    });

    console.log("Respuesta de API:", JSON.stringify(data, null, 2));
    if (data.error) {
        console.error("❌ Error de Resend:", data.error.message);
    } else {
        console.log("✅ ¡Envío procesado! Revisa tu bandeja de entrada (y SPAM).");
    }
  } catch (error) {
    console.error("❌ Error fatal al conectar:", error.message);
  }
})();
