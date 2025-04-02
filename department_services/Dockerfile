# Sử dụng hình ảnh Node.js chính thức, phiên bản 18
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json để cài đặt các phụ thuộc
COPY package*.json ./

# Cài đặt dependencies nhưng chỉ giữ lại dependencies cần thiết cho production
RUN npm install --production

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Mở cổng mà service này sẽ lắng nghe (chỉnh lại nếu service này dùng cổng khác)
EXPOSE 3002

# Lệnh để khởi động service
CMD ["npm", "start"]

