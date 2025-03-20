# Sử dụng hình ảnh Node.js chính thức
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép các file package.json và package-lock.json để cài đặt các phụ thuộc
COPY package*.json ./
RUN npm install --only=production

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Mở cổng mà service này sẽ lắng nghe (chỉnh theo cổng của service này)
EXPOSE 3004

# Lệnh để khởi động service
CMD ["npm", "start"]
