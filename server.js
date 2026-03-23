const express = require('express');
const cors = require('cors');
const setupDB = require('./database');
const path = require('path');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servimos index.html y el resto de recursos gráficso
app.use(express.static(path.join(__dirname)));

// Función autoejecutable para iniciar SQLite antes de abrir Express
(async () => {
    const db = await setupDB();

    app.get('/api/data', async (req, res) => {
        try {
            const rows = await db.all("SELECT key_name, data_json FROM app_state");
            let responseData = {
                customers: null,
                recordings: null,
                chatMessages: null,
                tasksList: null
            };
            
            rows.forEach(r => {
                if (r.key_name === 'crm_customers') responseData.customers = JSON.parse(r.data_json);
                if (r.key_name === 'crm_recordings') responseData.recordings = JSON.parse(r.data_json);
                if (r.key_name === 'crm_chatMessages') responseData.chatMessages = JSON.parse(r.data_json);
                if (r.key_name === 'crm_tasksList') responseData.tasksList = JSON.parse(r.data_json);
            });

            res.json(responseData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error leyendo de la base de datos local' });
        }
    });

    app.post('/api/save', async (req, res) => {
        const { key, data } = req.body;
        const jsonStr = JSON.stringify(data);

        try {
            await db.run(
                `INSERT INTO app_state (key_name, data_json) VALUES (?, ?) 
                 ON CONFLICT(key_name) DO UPDATE SET data_json = excluded.data_json`,
                [key, jsonStr]
            );
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error guardando en la BBDD SQLite' });
        }
    });

    // --- NUEVOS ENDPOINTS DE NOTIFICACIÓN ---
    app.post('/api/send-email', async (req, res) => {
        const { to, subject, body } = req.body;
        console.log(`📩 [Resend] Intentando enviar email a: ${to}...`);
        
        if (!resend) {
            console.warn("⚠️ ERROR: RESEND_API_KEY no encontrada en el .env");
            return res.status(500).json({ success: false, error: "Servidor: Falta API Key en el archivo .env" });
        }
        try {
            const data = await resend.emails.send({
                from: 'Agencia Tonik <notificaciones@agenciatonik.com>',
                to: [to],
                subject: subject,
                html: body
            });
            
            if (data.error) {
                console.error("❌ ERROR API Resend:", data.error);
                return res.status(400).json({ success: false, error: data.error.message });
            }
            
            console.log("✅ Email enviado con éxito:", data.id);
            res.json({ success: true, id: data.id });
        } catch (e) {
            console.error("❌ ERROR FATAL Servidor:", e.message);
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/send-whatsapp', (req, res) => {
        const { to, message } = req.body;
        console.log(`📱 [WhatsApp] Para: ${to}, Msg: ${message}`);
        // Aquí se integraría Twilio/Meta en el futuro
        res.json({ success: true, simulated: true });
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor CRM y Base de Datos corriendo en http://localhost:${PORT}`);
    });
})();
