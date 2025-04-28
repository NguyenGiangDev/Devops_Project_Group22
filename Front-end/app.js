const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Nạp biến môi trường từ .env
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000; // Cổng frontend
const path = require('path');
const { collectDefaultMetrics, Registry, Counter } = require('prom-client');

// Middleware để parse dữ liệu từ biểu mẫu
app.use(express.json()); // Để xử lý các yêu cầu có body dưới dạng JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // Sử dụng cookie-parser

// URL của các dịch vụ khác (lấy từ biến môi trường hoặc mặc định)
const EMPLOYEE_API_URL = process.env.EMPLOYEE_API_URL || 'http://employee-services:3001';
const DEPARTMENT_API_URL = process.env.DEPARTMENT_API_URL || 'http://department-services:3002';
const AUTHENTICATION_API_URL = process.env.AUTHENTICATION_API_URL || 'http://authentication-services:3003';
const PERSONAL_API_URL = process.env.PERSONAL_API_URL || 'http://personal-services:3004';
const SALARY_API_URL = process.env.SALARY_API_URL || 'http://salary-services:3005';


// Tự động thu thập các metric mặc định
collectDefaultMetrics();

// Tạo một Counter để đếm số lượng đăng nhập thành công
const loginCounter = new Counter({
  name: 'login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status'], // Gắn nhãn để phân biệt đăng nhập thành công/thất bại
});

// Route thu thập metric
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.end(await Registry.globalRegistry.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Healthcheck Endpoint
app.get('/healthz', async (req, res) => {
  const services = {
    employee_service: `${EMPLOYEE_API_URL}/healthz`,
    department_service: `${DEPARTMENT_API_URL}/healthz`,
    authentication_service: `${AUTHENTICATION_API_URL}/healthz`
  };

  let status = { api_gateway: "ok" }; // API Gateway luôn trả về OK nếu chạy
  let unhealthyServices = [];

  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(url, { timeout: 2000 }); // Timeout 2s
      status[name] = response.data.status;
      if (response.data.status !== "ok") {
        unhealthyServices.push(name);
      }
    } catch {
      status[name] = "unhealthy";
      unhealthyServices.push(name);
    }
  }

  if (unhealthyServices.length > 0) {
    return res.status(503).json(status); // Trả về 503 nếu có service bị lỗi
  }
  res.json(status);
});
// Route để lấy danh sách nhân viên
app.get('/api/employees', (req, res) => {
  axios.get(`${EMPLOYEE_API_URL}/employees`)
    .then(response => {
      res.json(response.data); // Trả về dữ liệu danh sách nhân viên
    })
    .catch(error => {
      console.error('Error fetching employee data:', error);
      res.status(500).send('Error fetching employee data');
    });
});

// Thêm nhân viên
app.post('/api/employees', async (req, res) => {
  const employeeData = req.body; // Lấy dữ liệu từ biểu mẫu nhân viên

  try {
    const response = await axios.post(`${EMPLOYEE_API_URL}/employees`, employeeData);

    const successMessage = 'Employee added successfully!';
    const errorMessage = 'Phòng ban không tồn tại';
    const unexpectedMessage = 'Employee added successfully';

    // Kiểm tra thông báo từ backend
    if (response.data.message?.includes('Department exists')) {
      return res.redirect('/add_employ.html?message=' + encodeURIComponent(successMessage));
      
    } else if (response.data.message?.includes('Department does not exist')) {
      return res.redirect('/add_employ.html?error=' + encodeURIComponent(errorMessage));
    } else {
     return res.redirect('/add_employ.html?error=' + encodeURIComponent(unexpectedMessage));
    }
  } catch (error) {
    console.error('Error adding employee:', error);

    let generalErrorMessage = 'Failed to connect to the employee service';
    if (error.response?.data?.message?.includes('Department does not exist')) {
      generalErrorMessage = 'Phòng ban không tồn tại';
    }

    return res.redirect('/add_employ.html?error=' + encodeURIComponent(generalErrorMessage));
  }
});


// Route để thêm phòng ban
app.post('/api/department', (req, res) => {
  const departmentData = req.body;

  axios.post(`${DEPARTMENT_API_URL}/department`, departmentData)
    .then(response => {
      const successMessage = 'Department added successfully!';
      res.redirect('/Department_add.html?message=' + encodeURIComponent(successMessage));
    })
    .catch(error => {
      console.error('Error adding department:', error);
      res.status(500).json({ error: 'Failed to add department' });
    });
});

