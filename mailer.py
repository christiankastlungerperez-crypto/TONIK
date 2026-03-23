import resend
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configurar la API Key de Resend
resend.api_key = os.environ.get("RESEND_API_KEY")

def enviar_notificacion_crm(email_destino, asunto, contenido_html):
    """
    Envía un correo electrónico utilizando la API de Resend.
    """
    try:
        r = resend.Emails.send({
            "from": "CRM Tonik <notificaciones@agenciatonik.com>", # Asegúrate de usar tu dominio verificado
            "to": email_destino,
            "subject": asunto,
            "html": contenido_html
        })
        print(f"✅ Correo enviado con éxito a {email_destino}")
        return True
    except Exception as e:
        print(f"❌ Error al enviar el correo: {e}")
        return False
