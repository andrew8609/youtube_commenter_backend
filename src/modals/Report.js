const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
    required: true,
  },
  comment_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "comment"
  },
  reported_by: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
    required: true
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

const Report = mongoose.model('report', reportSchema);

module.exports = Report;
