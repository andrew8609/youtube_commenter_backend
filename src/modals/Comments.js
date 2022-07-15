const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "post",
    required: true,
  },
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  note: {
    type: String,
  },
  aspect_ratio: {
    type: String,
  },
  duration: {
    type: String
  },
  liked_by: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "user"
  },
  like_count: {
    type: Number,
    default: 0
  },
  comment_by: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user"
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
})

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
