const mongoose = require('mongoose');

const crawlerStatusSchema = new mongoose.Schema({
  is_on: {
    type: Boolean,
    default: true,
  }
})

const CrawlerStatus = mongoose.model('crawlerStatus', crawlerStatusSchema);

module.exports = CrawlerStatus;
