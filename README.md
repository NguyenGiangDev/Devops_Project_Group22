
<p align="center">
  <a href="https://www.uit.edu.vn/"><img src="https://www.uit.edu.vn/sites/vi/files/banner.png"></a>

<h2 align="center"><b>NT548.P21 - Công nghệ DevOps và Ứng dụng</b></h2>

---

# Devops: XÂY DỰNG QUY TRÌNH DEVOPS TỰ ĐỘNG HÓA TRIỂN KHAI HẠ TẦNG VÀ ỨNG DỤNG MICROSERVICES TÍCH HỢP HỆ THỐNG GIÁM SÁT TRÊN K8S CLUSTER

Trong đồ án này sinh viên sẽ tập trung xây dựng một quy trình Devops từ thực hiện tự động hóa việc thiết lập hạ tầng, cho đến triển khai ứng dụng và cuối cùng là một hệ thống giám sát toàn diện nhằm đảm bảo cho tính bảo mật cũng như là sự ổn định cho hệ thống. Cụ thể những chức năng trong đồ án này bao gồm: 

-Tự động hóa triển khai hạ tầng (VMs, VPC) bằng terraform và triển khai phần mềm trên hạ tầng đó (Docker, K8S cluster) sử dụng ansible. 

-Hệ thống pipeline liên tục (CI), nhằm tự động hóa việc build và push image cho ứng dụng microservices, đồng thời tích hợp thêm trivy để quét bảo mật cũng như cảnh báo kịp thời khi images chưa đảm bảo an toàn.

-Hệ thống tự động hóa triển khai phần mềm (CD), sử dụng helm và Argocd để tạo quy trình Gitops toàn diện 

-Hệ thống giám sát gồm prometheus và grafana nhằm giúp quá trình theo dõi hiệu suất, trạng thái của hệ thống một cách trực quan và kịp thời. Tích hợp thêm slack để sẵn sàng gửi email cảnh báo nếu có bất thường trong lưu lượng ứng dụng.

---


## Công Nghệ Sử Dụng

