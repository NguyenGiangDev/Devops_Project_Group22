const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const axios = require('axios');
const pidusage = require('pidusage');
const Employee = require('../model/model_employee');

// 📌 Healthcheck Endpoint
router.get('/healthz', async (req, res) => {
  let dbStatus = "ok";

  // Kiểm tra kết nối Database (MongoDB)
  try {
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    console.error("Lỗi kết nối Database:", error);
    dbStatus = "unhealthy";
  }

  // 📌 Lấy thông tin CPU & RAM Usage
  const cpuUsage = os.loadavg()[0]; // CPU Load trung bình trong 1 phút
  const memoryUsage = process.memoryUsage().rss / (1024 * 1024); // RAM sử dụng (MB)

  // 📌 Lấy CPU & RAM cụ thể của process này (service)
  let processStats = { cpu: 0, memory: 0 };
  try {
    const stats = await pidusage(process.pid);
    processStats = { cpu: stats.cpu, memory: stats.memory / (1024 * 1024) };
  } catch (error) {
    console.error("Lỗi khi lấy CPU/RAM process:", error);
  }

  const status = {
    authentication_service: "ok",
    database: dbStatus,
    system_cpu_load: cpuUsage.toFixed(2) + " %",
    system_memory_used: memoryUsage.toFixed(2) + " MB",
    process_cpu: processStats.cpu.toFixed(2) + " %",
    process_memory: processStats.memory.toFixed(2) + " MB"
  };

  // Nếu Database lỗi, trả về HTTP 503
  if (dbStatus !== "ok") {
    return res.status(503).json(status);
  }

  res.json(status);
});

// GET tất cả nhân viên
router.get('/', async (req, res, next) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

// POST thêm nhân viên mới
router.post('/', async (req, res) => {
  const { name, position, phone } = req.body;
  
  if (!name || !position || phone === undefined) {
    return res.status(400).json({ message: 'Name, position, and phone are required.' });
  }
  

  try {
    // Thay localhost bằng service name `department-service` trong Docker Compose
    const departmentServiceURL = 'http://department-service:3002';

    // Gửi yêu cầu xác minh phòng ban
    const response = await axios.get(`${departmentServiceURL}/department/check?position=${position}`,);

    if (response.status === 200 && response.data.exists) {
      const newEmployee = new Employee({ name, position, phone });
      await newEmployee.save();
      return res.status(200).json({ message: 'Employee added successfully.' });
    } else {
      return res.status(404).json({ message: 'Department does not exist fyckfyck.' });
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(500).json({ message: 'Request to department service timed out.' });
    }
    if (error.response) {
      return res.status(error.response.status).json({ message: error.response.data.message || 'Department service error' });
    }
    return res.status(500).json({ message: 'Error contacting department service.' });
  }
});

// Xóa nhân viên theo name
router.post('/delete', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Tên nhân viên là bắt buộc.' });
  }

  try {
    const employee = await Employee.findOneAndDelete({ name });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Lỗi khi xóa nhân viên:', error);
    res.status(500).json({ message: 'Lỗi khi xóa nhân viên' });
  }
});

// Lấy danh sách nhân viên theo phòng ban
router.get('/position', async (req, res) => {
  const { department } = req.query;

  if (!department) {
    return res.status(400).json({ message: 'Phòng ban (department) là bắt buộc.' });
  }

  try {
    const employees = await Employee.find({ position: department });

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không có nhân viên nào thuộc phòng ban này.' });
    }

    res.status(200).json(employees);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên.' });
  }
});

// Kiểm tra tình trạng của dịch vụ nhân viên
router.get('/message', (req, res) => {
  res.status(200).json({ message: 'Dịch vụ nhân viên đang hoạt động!' });
});

module.exports = router;
