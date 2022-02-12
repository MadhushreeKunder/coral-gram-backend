const {SocialProfile} = require("../models/social-profile.model");

const getViewerDetailsFromDb = async (req, res, next) => {

  try {
    const userId = req.user._id;
    const viewer = await SocialProfile.findOne({ userId});
    if (!viewer){
      res.status(403).json({
        success: false,
        message: "User not found!"
      });
      return;
    } 
    req.viewer = viewer;
    next();

  } catch(error){
    console.log(error);
    res.status(500).json({
      message: "Request failed. Check errorMessage for more details",
      errorMessage: error.message
    });
  }
}

module.exports = { getViewerDetailsFromDb};