// Route để lấy danh sách phòng ban
app.get('/api/department', (req, res) => {
  axios.get(`${DEPARTMENT_API_URL}/department`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error('Error fetching department data:', error);
      res.status(500).send('Error fetching department data');
    });
});

// Route cho trang chính, hiển thị form thêm phòng ban
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Authentication.html'));
});

// Route để lấy nhân viên theo phòng ban
app.post('/api/department/employee', (req, res) => {
  const departmentName = req.body.loaiPhong;

  axios.get(`${DEPARTMENT_API_URL}/department/employees?department=${departmentName}`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error('Error fetching employees for department:', error);
      res.status(500).send('Error fetching employees for department');
    });
});

// Xóa nhân viên
app.post('/api/employees/delete', (req, res) => {
  const { name } = req.body;

  axios.post(`${EMPLOYEE_API_URL}/employees/delete`, { name })
    .then(response => {
      res.json({ message: 'Employee deleted successfully!' });
    })
    .catch(error => {
      console.error('Error deleting employee:', error);
      res.status(500).send('Error deleting employee');
    });
});
app.post('/api/auth/login', (req, res) => {
  const { id, password } = req.body;

  axios.post(`${AUTHENTICATION_API_URL}/authentication/login`, { id, password })
  .then(response => {
      console.log("📌 Dữ liệu API trả về:", response.data); // Debug API response

      const { token, role, name, department } = response.data;
      console.log("📌 Tên nhân viên:", name); 
      console.log("📌 Phòng ban:", department);

      res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 });
      res.cookie('userRole', role, { maxAge: 3600000, path: '/' });
      if (role==='Account') {
        res.redirect('/salary.html?message=' + encodeURIComponent('Login successful!'));
        return;
      }
      if (role === 'employee') {
          res.redirect(`/Empoyee_Account.html?name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}&department=${encodeURIComponent(department)}`);
      } else {
          res.redirect('/add_employ.html?message=' + encodeURIComponent('Login successful!'));
      }
  })
  .catch(error => {
      console.error('❌ Lỗi đăng nhập:', error);
      res.status(500).json({ error: 'Failed to log in' });
  });

});
// Route để nhận yêu cầu check-in từ frontend
app.post('/checkin', async (req, res) => {
    const { name, id, checkInTime } = req.body;  // Lấy dữ liệu từ frontend gửi lên

    const attendanceData = {
        name,
        id,
        checkInTime
    };

    try {
        // Gửi yêu cầu POST tới personal-service để chấm công
        const response = await axios.post(`${PERSONAL_API_URL}/Personal/checkin`, attendanceData);
        
        // Nếu personal-service trả kết quả thành công, gửi phản hồi lại frontend
        if (response.status === 201) {
             res.status(201).json({ message: "Chấm công thành công!" });
        } else {
            res.status(409).json({ error: "Bạn đã chấm công hôm nay rồi !!" });
        }
    } catch (error) {
        console.error("Lỗi khi gọi personal-service:", error);
        res.status(500).json({ error: "Lỗi khi chấm công. Vui lòng thử lại." });
    }
});
// Route để tính lương cho nhân viên
app.post('/calculate-salary', async (req, res) => {
    const { dailySalary } = req.body;  // Lấy lương 1 ngày từ frontend gửi lên

    if (!dailySalary) {
        return res.status(400).json({ error: 'Lương 1 ngày không hợp lệ' });
    }

    try {
        // Gửi yêu cầu GET tới salary-service để lấy dữ liệu nhân viên
        const response = await axios.get(`${SALARY_API_URL}/salary`);

        // Kiểm tra dữ liệu trả về từ salary-service
        if (response.status === 200 && Array.isArray(response.data)) {
            const salaryData = response.data.map(employee => {
                const totalSalary = employee.workDays * dailySalary;
                return {
                    name: employee.name,
                    workDays: employee.workDays,
                    totalSalary
                };
            });

            // Trả dữ liệu lương đã tính toán cho frontend
            res.json(salaryData);
        } else {
            res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ salary-service' });
        }
    } catch (error) {
        console.error('Lỗi khi gọi salary-service:', error);
        res.status(500).json({ error: 'Không thể kết nối đến salary-service' });
    }
});

// Chạy server
// Chạy server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend service running on port ${PORT}`);
});
