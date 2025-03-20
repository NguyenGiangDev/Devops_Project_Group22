const Employee = require('../model/model_employee');

// Tạo một nhân viên mới
exports.createEmployee = async (req, res) => {
  const newEmployee = new Employee(req.body);
  try {
      await newEmployee.save();
      res.redirect('/api/employees/add?message=Employee added successfully'); // Thêm thông báo vào URL
  } catch (error) {
      res.redirect('/api/employees/add?message=Error creating employee'); // Thêm thông báo vào URL
  }
};
