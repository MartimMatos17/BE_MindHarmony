const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Função para configurar o transporte de e-mail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Função para envio manual de e-mail
const sendManualEmail = async (to, { name, latitude, longitude }) => {
  try {
    if (!to || !name || !latitude || !longitude) {
      throw new Error('Parâmetros insuficientes para enviar o e-mail.');
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Latitude e longitude devem ser números válidos.');
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Mind Harmony" <${process.env.EMAIL_USER}>`,
      to,
      subject: '🚨 Alerta de Localização Manual',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
          <h1 style="color: #e74c3c; text-align: center;">🚨 Alerta de Localização Manual</h1>
          <p style="font-size: 18px; color: #333;">O usuário <strong>${name}</strong> enviou manualmente sua localização:</p>
          <ul style="font-size: 16px; color: #555; list-style-type: none; padding: 0;">
            <li>📍 <strong>Localização:</strong>
              <a href="https://www.google.com/maps?q=${latitude},${longitude}"
                 style="color: #3498db; text-decoration: none;" target="_blank">
                Visualizar no Google Maps
              </a>
            </li>
          </ul>
          <div style="margin-top: 20px; text-align: center;">
            <iframe 
              width="600" 
              height="450" 
              style="border:0; border-radius: 10px;" 
              loading="lazy" 
              allowfullscreen 
              src="https://www.google.com/maps/embed/v1/place?key=${process.env.MAPS_API_KEY}&q=${latitude},${longitude}">
            </iframe>
          </div>
          <p style="font-size: 16px; color: #555; margin-top: 20px;">
            <em>Essa mensagem foi gerada automaticamente pelo sistema Mind Harmony.</em>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`🚀 E-mail enviado manualmente com sucesso para: ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar e-mail manual: ${error.message}`);
    return false;
  }
};

// Rota para envio manual de e-mail
router.post('/send-manual-email', async (req, res) => {
  const { to, name, latitude, longitude } = req.body;

  if (!to || !name || !latitude || !longitude) {
    return res.status(400).json({ error: 'Parâmetros insuficientes para enviar o e-mail.' });
  }

  try {
    const emailSent = await sendManualEmail(to, { name, latitude, longitude });

    if (emailSent) {
      return res.status(200).json({ message: 'E-mail enviado manualmente com sucesso.' });
    } else {
      return res.status(500).json({ error: 'Erro ao enviar o e-mail manual.' });
    }
  } catch (error) {
    console.error('Erro ao processar o envio manual:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

module.exports = router;
