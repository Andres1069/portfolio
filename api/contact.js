import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido.' });

  const { from_name, from_email, message } = req.body;

  // Validaciones
  if (!from_name || !from_email || !message) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from_email)) {
    return res.status(400).json({ success: false, message: 'Correo electrónico no válido.' });
  }

  // Configuración Gmail SMTP
  // Las credenciales vienen de variables de entorno en Vercel (nunca en el código)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,  // tu correo Gmail
      pass: process.env.GMAIL_PASS,  // App Password de Gmail (no tu contraseña normal)
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portafolio RG" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: from_email,
      subject: `Contacto desde portafolio — ${from_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 32px; background: #f8faff; border-left: 4px solid #2a6480;">
          <h2 style="color: #0f1420; margin-bottom: 24px;">Nuevo mensaje desde tu portafolio</h2>
          <p><strong>Nombre:</strong> ${from_name}</p>
          <p><strong>Correo:</strong> <a href="mailto:${from_email}">${from_email}</a></p>
          <hr style="margin: 20px 0; border-color: #e2e8f0;">
          <p><strong>Mensaje:</strong></p>
          <p style="color: #3a4560; line-height: 1.7;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: '¡Mensaje enviado! Te respondo pronto.' });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ success: false, message: 'Error al enviar. Intenta de nuevo.' });
  }
}
