const Role = require('../models/roles.model'); // Importa el modelo de la colección de roles

const checkRol = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      // Verifica si el usuario tiene un rol
      if (!req.user || !req.user.rol) {
        return res.status(403).json({ error: 'Acceso prohibido' });
      }

      // Consulta el nombre del rol correspondiente al ObjectId
      const role = await Role.findById(req.user.rol);
      if (!role || !role.nameRol) {
        return res.status(403).json({ error: 'Acceso prohibido' });
      }

      // Verifica si el nombre del rol está en los roles permitidos
      if (rolesPermitidos.includes(role.nameRol)) {
        // Si el rol es válido, permite continuar con la solicitud
        next();
      } else {
        // Si el rol no es válido, devuelve un error de acceso prohibido
        return res.status(403).json({ error: 'Acceso prohibido' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error en validar el rol' });
    }
  };
};

module.exports = checkRol;
