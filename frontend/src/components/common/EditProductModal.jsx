import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const EditProductModal = ({ show, onHide, product, onSave }) => {
  const [editedProduct, setEditedProduct] = React.useState(product);

  const handleChange = (field, value) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(editedProduct);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Tên sản phẩm</Form.Label>
            <Form.Control
              value={editedProduct.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={editedProduct.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giá (₫)</Form.Label>
            <Form.Control
              type="number"
              value={editedProduct.base_price}
              onChange={(e) =>
                handleChange("base_price", Number(e.target.value))
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tồn kho</Form.Label>
            <Form.Control
              type="number"
              value={editedProduct.stock_total}
              onChange={(e) =>
                handleChange("stock_total", Number(e.target.value))
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={editedProduct.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="active">Hoạt động</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="inactive">Ngừng bán</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Lưu thay đổi
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;
