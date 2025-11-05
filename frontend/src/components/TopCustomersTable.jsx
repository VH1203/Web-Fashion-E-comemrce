import React from "react";
import { Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";

export default function TopCustomersTable({ rows = [] }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Top khách hàng VIP</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Điện thoại</TableCell>
              <TableCell align="right">Đơn</TableCell>
              <TableCell align="right">Chi tiêu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.user_id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell align="right">{r.orders}</TableCell>
                <TableCell align="right">{r.spend.toLocaleString("vi-VN")} ₫</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
