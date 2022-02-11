var mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({

    email: {
      type: String,
      required: 'Email id is required',
      unique: 'Account already exists for this email',
    },

    password: {
      type: String,
      required: 'Password is required',
    },

    username: {
      type: String,
      required: 'Username is required'
    },

  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', UserSchema);

module.exports = { User };