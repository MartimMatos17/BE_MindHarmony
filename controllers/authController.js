const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Função de registo (Sign Up)
exports.register = async (req, res) => {
  const { username, email, password, confirmPassword, gender, birthdate } = req.body;

  // Validação do nome de utilizador
  if (username.length > 30) {
    return res.status(400).send({ error: 'O nome de utilizador não pode ter mais de 30 caracteres.' });
  }

  // Validação da senha (mínimo de 8 caracteres e máximo de 30)
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

  // Validação do formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(lowerCaseEmail)) {
    return res.status(400).send({ error: 'Por favor insira um email válido.' });
  }

  // Verificar se o email já existe
  try {
    console.log('Registando utilizador...');

    const emailExists = await User.findOne({ email: lowerCaseEmail });
    if (emailExists) {
      return res.status(400).send({ error: 'O email já está registado.' });
    }

    // Encriptar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Log da senha encriptada
    console.log('Senha encriptada gerada no terminal:', hashedPassword); 

    // Criar novo utilizador
    const user = new User({
      username,
      email: lowerCaseEmail,
      password: hashedPassword,
      gender,
      birthdate: birthDateObj
    });

    await user.save();

    // Verificar após salvar o utilizador
    const savedUser = await User.findOne({ email: lowerCaseEmail });
    console.log('Senha salva no MongoDB:', savedUser.password); 

    res.status(201).send({ message: 'Utilizador registado com sucesso!' });

  } catch (err) {
    console.error('Erro ao registar o utilizador:', err);
    res.status(400).send({ error: 'Erro ao registar o utilizador', details: err.message });
  }
};

// Função de login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Converter o email para minúsculas antes de buscar no banco de dados
  const lowerCaseEmail = email.toLowerCase();

  // Validação do formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(lowerCaseEmail)) {
    return res.status(400).send({ error: 'Por favor insira um email válido.' });
  }

  try {
    console.log('Tentando login com o email:', lowerCaseEmail);

    // Verificar se o utilizador existe
    const user = await User.findOne({ email: lowerCaseEmail });
    if (!user) {
      return res.status(400).send({ error: 'Email ou password incorretos.' });
    }

    console.log('Senha do utilizador no MongoDB:', user.password); // Log da senha armazenada no MongoDB
    console.log('Senha introduzida:', password); // Log da senha introduzida

    // Verificar se a senha está correta
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).send({ error: 'Email ou password incorretos.' });
    }

    console.log('Login bem-sucedido para o utilizador:', user.username);

    // Gerar e enviar o token JWT com expiração de 1h
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.header('auth-token', token).send({ token });

  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).send({ error: 'Erro ao fazer login', details: err.message });
  }
};
