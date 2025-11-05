import React from "react";
import { Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Typography } from "@mui/material";

export default function TopProductsTable({ rows = [] }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Top sản phẩm bán chạy</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sản phẩm</TableCell>
              <TableCell align="right">Số lượng</TableCell>
              <TableCell align="right">Doanh thu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.product_id} hover>
                <TableCell>
                  <Avatar variant="rounded" src={r.image} sx={{ mr: 1, width: 36, height: 36, display: "inline-flex", verticalAlign: "middle" }} />
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>{r.name}</Typography>
                </TableCell>
                <TableCell align="right">{r.qty}</TableCell>
                <TableCell align="right">{r.revenue.toLocaleString("vi-VN")} ₫</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
