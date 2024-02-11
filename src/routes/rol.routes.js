const express = require('express');
const router = express.Router();
const validarTokenMiddleware = require('../middleware/userAuthentication')
const checkRol = require('../middleware/roleAuth')

const {
    newRol,
    getRoles
} = require("../controlller/rol,controller");

router.get("/getRoles", validarTokenMiddleware, checkRol(['SuperUsuario', 'Gerente']), getRoles);
router.post("/newRol", newRol);

module.exports = router;
