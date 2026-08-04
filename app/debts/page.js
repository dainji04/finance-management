'use client';

import { useState } from 'react';
import { Card, Form, Input, Select, Button, List, Typography, Tag, message, Spin, Alert, Modal, Dropdown } from 'antd';
import { FiBriefcase, FiEdit2, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useFinance } from '../components/FinanceProvider';

const { Text } = Typography;
const { Option } = Select;

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

export default function DebtsPage() {
  const { data, addDebt, updateDebt, deleteDebt, loading, error } = useFinance();
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

  const openEditModal = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({ type: item.type, person: item.person, amount: item.amount, note: item.note });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const submit = async (values) => {
    setSubmitting(true);
    const payload = {
      type: values.type,
      person: values.person,
      amount: Number(values.amount || 0),
      note: values.note,
      date: new Date().toISOString().slice(0, 10)
    };
    try {
      if (editingId) {
        await updateDebt(editingId, payload);
        message.success('Đã cập nhật công nợ');
      } else {
        await addDebt(payload);
        message.success('Đã lưu công nợ');
      }
      closeModal();
    } catch (error) {
      message.error(editingId ? 'Không cập nhật được công nợ' : 'Không lưu được công nợ');
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
      await deleteDebt(id);
      message.success('Đã xóa công nợ');
    } catch (error) {
      message.error('Không xóa được công nợ');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (item) => {
    Modal.confirm({
      title: 'Xóa công nợ này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => handleDelete(item.id)
    });
  };

  const menuItems = (item) => [
    { key: 'edit', label: 'Sửa', icon: <FiEdit2 />, onClick: () => openEditModal(item) },
    { key: 'delete', label: 'Xóa', icon: <FiTrash2 />, danger: true, onClick: () => confirmDelete(item) }
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
        title="Danh sách công nợ"
        extra={<Button type="primary" icon={<FiPlus />} onClick={openCreateModal}>Thêm mới</Button>}
      >
        <div className="scroll-list">
        <List
          dataSource={data.debts}
          renderItem={(item) => (
            <List.Item>
              <div className="record-item">
                <div className="record-item-body">
                  <div className="record-item-header">
                    <span className="record-item-title">
                      <Tag color={item.type === 'borrow' ? 'volcano' : 'green'}>{item.type === 'borrow' ? 'Vay' : 'Trả'}</Tag>
                      <Text strong>{item.person}</Text>
                    </span>
                    <Text strong className="record-item-amount">{formatCurrency(item.amount)}</Text>
                  </div>
                  <div className="record-item-footer">
                    <span className="muted record-item-note">{item.note || 'Không có ghi chú'}</span>
                    <span className="record-item-date">{item.date}</span>
                  </div>
                </div>
                <Dropdown menu={{ items: menuItems(item) }} trigger={['click']} placement="bottomRight">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<FiMoreVertical />}
                    aria-label="Hành động"
                    loading={deletingId === item.id}
                    className="record-item-edit"
                  />
                </Dropdown>
              </div>
            </List.Item>
          )}
        />
        </div>
      </Card>

      <Modal title={editingId ? 'Sửa công nợ' : 'Ghi công nợ'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit} onFinishFailed={onFinishFailed}>
          <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Vui lòng chọn loại' }]}>
            <Select><Option value="borrow">Vay</Option><Option value="repay">Trả</Option></Select>
          </Form.Item>
          <Form.Item name="person" label="Người liên quan" rules={[{ required: true, message: 'Vui lòng nhập người liên quan' }]}><Input /></Form.Item>
          <Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}><Input type="number" min="1000" /></Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" icon={<FiBriefcase />} htmlType="submit" loading={submitting} block>
            {editingId ? 'Cập nhật' : 'Lưu công nợ'}
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
