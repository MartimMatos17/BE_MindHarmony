const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Biblioteca para enviar emails

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'Utilizador não encontrado' });
    }

    // Gerar token de redefinição de senha
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hora de validade

    await user.save();

    // Enviar email com o token
    const resetUrl = `https://yourapp.com/reset-password/${resetToken}`;
    const message = `Recebemos um pedido de redefinição de senha. Clique no link para redefinir a senha: ${resetUrl}`;

    // Configuração do email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Redefinição de Senha',
      text: message,
    });

    res.status(200).send({ message: 'Email de redefinição de senha enviado' });
  } catch (err) {
    res.status(400).send({ error: 'Erro ao enviar email de redefinição', details: err.message });
  }
};
