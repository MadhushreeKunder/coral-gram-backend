const jwt = require("jsonwebtoken");
const jwt_secret = process.env['JWT_SECRET'];

const authVerify = async (req, res, next) => {

  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);

    userId: decoded.userId;
    const user = await User.findById(userId);

    if (!user){
    return res.status(401).json({message: "Unauthorised access"});
    }
    req.user = user;
    next();

  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorised access", errMessage: error.message})
  }
};

module.exports = { authVerify };
