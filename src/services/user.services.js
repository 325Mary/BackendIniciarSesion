const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Role= require('../models/roles.model')
const listaNegraService = require('../services/blackList.service');
const sendEmailUsers = require('../helpers/sendEmailUser')

// Tu lógica para el servicio de usuario aquí


// Crear usuarios
const createUser = async (req, res) => {
  try {
    const defaultPassword = req.body.identification; // Utilizar la identificación como contraseña por defecto

    // Hashear la contraseña por defecto antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Buscamos el rol del usuario por su ID
    const role = await Role.findById(req.body.rol);

    // Establecer el estado del usuario según el rol
    let status = 'activo'; // Por defecto, el estado es "activo"
if (role && role.nameRol !== 'SuperUsuario')
if(role && role.nameRol !== 'Contador')
{
  status = 'pendiente'; // Si no es "SuperUsuario" ni "Contador", establecemos el estado como "pendiente"
}

    // Crear el usuario
    const user = await User.create({
      username: req.body.username,
      identification: req.body.identification,
      empresa: req.body.empresa,
      email: req.body.email,
      password: hashedPassword,
      telephone: req.body.telephone,
      direction: req.body.direction,
      imgfirme:  req.file ? req.file.path : null,
      status: status,
      rol: req.body.rol,
      firstLogin: true // Nuevo campo para verificar el primer inicio de sesión
    });

    // Datos del usuario a enviar por correo
    let userData = {
      username: user.username,
      identification: user.identification,
      empresa: user.empresa,
      email: user.email,
      telephone: user.telephone,
      direction: user.direction,
      status: user.status
    };

    // Si el rol del usuario es "contador", enviar todos los datos
    if (role && role.nameRol === 'Contador') {
      await sendEmailUsers(userData)

    }

    res.json({ user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};




//activar usuario
const activeUser = async (userId) => {
  try {
    // Activar el usuario en la base de datos
    const user = await User.findByIdAndUpdate(userId, { status: 'activo' }, { new: true }); 
    
    // Enviar correo electrónico de confirmación
    await sendEmailUsers(user);
    
    return user; 
  } catch (error) {
    throw new Error("Error al activar el usuario: " + error.message);
  }
};


// Iniciar sesión
const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const pass = await bcrypt.compare(req.body.password, user.password);
    if (!pass) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si es el primer inicio de sesión
    if (user.firstLogin) {
      // Indicar al cliente que debe cambiar la contraseña
      return res.status(200).json({ message: 'Por favor, cambie su contraseña.' });
    }

    // Si el inicio de sesión es exitoso y no es el primer inicio de sesión, enviar el token
    res.json({ success: 'Inicio de sesión correcto', token: crearToken(user)  });

    
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



// Crear token
// Crear token
function crearToken(user) {
  const { _id, email, tenantId, rol } = user;
  const payload = { userId: _id, email, tenantId, rol };
  console.log("Atributos del payload:", payload); // Imprimir el payload
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: '1h' };
  const token = jwt.sign(payload, secret, options);
  return token;
}




// Listar Usuarios
const getUsers = async () => {
  return await User.find();
};

// Cambiar contraseña del usuario
const changeUserPassword = async (userId, newPassword) => {
  try {
    // Obtener el usuario de la base de datos
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Hashear y actualizar la nueva contraseña
    user.password = await bcrypt.hash(newPassword, 12);
    
    // Actualizar firstLogin a false
    user.firstLogin = false;

    // Guardar el documento actualizado en la base de datos
    await user.save();
  } catch (error) {
    throw new Error('Error al cambiar la contraseña: ' + error.message);
  }
};


//restablecer contraseña

const generarCodigoRestablecimiento = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); 
};

const enviarCorreoRestablecimiento = async (email, codigo) => {
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
      from: 'litterbox212@gmail.com',
      to: email,
      subject: 'Código de Restablecimiento de Contraseña',
      text: `Tu código de restablecimiento es: ${codigo}`,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Correo de restablecimiento enviado a', email);
  } catch (error) {
      console.error('Error al enviar el correo de restablecimiento:', error);
      throw error;
  }
};

const restablecerContraseña = async (email, codigo, nuevaContraseña) => {
  try {
    console.log(`Intento de restablecimiento de contraseña para ${email} con código ${codigo}`);

    const usuario = await User.findOne({ resetCode: codigo, email: email });

    if (!usuario) {
      console.error(`Código de restablecimiento inválido para ${email}: ${codigo}`);
      throw new Error('Código de restablecimiento inválido');
    }

    // Verificar la vigencia del código de restablecimiento
    if (usuario.resetExpires < Date.now()) {
      console.error(`El código de restablecimiento ha caducado para ${email}: ${codigo}`);
      throw new Error('El código de restablecimiento ha caducado');
    }

    console.log(`Usuario encontrado para ${email}:`, usuario);

    // Restablecer la contraseña y limpiar el código
    usuario.password = await bcrypt.hash(nuevaContraseña, 12);
    usuario.resetCode = null;
    usuario.resetExpires = null; // Limpiar también la marca de tiempo de expiración
    usuario.firstLogin = false;
    
    await usuario.save();

    return { success: 'Contraseña restablecida con éxito' };
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    throw error;
  }
}


//cerrar sesion
const logout = async (token) => {
  try {
    // Verificar si el token está en la lista negra en la base de datos
    const tokenEnListaNegra = await listaNegraService.tokenEnListaNegra(token);
    if (tokenEnListaNegra) {
      console.log('Token ya revocado.');
      throw new Error('Token already revoked.');
    }

    // Agregar el token a la lista negra
    await listaNegraService.agregarToken(token);
    console.log('Token agregado a la lista negra:', token);

    // Otras operaciones de cierre de sesión según sea necesario

    return { success: true, message: 'Logout successful.' };
  } catch (error) {
    console.error(error);
    throw new Error(`Error al cerrar sesión: ${error.message}`);
  }
}


module.exports = {
  createUser,
  loginUser,
  getUsers,
  activeUser,
  changeUserPassword,
  generarCodigoRestablecimiento,
  enviarCorreoRestablecimiento,
  restablecerContraseña,
  logout
};
