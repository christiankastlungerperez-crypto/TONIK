from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from mailer import enviar_notificacion_crm

app = Flask(__name__)
# Activamos CORS para que tu index.html u otro frontend pueda hacer peticiones sin bloqueo
CORS(app)

@app.route('/')
def index():
    return "<h1>CRM Antigravity Online</h1><p>Estado: Funcionando en la nube</p>"

# Endpoint para añadir un cliente y enviar correo
@app.route('/nuevo_cliente', methods=['POST'])
def nuevo_cliente():
    # En Flask obtenemos los parámetros así:
    params = request.get_json() or {}
    nombre = params.get('nombre', 'Desconocido')
    email = params.get('email')
    
    # 1. Aquí iría tu lógica de guardado en base de datos
    print(f"Borrador: Guardando al cliente {nombre} en BBDD...")
    
    # 2. Enviamos el correo usando Resend a la función que creamos
    email_enviado = False
    if email:
        email_enviado = enviar_notificacion_crm(
            email, 
            f"Bienvenido {nombre}", 
            f"<strong>¡Hola {nombre}!</strong> Gracias por unirte a nuestro CRM de Tonik."
        )
    
    return jsonify({
        "status": "ok", 
        "message": "Cliente procesado exitosamente",
        "email_status": "enviado" if email_enviado else "no_enviado"
    })

# --- EL COMANDO CRÍTICO PARA RENDER ---
if __name__ == '__main__':
    # Render asigna un puerto dinámico, lo capturamos con os.environ
    port = int(os.environ.get("PORT", 8000))
    
    # Usamos 0.0.0.0 para que sea accesible desde internet, no solo local
    print(f"🚀 Arrancando servidor Antigravity en el puerto {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
