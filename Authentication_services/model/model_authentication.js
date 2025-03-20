const mongoose = require('mongoose');

const AuthenticationSchema = new mongoose.Schema({
  ID: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  Name: {  // 🆕 Thêm trường Name
    type: String,
    required: true
  },
  department: {  // 🆕 Thêm trường Department
    type: String,
    required: true
  }
});

const Authentication = mongoose.model('Authentication', AuthenticationSchema);

module.exports = Authentication;
