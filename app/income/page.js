'use client';

import { useMemo, useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, List, Typography, message, Spin, Alert, Modal, Dropdown, InputNumber } from 'antd';
import { FiEdit2, FiMoreVertical, FiPlus, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useFinance } from '../components/FinanceProvider';

const { Text } = Typography;
const { Option } = Select;

const DEBT_REPAYMENT_TYPE = 'Tiền trả nợ';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

export default function IncomePage() {
  const { data, addIncome, updateIncome, deleteIncome, addDebt, updateDebt, deleteDebt, loading, error } = useFinance();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const watchedType = Form.useWatch('type', form);

  const sortedIncomes = useMemo(() => {
    return [...data.incomes].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [data.incomes]);

  const owingPeople = useMemo(() => {
    const map = new Map();
    data.debts.forEach((item) => {
      map.set(item.person, (map.get(item.person) || 0) + item.amount);
    });
    return Array.from(map.entries())
      .filter(([, amount]) => amount > 0)
      .map(([person, amount]) => ({ person, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [data.debts]);

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({
      type: item.type,
      amount: item.amount,
      date: item.date ? dayjs(item.date) : undefined,
      note: item.note,
      person: item.person || undefined
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const submit = async (values) => {
    setSubmitting(true);
    const isRepayment = values.type === DEBT_REPAYMENT_TYPE;
    const amount = Number(values.amount || 0);
    const date = values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString().slice(0, 10);
    const previousItem = editingId ? data.incomes.find((item) => item.id === editingId) : null;

    try {
      let relatedDebtId = previousItem?.relatedDebtId || null;

      if (isRepayment) {
        const debtPayload = {
          type: 'borrow',
          person: values.person,
          amount: -amount,
          note: values.note ? `Trả nợ: ${values.note}` : 'Trả nợ',
          date
        };
        if (relatedDebtId) {
          await updateDebt(relatedDebtId, debtPayload);
        } else {
          const savedDebt = await addDebt(debtPayload);
          relatedDebtId = savedDebt.id;
        }
      } else if (relatedDebtId) {
        await deleteDebt(relatedDebtId);
        relatedDebtId = null;
      }

      const payload = {
        type: values.type,
        amount,
        date,
        note: values.note,
        person: isRepayment ? values.person : '',
        relatedDebtId
      };

      if (editingId) {
        await updateIncome(editingId, payload);
        message.success('Đã cập nhật thu nhập');
      } else {
        await addIncome(payload);
        message.success('Đã lưu thu nhập');
      }
      closeModal();
    } catch (error) {
      message.error(editingId ? 'Không cập nhật được thu nhập' : 'Không lưu được thu nhập');
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed = () => {
    message.error('Vui lòng kiểm tra lại các trường');
  };

  const handleDelete = async (item) => {
    setDeletingId(item.id);
    try {
      await deleteIncome(item.id);
      if (item.relatedDebtId) {
        await deleteDebt(item.relatedDebtId);
      }
      message.success('Đã xóa khoản tiền vào');
    } catch (error) {
      message.error('Không xóa được khoản tiền vào');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (item) => {
    Modal.confirm({
      title: 'Xóa khoản tiền vào này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => handleDelete(item)
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
        title="Danh sách tiền vào"
        extra={<Button type="primary" icon={<FiPlus />} onClick={openCreateModal}>Thêm mới</Button>}
      >
        <div className="scroll-list">
          <List
            dataSource={sortedIncomes}
            renderItem={(item) => (
              <List.Item>
                <div className="record-item">
                  <div className="record-item-body">
                    <div className="record-item-header">
                      <Text strong className="record-item-title">
                        {item.type}{item.person ? ` · ${item.person}` : ''}
                      </Text>
                      <Text strong className="record-item-amount">{formatCurrency(item.amount)}</Text>
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
      </Card>

      <Modal title={editingId ? 'Sửa tiền vào' : 'Nhập tiền vào'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit} onFinishFailed={onFinishFailed}>
          <Form.Item name="type" label="Loại thu nhập" rules={[{ required: true, message: 'Vui lòng chọn loại thu nhập' }]}>
            <Select>
              <Option value="Tiền lương">Tiền lương</Option>
              <Option value="Tiền dự án ngoài">Tiền dự án ngoài</Option>
              <Option value={DEBT_REPAYMENT_TYPE}>Tiền trả nợ</Option>
              <Option value="Tiền lãi đầu tư">Tiền lãi đầu tư</Option>
              <Option value="Vay tiền">Vay tiền</Option>
            </Select>
          </Form.Item>
          {watchedType === DEBT_REPAYMENT_TYPE && (
            <Form.Item name="person" label="Người trả" rules={[{ required: true, message: 'Vui lòng chọn người trả nợ' }]}>
              <Select placeholder="Chọn người đang nợ" notFoundContent="Không có ai đang nợ">
                {owingPeople.map((entry) => (
                  <Option key={entry.person} value={entry.person}>
                    {entry.person} (còn nợ {formatCurrency(entry.amount)})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
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
          <Form.Item name="date" label="Ngày"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" icon={<FiTrendingUp />} htmlType="submit" loading={submitting} block>
            {editingId ? 'Cập nhật' : 'Lưu tiền vào'}
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
