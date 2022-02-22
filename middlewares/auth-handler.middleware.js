
const jwt = require('jsonwebtoken');
const jwt_secret = process.env['JWT_SECRET'];
const { User } = require('../models/user.model');

const authVerify = async (req, res, next) => {

  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);

    userId: decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
       res.status(403).json({ message: "Unauthorised access" });
      return;
    }
    req.user = user;
    next();

  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorised access", errMessage: error.message })
  }
};

module.exports = authVerify;
