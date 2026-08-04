'use client';

import { useMemo, useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Typography, List, Tag, message, Spin, Alert, Modal, Dropdown } from 'antd';
import { FiDollarSign, FiEdit2, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useFinance } from '../components/FinanceProvider';

const { Text } = Typography;
const { Option } = Select;

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

export default function ExpensesPage() {
  const { data, addExpense, updateExpense, deleteExpense, loading, error } = useFinance();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState(undefined);
  const [filterMonth, setFilterMonth] = useState(() => dayjs());

  const filteredExpenses = useMemo(() => {
    const monthStr = filterMonth ? filterMonth.format('YYYY-MM') : null;
    return data.expenses.filter((item) => {
      if (filterCategoryId && item.categoryId !== filterCategoryId) return false;
      if (monthStr && !item.date.startsWith(monthStr)) return false;
      return true;
    });
  }, [data.expenses, filterCategoryId, filterMonth]);

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({
      date: item.date ? dayjs(item.date) : undefined,
      categoryId: item.categoryId,
      amount: item.amount,
      note: item.note
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const submit = async (values) => {
    setSubmitting(true);
    const payload = {
      date: values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString().slice(0, 10),
      categoryId: values.categoryId,
      amount: Number(values.amount || 0),
      note: values.note
    };
    try {
      if (editingId) {
        await updateExpense(editingId, payload);
        message.success('Đã cập nhật chi tiêu');
      } else {
        await addExpense(payload);
        message.success('Đã lưu chi tiêu');
      }
      closeModal();
    } catch (error) {
      message.error(editingId ? 'Không cập nhật được chi tiêu' : 'Không lưu được chi tiêu');
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
      await deleteExpense(id);
      message.success('Đã xóa chi tiêu');
    } catch (error) {
      message.error('Không xóa được chi tiêu');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (item) => {
    Modal.confirm({
      title: 'Xóa chi tiêu này?',
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
        title="Danh sách chi tiêu"
        extra={<Button type="primary" icon={<FiPlus />} onClick={openCreateModal}>Thêm mới</Button>}
      >
        <div className="filter-row">
          <Select
            allowClear
            placeholder="Tất cả danh mục"
            className="filter-field"
            value={filterCategoryId}
            onChange={setFilterCategoryId}
          >
            {data.categories.map((category) => <Option key={category.id} value={category.id}>{category.name}</Option>)}
          </Select>
          <DatePicker
            picker="month"
            allowClear
            className="filter-field"
            value={filterMonth}
            onChange={setFilterMonth}
            placeholder="Chọn tháng"
            format="MM/YYYY"
          />
        </div>
        <div className="scroll-list">
        <List
          dataSource={filteredExpenses}
          renderItem={(item) => {
            const category = data.categories.find((entry) => entry.id === item.categoryId);
            return (
              <List.Item>
                <div className="record-item">
                  <div className="record-item-body">
                    <div className="record-item-header">
                      <span className="record-item-title">
                        {category ? (
                          <Tag color={category.color} variant="solid" style={{ color: '#fff' }}>{category.name}</Tag>
                        ) : (
                          <Tag>Không xác định</Tag>
                        )}
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
            );
          }}
        />
        </div>
      </Card>

      <Modal title={editingId ? 'Sửa chi tiêu' : 'Ghi chi tiêu mới'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit} onFinishFailed={onFinishFailed}>
          <Form.Item name="date" label="Ngày"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]} initialValue={data.categories[0]?.id}>
            <Select>{data.categories.map((category) => <Option key={category.id} value={category.id}>{category.name}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <Input type="number" min="1000" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" icon={<FiDollarSign />} htmlType="submit" loading={submitting} block>
            {editingId ? 'Cập nhật' : 'Lưu chi tiêu'}
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
