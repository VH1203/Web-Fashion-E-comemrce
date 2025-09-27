# 🛍️ Fashion E-Commerce Platform (DFS)

Nền tảng thương mại điện tử tập trung vào **ngành thời trang**, với mục tiêu:
- Giảm tỷ lệ mua sai size thông qua **AI Size Recommendation** (gợi ý size dựa trên chiều cao, cân nặng, số đo).
- Quản lý **khép kín** toàn bộ quy trình: sản phẩm → đơn hàng → khách hàng → marketing → vận chuyển → thanh toán.
- Tích hợp vận chuyển (GHN, GHTK) và thanh toán (VNPay, MoMo).
- Hỗ trợ nhiều vai trò trong hệ thống: **Customer, Shop, Admin, CS, Warehouse, Marketing**.

---

## 🚀 Tech Stack
- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)  
- **Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)  
- **Database:** [MongoDB](https://www.mongodb.com/) (quản lý qua Mongo Compass)  
- **Authentication:** JWT (Access + Refresh token), mật khẩu băm bằng bcrypt/argon2 + SALT  
- **Queue/Background Jobs:** BullMQ + Redis (retry, email, notification)  
- **AI Recommendation:** ML model phân tích size từ dữ liệu khách hàng + bảng size sản phẩm  
- **Deployment:** AWS / Docker / Nginx  
- **Khác:** CDN (Cloudflare), JMeter (load test), StarUML/PlantUML (vẽ diagram)  

## Run
- npm install
- npm start
---
