var mongoose = require('mongoose');
const { Schema} = mongoose;
const { SocialProfile } = require('./social-profile.model');

const PostSchema = new Schema({

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'SocialProfile',
      },

      caption: String,

      content: {
        type: String,
        required: 'Content for post is required'
      },

      media: {
        type: String,
        default: '',
      },

      likes: [
        {
          type: Schema.Types.ObjectId, ref: 'SocialProfile'
        }
      ],  
  }, {
    timestamps: true,
  
});

const Post = mongoose.model('Post', PostSchema);

module.exports = { Post };