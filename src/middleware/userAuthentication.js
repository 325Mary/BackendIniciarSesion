const jwt = require('jsonwebtoken');
const ResponseStructure = require('../helpers/ResponseStructure');
const  listaNegraService  = require('../services/blackList.service');

const validarTokenMiddleware = async (req, res, next) => {
  try {
    if (!req || !req.headers || !req.headers.authorization) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const tokenBearer = token.split(' ')[1];
    const tokenEnListaNegra = await listaNegraService.tokenEnListaNegra(token);
    if (tokenEnListaNegra) {
      return res.status(401).json({ error: 'El token está en la lista negra' });
    }

    jwt.verify(tokenBearer, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: 'Token no válido' });
      }
      req.user = decodedToken;
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en validarTokenMiddleware' });
  }
};

module.exports = validarTokenMiddleware;
