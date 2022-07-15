const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  profile_image: {
    type: String,
  },
  role: {
    type: String
  },
  is_activated: {
    type: Boolean,
    default: false,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  following: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "user"
  },
  followers: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "user"
  },
  last_signed_ip: {
    type: String,
  },
  last_signed_date: {
    type: Date,
    default: Date.now(),
  },
  view_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  }
})

const User = mongoose.model('user', userSchema);

module.exports = User;
