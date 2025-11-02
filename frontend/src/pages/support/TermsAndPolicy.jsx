import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const TermsAndPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          fontWeight="bold"
          color="primary"
        >
          Chính Sách & Điều Khoản Sử Dụng
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* 1️⃣ Giới thiệu */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Giới thiệu
          </Typography>
          <Typography variant="body1">
            Chào mừng bạn đến với nền tảng của chúng tôi. Khi truy cập hoặc sử
            dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản và chính sách dưới
            đây. Vui lòng đọc kỹ trước khi tiếp tục.
          </Typography>
        </Box>

        {/* 2️⃣ Tài khoản & Bảo mật */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Tài khoản & Bảo mật
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemText
                primary="• Người dùng chịu trách nhiệm về bảo mật tài khoản và mật khẩu của mình."
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="• Không được chia sẻ thông tin đăng nhập với bên thứ ba."
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="• Nếu phát hiện hành vi truy cập trái phép, vui lòng thông báo ngay cho quản trị viên."
              />
            </ListItem>
          </List>
        </Box>

        {/* 3️⃣ Quyền & Nghĩa vụ người dùng */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Quyền & Nghĩa vụ người dùng
          </Typography>
          <Typography variant="body1">
            Người dùng cam kết sử dụng dịch vụ đúng mục đích, không vi phạm pháp
            luật, không phát tán nội dung độc hại, spam hoặc gây ảnh hưởng đến
            hệ thống và người khác.
          </Typography>
        </Box>

        {/* 4️⃣ Chính sách bảo mật */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Chính sách bảo mật
          </Typography>
          <Typography variant="body1">
            Chúng tôi cam kết bảo mật thông tin cá nhân của bạn và chỉ sử dụng
            cho mục đích phục vụ trải nghiệm người dùng. Mọi dữ liệu sẽ được
            xử lý theo quy định của pháp luật hiện hành.
          </Typography>
        </Box>

        {/* 5️⃣ Thanh toán & Hoàn tiền */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Thanh toán & Hoàn tiền
          </Typography>
          <Typography variant="body1">
            Tất cả các giao dịch thanh toán đều được xử lý qua đối tác uy tín.
            Chính sách hoàn tiền chỉ áp dụng khi có lỗi hệ thống hoặc theo quy
            định cụ thể của từng dịch vụ.
          </Typography>
        </Box>

        {/* 6️⃣ Sửa đổi điều khoản */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Sửa đổi điều khoản
          </Typography>
          <Typography variant="body1">
            Chúng tôi có thể cập nhật các điều khoản này theo thời gian. Mọi
            thay đổi sẽ được thông báo công khai trên website trước khi áp dụng.
          </Typography>
        </Box>

        {/* 7️⃣ Liên hệ */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            7. Liên hệ
          </Typography>
          <Typography variant="body1">
            Mọi thắc mắc xin gửi về email:{" "}
            <Box component="span" fontWeight="bold">
              support@dfs.vn
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsAndPolicy;
