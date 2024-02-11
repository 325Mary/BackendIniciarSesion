const blackListedToken = require('../models/blackListedToken.model');

const listaNegraService = {
  async agregarToken(token) {
const nuevoToken = new blackListedToken({ token: token.toString() });
    await nuevoToken.save();
  },

  async tokenEnListaNegra(token) {
    return blackListedToken.exists({ token: token.toString() });
  },
};

module.exports = listaNegraService; // Asegúrate de exportar el objeto que contiene la función tokenEnListaNegra
