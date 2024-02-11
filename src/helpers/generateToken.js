


const jwt = require('jsonwebtoken');

const tokenSign = async (user) => {
  const { _id, email, tenantId, rol } = user;
  const payload = { userId: _id, email, tenantId, rol };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: '1h' };
  const token = jwt.sign(payload, secret, options);
  return token;
}



const crearToken= async (user)=> {
  const { _id, email, tenantId, rol } = user;
  const payload = { userId: _id, email, tenantId, rol };

  return jwt.sign(payload,  process.env.JWT_SECRET, { expiresIn: '1h' });
}
module.exports = { tokenSign, crearToken};
