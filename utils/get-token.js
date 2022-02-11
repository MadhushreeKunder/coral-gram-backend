const jwt = require('jsonwebtoken');
const jwt_secret = process.env['JWT_SECRET'];

const generateToken = (userId) => {
  return jwt.sign({userId}, jwt_secret, {expiresIn: '24h'});
}

module.exports = {generateToken};