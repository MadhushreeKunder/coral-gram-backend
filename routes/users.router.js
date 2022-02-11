const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const {authVerify} = require("../middlewares/auth-handler.middleware");
const {generateToken} = require('../utils/get-token');


router.route('/')
.post(async(req, res) => {
  try{
    const userData = req.body;
    const user = await User.findOne({ email: userData.email});

    if (user){
      res.status(409).json({
        message: "Account already exists for this email"
      });
      return;
    }

    const NewUser = new User(userData);
    const salt = await bcrypt.genSalt(10);
    NewUSer.password = await bcrypt.hash(NewUser.password, salt);

    await NewUser.save();

    const token = generateToken(NewUser._id);
    res.status(201).json({
      response: {
        username: NewUser.username, token
      }
    });

  } catch (error) {
		console.error(error);
		res.status(500).json({
      success: false,
			message: 'Something went wrong!',
			errorMessage: error.message,
		});
	}
})