### Công cụ lập trình và quản lý mã nguồn. 
- **Nodejs**: Môi trường thực thi Javascript cho máy chủ.
- **Github**: Lưu trữ và quảbn lý mã nguồn
- **Gitlab**: Lưu trữ và quản lý các file helm dùng để triển khai ứng dụng và hệ thống giám sát. (Link chi tiết: https://gitlab.com/devops_group22/ci-runner-github).


### Công cụ tích hợp liên tục (CI)
 **GitHub Actions**.
 
### Công Cụ triển khai
- **ArgoCD**: Kết nối với Gitlab giúp tự động triển khai và đồng bộ với cấu hình trong Gitlab
- **Docker**: Đóng gói và triển khai các services của ứng dụng webweb
- **Ansible**: Triển khai các ứng dụng trên hạ tầng
- **Kubernetes**: Điều phối container.
- **Helm**: Trình quản lý gói mã nguồn mở cho Kubernetes

### Công cụ triển khai hạ tầng (Link chi tiết).
https://github.com/NguyenGiangDev/Deploy-IaC-

### Công cụ triển khai hệ thống giám sát
- **Prometheus**: Thu thập log tù các endpoint
- **Grafana**: Hiện thịlog trực quan.
- **Slack**: Cảnh báo (tích hợp với Grafana).

  ### Công cụ bảo mật
- **Trivy**: Công cụ quét image. (Tích hợp với Slack).
- **Checkov**: Công cụ quét hạ tầng

---

## Pipeline Dự Án
![image](https://github.com/user-attachments/assets/2f29bfb3-20a9-4a17-a137-133a451ba3bd)

### Quy trình tích hợp liên tục (CI). 
- Quy trình Pipeline này gồm có 2 workflows chính hoạt động tuần tự: Build and push: -Push code: Lập trình viên là điểm khởi đầu của chuỗi CI. Sau khi hoàn tất một thay đổi hoặc tính năng, họ thực hiện push code lên repository trên GitHub. Việc này kích hoạt các tiến trình tự động phía sau, đảm bảo rằng mọi thay đổi đều được kiểm tra và đóng gói nhanh chóng.
- Github actions: Đây là nền tảng CI/CD tích hợp sẵn trong GitHub, cho phép định nghĩa các workflow qua file YAML. Trong quy trình này,
- GitHub Actions thực hiện:
- Build image: Lấy mã nguồn mới, tạo ra Docker image ứng dụng.
- Push image: Đẩy Docker image đã build lên Docker Hub.
- Điểm mạnh của GitHub Actions là khả năng tích hợp chặt chẽ với GitHub, dễ dàng kiểm soát theo từng nhánh và commit, hỗ trợ caching, parallel jobs và matrix build giúp CI nhanh hơn.
- Docker & Docker Hub: Docke là công cụ tạo môi trường đóng gói ứng dụng dưới dạng container đảm bảo tính đồng nhất giữa môi trường phát triển và triển khai. Trong bước này: -Docker tạo image từ source code (Build). 

- Sau đó, image được push lên Docker Hub – kho lưu trữ container image công khai hoặc riêng tư, cho phép các hệ thống khác (như GitLab hoặc ArgoCD) dễ dàng truy cập để triển khai.
 -Quét image với Trivy: Dùng để hỗ trợ đảm bảo an toàn cho các image sau khi build. Sau khi image build thành công sẽ được Trivy quét qua. Nếu số lượng lỗ hổng (vulnerability) vượt ngưỡng sẽ ngay lập tức gử mail về cho dev để thông báo image có tag cụ thể nào đó có lỗ hổng vượt mức. Cần xem xét lại.
  
- Update helm: -Clone/Update image tag: Sau khi image được đưa lên Docker Hub, bước tiếp theo là gán thẻ phiên bản (tag) cho image mới. Thẻ này giúp đảm bảo rằng hệ thống triển khai (CD) sẽ sử dụng đúng phiên bản mong muốn. Quy trình này có thể bao gồm việc cập nhật file Helm chart hoặc các cấu hình GitOps để phản ánh image mới. 


### Quy trình triển khai liện tục (CD). 
- Sau khi hoàn tất quá trình tích hợp liên tục (CI), giai đoạn triển khai liên tục (CD) được kích hoạt nhằm triển khai ứng dụng một cách tự động lên cụm Kubernetes. Trong quy trình này, ArgoCD đóng vai trò trung tâm, chịu trách nhiệm đồng bộ trạng thái hệ thống thực tế với trạng thái được định nghĩa trong Git repository. Khi có sự thay đổi trong repository (image tag của 1 hoặc nhiều services được cập nhật trong file values.yam của cấu hình helm-chart), ArgoCD sẽ phát hiện và tự động kích hoạt quá trình triển khai. ArgoCD sử dụng Helm để thực hiện việc triển khai. Helm cho phép đóng gói các tài nguyên Kubernetes theo dạng biểu mẫu (template), giúp đơn giản hóa việc cấu hình và tái sử dụng. Dựa trên nội dung Helm chart được lưu trữ trong repository, ArgoCD sẽ trích xuất các thông tin cần thiết để triển khai ứng dụng. Tiếp theo, Helm tương tác trực tiếp với cụm Kubernetes để triển khai hoặc cập nhật tài nguyên. Những tài nguyên này có thể bao gồm Deployment, Service, Ingress và các đối tượng khác. Toàn bộ quá trình này diễn ra tự động và được giám sát chặt chẽ nhằm đảm bảo tính toàn vẹn và ổn định của hệ thống. Cuối cùng, sau khi triển khai xong, ArgoCD tiếp tục theo dõi trạng thái của ứng dụng để đảm bảo rằng phiên bản mới được áp dụng thành công và cụm hoạt động đúng như kỳ vọng. Quy trình này mang lại sự nhất quán, khả năng kiểm soát cao và giảm thiểu rủi ro trong triển khai nhờ vào tính năng rollback, tái sử dụng cấu hình và sự giám sát liên tục.
---



### Thành Viên Nhóm
| STT | Họ tên               | MSSV     | Email                         |
| --- | ------------------ | -------- | ----------------------------- |
| 1   | Nguyễn Đình Giang | 22520358 | 22520358@gm.uit.edu.vn       |


Để liên hệ hoặc đóng góp, vui lòng gửi email.

---
