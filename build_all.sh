#!/bin/bash

# Tắt BuildKit để tránh lỗi buildx
export DOCKER_BUILDKIT=0  
echo "🔧 BuildKit đã bị tắt để đảm bảo quá trình build chạy ổn định. Demo devops hihi"

# Docker Hub username
DOCKER_USER="nguyengianguit"

# Danh sách các service cần build
services=("Front-end")

for service in "${services[@]}"; do
    echo "🚀 Building $service..."
    
    # Di chuyển vào thư mục service
    if cd "$service" 2>/dev/null; then
        # Tạo tag với tên chuẩn (chuyển thành lowercase)
        IMAGE_NAME="$DOCKER_USER/demo_microservices:${service,,}-latest"

        # Build image
        docker build -t "$IMAGE_NAME" .

        # Kiểm tra build thành công hay không
        if [ $? -eq 0 ]; then
            echo "✅ $service build completed! Pushing to Docker Hub..."

            # Push lên Docker Hub
            docker push "$IMAGE_NAME"

            echo "🚀 Pushed $IMAGE_NAME to Docker Hub!"
        else
            echo "❌ Lỗi: Build $service thất bại!"
        fi

        # Quay lại thư mục gốc
        cd ..
    else
        echo "❌ Lỗi: Thư mục $service không tồn tại!"
    fi
done

echo "🎉 All services built & pushed successfully!"

