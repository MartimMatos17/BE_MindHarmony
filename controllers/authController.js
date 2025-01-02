const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact'); // Importar o modelo de contato de emergência

// Função de registro (Sign Up)
exports.register = async (req, res) => {
  const { username, email, password, confirmPassword, gender, birthdate, emergencyContact } = req.body;

  try {
    // Validação do nome de utilizador
    if (username.length > 30) {
      return res.status(400).send({ error: 'O nome de utilizador não pode ter mais de 30 caracteres.' });
    }

    // Validação da senha
    if (password.length < 8 || password.length > 30) {
      return res.status(400).send({ error: 'A senha deve ter entre 8 e 30 caracteres.' });
    }

    // Verificar se as senhas coincidem
    if (password !== confirmPassword) {
      return res.status(400).send({ error: 'As senhas não coincidem.' });
    }

    // Validação da data de nascimento (maior de 18 anos)
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    const dayDifference = today.getDate() - birthDateObj.getDate();

    if (age < 18 || (age === 18 && (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))) {
      return res.status(400).send({ error: 'O utilizador deve ter pelo menos 18 anos.' });
    }

    // Converter o email para minúsculas
    const lowerCaseEmail = email.toLowerCase();

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lowerCaseEmail)) {
      return res.status(400).send({ error: 'Por favor insira um email válido.' });
    }

    // Verificar se o email já existe
    const emailExists = await User.findOne({ email: lowerCaseEmail });
    if (emailExists) {
      return res.status(400).send({ error: 'O email já está registado.' });
    }

    // Validação do ID do contato de emergência
    if (emergencyContact) {
      const contactExists = await EmergencyContact.findById(emergencyContact);
      if (!contactExists) {
        return res.status(400).send({ error: 'O contato de emergência fornecido não existe.' });
      }
    }

    // Encriptar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo utilizador
    const user = new User({
      username,
      email: lowerCaseEmail,
      password: hashedPassword,
      gender,
      birthdate: birthDateObj,
      emergencyContact, // Salvar o ID do contato de emergência
    });

    await user.save();

    res.status(201).send({ message: 'Utilizador registado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registar o utilizador:', err);
    res.status(400).send({ error: 'Erro ao registar o utilizador', details: err.message });
  }
};
// Função de login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Converter o email para minúsculas
    const lowerCaseEmail = email.toLowerCase();

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lowerCaseEmail)) {
      return res.status(400).send({ error: 'Por favor insira um email válido.' });
    }

    // Verificar se o utilizador existe
    const user = await User.findOne({ email: lowerCaseEmail }).populate('emergencyContact');
    if (!user) {
      return res.status(400).send({ error: 'Email ou password incorretos.' });
    }

    // Verificar se a senha está correta
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).send({ error: 'Email ou password incorretos.' });
    }

    // Gerar o token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Resposta com os dados do utilizador e token
    res.status(200).send({
      token,
      user: {
        username: user.username,
        email: user.email,
        emergencyContact: user.emergencyContact || null, // Retorna o contato de emergência, se existir
      },
    });
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).send({ error: 'Erro ao fazer login', details: err.message });
  }
};
