const express = require("express");
const router = express.Router();

const { authVerify } = require("../middlewares/auth-handler.middleware");
const { getViewerDetailsFromDb } = require("../middlewares/get-viewer-details-from-db");

const {getPostCleaned} = require("../utils/get-post-cleaned");


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
      errorMessage: error.message
    })
  }
})
.post(async (req,res) => {
  try {
    const {viewer} = req;
    const postDetails = req.body;
    let newPost = new Post({...postDetails, userId: viewer._id});
    await newPost.save();

    await newPost.populate({ path: 'userId', select: 'userName avatar'}).execPopulate();

    newPost = getPostCleaned(newPost, viewer._id);
    res.status(200).json({
      response: newPost,
    });

  } catch(error){
    console.log(error);
      res.status(500).json({
      success: false,
      message: "Request failed, please check error message for more details",
      errorMessage: error.message
    })
  }
})
 