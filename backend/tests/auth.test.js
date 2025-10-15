const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const redis = require("../src/config/redis");
const User = require("../src/models/User");


describe("🧪 AUTH MODULE TEST", () => {
  beforeAll(async () => {
    // đảm bảo DB kết nối trước khi test
    if (mongoose.connection.readyState === 0) {
      const { connectDB } = require("../src/config/db");
      await connectDB();
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (redis && redis.quit) await redis.quit();
  });

  // Mẫu user test
  const testUser = {
    name: "Nguyen Van Test",
    username: "nguyenvantest",
    email: "testuser@example.com",
    phone: "0987654321",
    password: "Test@1234",
    confirmPassword: "Test@1234",
    agreePolicy: true,
  };

  let otpCode = "000000"; // sẽ giả lập OTP
  let accessToken = "";
  let refreshToken = "";

  // ===== 1. Register Request OTP =====
  it("✅ Gửi OTP đăng ký", async () => {
    const res = await request(app)
      .post("/api/auth/register/request-otp")
      .send(testUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.sent).toBeTruthy();
  });

  // ===== 2. Verify Register (giả lập OTP từ Redis) =====
  it("✅ Xác minh OTP và đăng ký", async () => {
    // Giả lập lưu OTP trong Redis
    const otpKey = `otp:register:${testUser.email.toLowerCase()}`;
    await redis.set(otpKey, otpCode, "EX", 900);

    const res = await request(app)
      .post("/api/auth/register/verify")
      .send({ ...testUser, otp: otpCode });

    expect(res.statusCode).toBe(200);
    expect(res.body.registered).toBeTruthy();
    expect(res.body.user).toHaveProperty("email", testUser.email.toLowerCase());
  });

  // ===== 3. Login =====
  it("✅ Đăng nhập thành công", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();

    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  // ===== 4. Refresh token =====
  it("✅ Refresh token hoạt động", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ token: refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.access_token).toBeDefined();
  });

  // ===== 5. Forgot password OTP =====
  it("✅ Gửi OTP quên mật khẩu", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password/request")
      .send({ identifier: testUser.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.sent).toBeTruthy();
  });

  // ===== 6. Set password request =====
  it("✅ Gửi OTP đặt lại mật khẩu", async () => {
    const res = await request(app)
      .post("/api/auth/set-password/request")
      .send({ identifier: testUser.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.sent).toBeTruthy();
  });

  // ===== 7. Logout =====
  it("✅ Logout hoạt động", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .send({ token: refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/thành công/i);
  });
});
