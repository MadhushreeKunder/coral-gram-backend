const express = require("express");
const router = express.Router();
const { authVerify } = require("../middlewares/auth-handler.middleware");

const { getViewerDetailsFromDb } = require("../middlewares/get-viewer-details-from-db");


router.user(authVerify);
router.use(getViewerDetailsFromDb);

router.route('/')
.get(async (req, res) => {
  try {
    const { viewer } = req;

    const posts = await Post.find({
      userId: { $in: [...viewer.following, viewer._id]},
    }).populate({ path: 'userId', select: "userName Avatar"
    }).sort({ createdAt: -1});

    for (post of posts){
      post = getPostCleaned(post, viewer._id);
    }
    res.status(200).json({ success: true, response: posts});

  } catch (error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Request failed, please check error message for more details",
      errorMessage: error.message;
    })
  }
})
.post(async (req,res))
 