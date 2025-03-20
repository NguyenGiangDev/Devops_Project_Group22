const mongoose = require('mongoose');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/docler_service', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Kết nối thành công'))
    .catch(err => console.error('Lỗi kết nối:', err));

// Định nghĩa schema và model
const userSchema = new mongoose.Schema({
    username: String,
    password: String, // Thêm trường password
    role: String,
    department: String
});

const User = mongoose.model('User', userSchema);

// Tạo dữ liệu mẫu
const seedUsers = [
    { username: 'tranphong', password: '123', role: 'Trưởng Phòng', department: 'IT' },
    { username: 'ngoclan', password: '456', role: 'Nhân Viên', department: 'Marketing' },
    { username: 'minhhoa', password: '789', role: 'Nhân Viên', department: 'IT' }
];

// Thêm dữ liệu vào MongoDB
User.insertMany(seedUsers)
    .then(() => {
        console.log('Dữ liệu đã được thêm thành công');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Lỗi khi thêm dữ liệu:', err);
        mongoose.connection.close();
    });
