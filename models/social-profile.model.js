var mongoose = require('mongoose');
const { Schema} = mongoose;
const { User} = require("./user.model");

const SocialProfileSchema = new Schema({

  userName: {
    type: String,
    unique: 'Username already exists',
    required: 'Username is required',
    index: true,
  },

  avatar: {
    type: String,
    default: 'https://www.k2e.com/wp-content/uploads/2018/09/person-icon.png',
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
  
  bio: {
		type: String,
		default: '',
	},
	link: {
		type: String,
		default: '',
	},
  
});

const SocialProfile = mongoose.model('SocialProfile', SocialProfileSchema);

module.exports = { SocialProfile };