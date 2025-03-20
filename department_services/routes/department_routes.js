const express = require('express');
const router = express.Router();
const Department = require('../model/model_department');
const axios = require('axios'); // Thêm axios để thực hiện HTTP request

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
  let processStats;
  try {
    processStats = await psutil(process.pid);
  } catch (error) {
    console.error("Lỗi khi lấy CPU/RAM process:", error);
    processStats = { cpu: 0, memory: 0 };
  }

  const status = {
    authentication_service: "ok",
    database: dbStatus,
    system_cpu_load: cpuUsage.toFixed(2) + " %",
    system_memory_used: memoryUsage.toFixed(2) + " MB",
    process_cpu: processStats.cpu.toFixed(2) + " %",
    process_memory: (processStats.memory / (1024 * 1024)).toFixed(2) + " MB"
  };

  // Nếu Database lỗi, trả về HTTP 503
  if (dbStatus !== "ok") {
    return res.status(503).json(status);
  }
  
  res.json(status);
});
// POST thêm phòng ban mới
router.post('/', async (req, res, next) => {
  const { loaiPhong, Manager, roomnumber } = req.body;

  // Xác thực dữ liệu đầu vào
  if (!loaiPhong && !Manager && !roomnumber) {
    return res.status(400).json({ message: 'Loại phòng ban là bắt buộc.' });
  }

  try {
  
    
  
    // Tạo phòng ban mới với loaiPhong và SoLuongNV
    const newDepartment = new Department({
      loaiPhong,
      Manager,
      roomnumber
    });

    // Lưu phòng ban vào cơ sở dữ liệu
    const department = await newDepartment.save();

    res.status(201).json(department); // Trả về thông tin phòng ban mới tạo
  } catch (error) {
    console.error('Lỗi khi gọi employee_services:', error.message);
    next(error); // Gọi middleware xử lý lỗi
  }
});

// Route để lấy danh sách phòng ban
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find(); // Lấy danh sách từ cơ sở dữ liệu
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách phòng ban.' });
  }
});
//

  // Route để lấy danh sách nhân viên theo phòng ban
  router.get('/employees', async (req, res) => {
    const { department } = req.query; // Lấy loại phòng ban từ query string

    // Xác thực đầu vào
    if (!department) {
      return res.status(400).json({ message: 'Phòng ban (department) là bắt buộc.' });
    }

    const EmployeeApiUrl = 'http://localhost:3001';

    try {
      // Gửi yêu cầu đến employee_services để lấy danh sách nhân viên
      const response = await axios.get(`${EmployeeApiUrl}/employees/position?department=${department}`);
      const employees = response.data;  

      if (employees.length === 0) {
        return res.status(404).json({ message: 'Không có nhân viên nào thuộc phòng ban này.' });
      }

      // Trả về danh sách nhân viên
      res.status(200).json(employees);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error.message);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên.' });
    }
  });
//
// API để kiểm tra xem phòng ban có tồn tại không
router.get('/check', async (req, res) => {
  const { position } = req.query; // Lấy giá trị position từ query parameters

  try {
    // Tìm các phòng ban theo position (hoặc tên phòng ban)
    const departmentExists = await Department.findOne({ loaiPhong: position }); // Lọc theo name của phòng ban

    if (departmentExists) {
      return res.status(200).json({ exists: true, message: 'Department exists.' });
    } else {
      return res.status(200).json({ exists: false, message: 'Department does not exist.' });
    }
  } catch (error) {
    // Xử lý lỗi trong quá trình truy vấn
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
module.exports = router; // Xuất router để sử dụng trong app.js
