// controllers/websiteControllers/siteAuthController.js
const SiteUser = require('../../models/websiteModels/SiteUser'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cadastro de novo usuário do site
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await SiteUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new SiteUser({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error });
  }
};

// Login de usuário do site
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await SiteUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Inclui o username na resposta junto com a mensagem de sucesso e o token
    res.status(200).json({ 
      message: 'Login bem-sucedido!', 
      token: token,
      username: user.username // Certifique-se de que o username está sendo incluído aqui
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error });
  }
};
