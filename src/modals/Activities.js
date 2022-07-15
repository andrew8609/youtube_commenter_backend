const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'user',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
})

const Activity = mongoose.model('activity', activitySchema);

module.exports = Activity;
