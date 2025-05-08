const express = require('express');
const app = express();
const AuthenticationRoutes = require('./routes/authentication_routes'); 
const connectDB = require('./config/db');
const cors = require('cors');


app.use(cors());
require('dotenv').config();


// Kết nối đến cơ sở dữ liệu
connectDB()
  .then(async () => {
    console.log("Connected to database");
  })
  .catch(err => {
    console.error("Error connecting to database:", err);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Để xử lý dữ liệu từ form
app.use(express.static('public')); // Sử dụng thư mục public để phục vụ các tệp tĩnh



// Middleware xử lý lỗi


// Sử dụng các route
app.use('/authentication', AuthenticationRoutes);


// Chạy server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
