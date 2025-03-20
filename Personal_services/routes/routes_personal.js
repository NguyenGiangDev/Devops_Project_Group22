const express = require('express');
const router = express.Router();
const Personal = require('../model/model_personal'); // Import model

// 📌 Route xử lý chấm công
// 📌 Route xử lý chấm công
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
router.post('/checkin', async (req, res) => {
    console.log("Dữ liệu nhận được từ client:", req.body);

    const ID = req.body.id;
    const Name = req.body.name;
    const Time = new Date(req.body.checkInTime).toISOString(); // Chuyển đổi về chuẩn ISO

    if (!ID || !Name || !Time) {
        return res.status(400).json({ message: "Thiếu thông tin chấm công" });
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        // 🔹 Kiểm tra xem nhân viên này đã chấm công hôm nay chưa
        const existingCheckIn = await Personal.findOne({ 
            ID, 
            Name,  // Thêm kiểm tra Name
            Time: { $regex: today } 
        });

        if (existingCheckIn) {
            return res.status(409).json({ message: "Bạn đã chấm công hôm nay rồi!" });
        }

        const newCheckIn = new Personal({ ID, Name, Time });
        await newCheckIn.save();

        res.status(201).json({ message: "Chấm công thành công", data: newCheckIn });
    } catch (error) {
        console.error("Lỗi server khi lưu dữ liệu:", error);
        res.status(500).json({ message: "Lỗi server khi lưu dữ liệu" });
    }
});



module.exports = router;
