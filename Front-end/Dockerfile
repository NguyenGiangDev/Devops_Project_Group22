# Sử dụng hình ảnh Node.js chính thức, phiên bản 18
FROM node:18

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json để cài đặt các phụ thuộc
COPY package*.json ./

# Cài đặt các phụ thuộc chỉ dành cho production
RUN npm install --only=production

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Kiểm tra xem thư mục public đã được sao chép vào đúng vị trí chưa
RUN ls -la /usr/src/app/public

# Mở cổng mà service này sẽ lắng nghe (chỉnh lại nếu dùng cổng khác)
EXPOSE 3000

# Lệnh để khởi động service (chạy app.js từ thư mục API)
CMD ["node", "app.js"]

