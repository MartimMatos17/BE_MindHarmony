const nodemailer = require('nodemailer');

exports.sendEmail = async (req, res) => {
  const { subject, text } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'MindHarmony17@gmail.com', 
    subject: subject || 'Nova mensagem de contato - Mind Harmony',
    text: `
      Prezada equipe Mind Harmony,

      Você recebeu uma nova mensagem de contato pelo chat de suporte do site.

      Detalhes da mensagem:

      Assunto: ${subject || 'Sem assunto especificado'}
      
      Mensagem:
      "${text}"

      Por favor, entre em contato com o remetente assim que possível para oferecer o suporte necessário.

      Atenciosamente,
      Equipe de Suporte Automático
      Mind Harmony
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
};
