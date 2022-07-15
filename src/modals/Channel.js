const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String
  },
  thumbnail_image_url: {
    type: String,
  },
  youtube_channel_id: {
    type: String,
    unique: true
  },
  user_id: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
})

const Channel = mongoose.model('channel', channelSchema);

module.exports = Channel;
