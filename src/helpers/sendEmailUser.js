const nodemailer = require('nodemailer');

// Función para enviar correo con los datos del usuario
const sendEmailUsers = async (userData) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    service: 'gmail',
    auth: {
      user: 'litterbox212@gmail.com',
      pass: 'rtpr yunf crkt daif'
    }
  });

  const mailOptions = {
    from: 'litterbox212@gmail.com', // Cambiar por tu correo
    to: userData.email,
    subject: 'Datos de usuario creado',
    html: `
      <h1>Datos de usuario creado</h1>
      <p>Nombre de usuario: ${userData.email}</p>
      <p>Password: ${userData.identification}</p>
     
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado con los datos del usuario:', userData.email);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

module.exports = 
    sendEmailUsers

