import { Box, Paper, Typography } from "@mui/material";
import ProductForm from "../../components/ProductForm";
import { productAdminService as svc } from "../../services/productAdminService";

export default function AddProduct() {
  return (
    <Box sx={{ p:2 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb:2 }}>Thêm sản phẩm</Typography>
      <Paper sx={{ p:2, borderRadius:3, boxShadow:2 }}>
        <ProductForm onSubmit={(d)=>svc.create(d)} svc={svc} />
      </Paper>
    </Box>
  );
}
