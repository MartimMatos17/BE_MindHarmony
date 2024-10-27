const bcrypt = require('bcryptjs');

async function testBcrypt() {
  const password = 'password123';

  // Gerar o salt e encriptar a senha
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log('Senha encriptada:', hashedPassword);

  // Comparar a senha encriptada com a senha original
  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('A senha corresponde?', isMatch); // Deve ser true
}

// Executar a função de teste
testBcrypt();

