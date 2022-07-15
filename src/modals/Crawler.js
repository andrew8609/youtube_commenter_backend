const mongoose = require('mongoose');

const crawlSchema = new mongoose.Schema({
  // total_posts: {
  //   type: Number,
  //   required: true,
  // },
  // type: {
  //   type: String
  // },
  // created_at: {
  //   type: Date,
  //   default: Date.now(),
  // },
  channel_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "channel",
    required: true,
  },
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  thumbnail_url: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  view_count: {
    type: Number,
    default: 0
  },
  like_count: {
    type: Number,
    default: 0
  },
  dislike_count: {
    type: Number,
    default: 0
  },
  aspect_ratio: {
    type: String,
  },
  duration: {
    type: String
  },
  role: {
    type: String
  },
  posted_as: {
    type: String
  },
  liked_by: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "user"
  },
  disliked_by: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "user"
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  last_updated: {
    type: Date,
    default: Date.now(),
  },
})

const Crawler = mongoose.model('crawler', crawlSchema);

module.exports = Crawler;
