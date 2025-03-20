const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  loaiPhong: {
    type: String,
    required: true
  },
  Manager: {
    type: String,
    required: true
  },
  roomnumber: {
    type: String,
    required: true
  }
});

const Department = mongoose.model('Department', DepartmentSchema);

module.exports = Department;
