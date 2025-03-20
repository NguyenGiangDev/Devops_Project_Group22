const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Salary = require("../model/model_salary"); // Giả sử bạn có model Salary
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
// API lấy số ngày công theo tên nhân viên
router.get("/", async (req, res) => {
    try {
        // Lấy tất cả dữ liệu từ DB
        const salaries = await Salary.find({ ID: "employee" });

        // Nhóm theo 'Name' và đếm số ngày công
        const workDays = salaries.reduce((acc, record) => {
            const name = record.Name;
            acc[name] = (acc[name] || 0) + 1; // Đếm số lần xuất hiện
            return acc;
        }, {});

        // Chuyển đổi dữ liệu thành mảng
        const response = Object.keys(workDays).map(name => ({
            name: name,
            workDays: workDays[name]
        }));

        res.json(response);
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});

module.exports = router;
