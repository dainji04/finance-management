'use client';

import { useMemo, useState } from 'react';
import { Card, Form, Input, Select, AutoComplete, DatePicker, Button, List, Typography, message, Spin, Alert, Modal, Dropdown, InputNumber } from 'antd';
import { FiBriefcase, FiEdit2, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
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
  const [filterPerson, setFilterPerson] = useState(undefined);

  const sortedDebts = useMemo(() => {
    return [...data.debts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [data.debts]);

  const uniquePersons = useMemo(() => {
    return Array.from(new Set(data.debts.map((item) => item.person).filter(Boolean)));
  }, [data.debts]);

  const personOptions = useMemo(() => uniquePersons.map((name) => ({ value: name })), [uniquePersons]);

  const filteredDebts = useMemo(() => {
    return sortedDebts.filter((item) => !filterPerson || item.person === filterPerson);
  }, [sortedDebts, filterPerson]);

  const filteredTotal = useMemo(() => {
    return filteredDebts.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredDebts]);

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({
      person: item.person,
      amount: item.amount,
      note: item.note,
      date: item.date ? dayjs(item.date) : dayjs()
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
      type: 'borrow',
      person: values.person,
      amount: Number(values.amount || 0),
      note: values.note,
      date: values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString().slice(0, 10)
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
        <div className="filter-row">
          <Select
            allowClear
            placeholder="Tất cả người vay"
            className="filter-field"
            value={filterPerson}
            onChange={setFilterPerson}
          >
            {uniquePersons.map((name) => <Option key={name} value={name}>{name}</Option>)}
          </Select>
        </div>
        <div className="scroll-list">
          <List
            dataSource={filteredDebts}
            renderItem={(item) => (
              <List.Item>
                <div className="record-item">
                  <div className="record-item-body">
                    <div className="record-item-header">
                      <Text strong className="record-item-title">{item.person}</Text>
                      <Text
                        strong
                        className="record-item-amount"
                        style={{ color: item.amount < 0 ? '#16a34a' : undefined }}
                      >
                        {formatCurrency(item.amount)}
                      </Text>
                    </div>
                    <div className="record-item-footer">
                      <span className="muted record-item-note" title={item.note || ''}>{item.note || 'Không có ghi chú'}</span>
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
        <div className="list-summary">
          <Text strong>{filterPerson ? `Tổng nợ của ${filterPerson}` : 'Tổng cộng'}</Text>
          <Text strong style={{ color: filteredTotal < 0 ? '#16a34a' : undefined }}>
            {formatCurrency(filteredTotal)}
          </Text>
        </div>
      </Card>

      <Modal title={editingId ? 'Sửa công nợ' : 'Ghi công nợ'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit} onFinishFailed={onFinishFailed}>
          <Form.Item name="person" label="Người vay" rules={[{ required: true, message: 'Vui lòng nhập người vay' }]}>
            <AutoComplete
              options={personOptions}
              filterOption={(inputValue, option) => option.value.toLowerCase().includes(inputValue.toLowerCase())}
              placeholder="Chọn hoặc nhập tên người vay"
            />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={1000}
              step={10000}
              placeholder="100.000"
              formatter={(value) => (value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '')}
              parser={(value) => (value ? value.replace(/\./g, '').replace(/vnđ/gi, '').trim() : '')}
            />
          </Form.Item>
          <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" icon={<FiBriefcase />} htmlType="submit" loading={submitting} block>
            {editingId ? 'Cập nhật' : 'Lưu công nợ'}
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
