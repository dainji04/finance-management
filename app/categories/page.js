'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, List, Tag, message, Spin, Alert, Modal, Dropdown } from 'antd';
import { FiEdit2, FiGrid, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useFinance } from '../components/FinanceProvider';

const { Text } = Typography;

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

export default function CategoriesPage() {
  const { data, addCategory, updateCategory, deleteCategory, loading, error } = useFinance();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    form.setFieldsValue({ name: category.name, color: category.color, budget: category.budget });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const submit = async (values) => {
    setSubmitting(true);
    const payload = { name: values.name, color: values.color || '#2563eb', budget: Number(values.budget || 0) };
    try {
      if (editingId) {
        await updateCategory(editingId, payload);
        message.success('Đã cập nhật danh mục');
      } else {
        await addCategory(payload);
        message.success('Đã thêm danh mục');
      }
      closeModal();
    } catch (error) {
      message.error(editingId ? 'Không cập nhật được danh mục' : 'Không thêm được danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed = () => {
    message.error('Vui lòng kiểm tra lại các trường');
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteCategory(id);
      message.success('Đã xóa danh mục');
    } catch (error) {
      message.error('Không xóa được danh mục');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (category) => {
    Modal.confirm({
      title: 'Xóa danh mục này?',
      content: 'Các chi tiêu đã dùng danh mục này sẽ không còn liên kết.',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => handleDelete(category.id)
    });
  };

  const menuItems = (category) => [
    { key: 'edit', label: 'Sửa', icon: <FiEdit2 />, onClick: () => openEditModal(category) },
    { key: 'delete', label: 'Xóa', icon: <FiTrash2 />, danger: true, onClick: () => confirmDelete(category) }
  ];

  if (loading) {
    return (
      <section className="stack">
        <Card>
          <Spin tip="Đang tải dữ liệu..." />
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="stack">
        <Card>
          <Alert message="Lỗi tải dữ liệu" description={error} type="error" showIcon />
        </Card>
      </section>
    );
  }

  return (
    <section className="stack">
      <Card
        title="Danh mục hiện có"
        extra={<Button type="primary" icon={<FiPlus />} onClick={openCreateModal}>Thêm mới</Button>}
      >
        <div className="scroll-list">
        <List
          dataSource={data.categories}
          renderItem={(category) => (
            <List.Item>
              <div className="record-item">
                <div className="record-item-body">
                  <div className="record-item-header">
                    <span className="record-item-title"><Tag color={category.color} variant="solid" style={{ color: '#fff' }}>{category.name}</Tag></span>
                    <Text strong className="record-item-amount">{formatCurrency(category.budget)}</Text>
                  </div>
                  <div className="record-item-footer">
                    <span className="muted">Ngân sách hàng tháng</span>
                  </div>
                </div>
                <Dropdown menu={{ items: menuItems(category) }} trigger={['click']} placement="bottomRight">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<FiMoreVertical />}
                    aria-label="Hành động"
                    loading={deletingId === category.id}
                    className="record-item-edit"
                  />
                </Dropdown>
              </div>
            </List.Item>
          )}
        />
        </div>
      </Card>

      <Modal title={editingId ? 'Sửa danh mục' : 'Tạo danh mục mới'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit} onFinishFailed={onFinishFailed}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}><Input /></Form.Item>
          <Form.Item name="color" label="Màu hiển thị"><Input type="color" style={{ height: 40, padding: 4 }} /></Form.Item>
          <Form.Item name="budget" label="Ngân sách"><Input type="number" /></Form.Item>
          <Button type="primary" icon={<FiGrid />} htmlType="submit" loading={submitting} block>
            {editingId ? 'Cập nhật' : 'Thêm danh mục'}
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
