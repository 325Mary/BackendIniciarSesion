const express = require('express');
const upload = require('../middleware/multerMiddleware');
const validarTokenMiddleware = require('../middleware/userAuthentication')
const checkRol = require('../middleware/roleAuth')
const { postUser, postLogin, getUsers, activeUser, changePassword, solicitarRestablecimiento, restablecerContraseña, logout} = require('../controlller/user.controller');

const routes = express.Router();

routes.post('/registrer', upload.single('imgfirme'),   postUser);
routes.post('/iniciarSesion', postLogin);
routes.get('/getUsers',validarTokenMiddleware , checkRol(['SuperUsuario','Gerente','Contador']),getUsers);
routes.put('/user/:id/active', validarTokenMiddleware, checkRol(['SuperUsuario', 'Gerente']),  activeUser);
routes.put('/users/:id/change-password',  changePassword);
routes.post('/solicitar-restablecimiento', solicitarRestablecimiento);
routes.post('/restablecer-password', restablecerContraseña);
routes.post('/cerrar_sesion',validarTokenMiddleware,  logout)


module.exports = routes;
