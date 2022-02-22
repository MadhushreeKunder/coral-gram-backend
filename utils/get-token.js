const jwt = require('jsonwebtoken');
const jwt_secret = process.env['JWT_SECRET'];

const generateToken = (userId) => {
  const token = jwt.sign({userId}, jwt_secret, {expiresIn: '24h'});
  return token;
}

module.exports = {generateToken};