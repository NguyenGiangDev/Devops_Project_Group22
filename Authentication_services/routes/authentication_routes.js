const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const Authentication = require('../model/model_authentication'); // Model cho người dùng 
const os = require('os');
const process = require('process');
const psutil = require('pidusage'); // Dùng để đo CPU/RAM process hiện tại
const jwt = require('jsonwebtoken'); // Nếu bạn muốn sử dụng JWT để tạo token xác thực
const mongoose = require('mongoose');


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
// Route xử lý đăng nhập
router.post('/login', async (req, res) => {
  const ID = req.body.id;
  const Password = req.body.password;

  try {
    console.log("📌 Dữ liệu bên gửi:", ID, Password);

    // 🔥 Tìm chính xác người dùng với ID & mật khẩu
    const user = await Authentication.findOne({ ID, Password });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    // 🏆 Nếu đăng nhập thành công, tạo token
    const token = jwt.sign(
      { role: user.ID },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("📌 Đăng nhập thành công:", user);

    // Log thông tin trả về
    console.log("📌 Token tạo thành công:", token);
    console.log("📌 Vai trò người dùng:", user.ID);
    console.log("📌 Tên người dùng:", user.Name);
    console.log("📌 Phòng ban:", user.department);
    // ✅ Trả về thông tin chính xác
    return res.json({
      message: 'Đăng nhập thành công',
      token,
      role: user.ID,
      name: user.Name, // Đã có dữ liệu từ DB
      department: user.department // Đã có dữ liệu từ DB
    });

  } catch (error) {
    console.error('❌ Lỗi trong quá trình đăng nhập:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
});

module.exports = router; // Xuất router để sử dụng trong app.js
