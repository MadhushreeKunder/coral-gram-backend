var mongoose = require('mongoose');
const { Schema} = mongoose;

const SocialProfileSchema = new Schema({

  username: {
    type: String,
    unique: 'Username already exists',
    required: 'Username is required',
    index: true,
  },

  avatar: {
    type: String,
    default: 'https://bit.ly/broken-link',
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'UserId is required',
    unique: 'Account already exists',
  },

  followers: [
    { 
      type: Schema.Types.ObjectId,
      ref: 'SocialProfile',
    },
  ],

  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SocialProfile'
    },
  ],
  
});

const SocialProfile = mongoose.model('SocialProfile', SocialProfileSchema);

module.exports = { SocialProfile };