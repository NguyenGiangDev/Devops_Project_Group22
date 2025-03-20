const mongoose = require('mongoose');

const PersonalSchema = new mongoose.Schema({
  ID: {
    type: String,
    required: true
  },
  Name: {
    type: String,
    required: true
  },
  Time: {
    type: String,
    required: true
  }
 
});

const Personal = mongoose.model('Personal',PersonalSchema);

module.exports = Personal;
