const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  recommendation: {
    type: String,
    required: true
  }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
