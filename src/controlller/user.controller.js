const { createUser, 
  loginUser, 
  getUsers,
  activeUser,
  changeUserPassword,
  generarCodigoRestablecimiento,
  enviarCorreoRestablecimiento,
  restablecerContraseña,
  logout
  } = require('../services/user.services');

const User = require('../models/user.model');

const companyModel = require('../models/compay.model')

const rolModel= require ('../models/roles.model')
const bcrypt = require('bcrypt');
const ResponseStructure = require('../helpers/ResponseStructure')





const controller = {};

//crear usuario 
controller.postUser = async (req, res) => {
  await createUser(req, res);
};

//activar usuario
controller.activeUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const activedUser = await activeUser(userId); 
    res.status(200).json(activedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//iniciar sesion
controller.postLogin = async (req, res) => {
  await loginUser(req, res);
};



//listar usuarios
controller.getUsers = async (req, res) => {
  try {
    const listUsers = await User.find().populate({
      path: 'tenantId',
      model: companyModel,
    })
    .populate({
      path: 'rol',
      model: rolModel
    })

    res.json(listUsers); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Cambiar contraseña
controller.changePassword = async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  try {
    await changeUserPassword(userId, newPassword);
    res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//restablecer contraseña

controller.solicitarRestablecimiento = async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await User.findOne({ email: email });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const codigoRestablecimiento = generarCodigoRestablecimiento();
    usuario.resetCode = codigoRestablecimiento;
    // Establecer la expiración del código de restablecimiento (por ejemplo, 1 hora)
    usuario.resetExpires = Date.now() + 3600000; // 1 hora en milisegundos
    await usuario.save();

    await enviarCorreoRestablecimiento(email, codigoRestablecimiento);

    res.json({ success: 'Solicitud de restablecimiento enviada con éxito' });
  } catch (error) {
    console.error('Error al solicitar restablecimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

controller.restablecerContraseña = async (req, res) => {
  try {
    const { email, codigo, nuevaContraseña } = req.body;

    console.log(`Solicitud de restablecimiento de contraseña para ${email} con código ${codigo}`);

    const usuario = await User.findOne({ email: email, resetCode: codigo });

    if (!usuario) {
      return res.status(400).json({ error: 'El código de restablecimiento proporcionado es inválido.' });
    }

    // Verificar si el código ha caducado
    if (usuario.resetExpires < Date.now()) {
      return res.status(400).json({ error: 'El código de restablecimiento ha caducado. Solicita un nuevo restablecimiento.' });
    }

    // Restablecer la contraseña y limpiar el código
    usuario.password = await bcrypt.hash(nuevaContraseña, 12);
    usuario.resetCode = null;
    usuario.resetExpires = null;
    usuario.firstLogin = false;

    await usuario.save();

    console.log(`Contraseña restablecida con éxito para ${email}`);
    res.json({ success: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};



//cerrar sesion
controller.logout =async(req,res)=>{
  try {
    const token = req.headers.authorization;
    // Realizar el logout usando el servicio
    const result = await logout(token);
    // Respondemos con éxito
    ResponseStructure.status = 200;
    ResponseStructure.message = 'Logout exitoso';
    ResponseStructure.data = result;
    res.status(200).json(ResponseStructure);
  } catch (error) {
    // Manejar errores
    ResponseStructure.status = 500;
    ResponseStructure.message = 'Error al cerrar sesión';
    ResponseStructure.data = error.message;
    res.status(500).json(ResponseStructure);
  }
}

module.exports = controller;
