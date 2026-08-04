'use client';

import { useMemo, useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Typography, List, Tag, message, Spin, Alert, Modal, Dropdown } from 'antd';
import { FiActivity, FiEdit2, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useFinance } from '../components/FinanceProvider';

const { Text } = Typography;
const { Option } = Select;

const ACTIVITY_TYPES = ['Cầu lông', 'Chạy bộ', 'Gym', 'Học bài', 'Làm việc', 'Giải trí', 'Khác'];
const TYPE_COLORS = {
  'Cầu lông': 'gold',
  'Chạy bộ': 'green',
  Gym: 'volcano',
  'Học bài': 'blue',
  'Làm việc': 'purple',
  'Giải trí': 'magenta',
  Khác: 'default'
};

const SESSIONS = [
  { value: 'sang', label: 'Sáng' },
  { value: 'chieu', label: 'Chiều' },
  { value: 'toi', label: 'Tối' }
];

function sessionLabel(value) {
  return SESSIONS.find((session) => session.value === value)?.label || value;
}

export default function ActivitiesPage() {
  const { data, addActivity, updateActivity, deleteActivity, loading, error } = useFinance();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterType, setFilterType] = useState(undefined);
  const [filterMonth, setFilterMonth] = useState(() => dayjs());

  const filteredActivities = useMemo(() => {
    const monthStr = filterMonth ? filterMonth.format('YYYY-MM') : null;
    return data.activities.filter((item) => {
      if (filterType && item.type !== filterType) return false;
      if (monthStr && !item.date.startsWith(monthStr)) return false;
      return true;
    });
  }, [data.activities, filterType, filterMonth]);

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({
      type: item.type,
      session: item.session,
      date: item.date ? dayjs(item.date) : dayjs(),
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
      type: values.type,
      session: values.session,
      date: values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString().slice(0, 10),
      note: values.note
    };
    try {
      if (editingId) {
        await updateActivity(editingId, payload);
        message.success('Đã cập nhật hoạt động');
      } else {
        await addActivity(payload);
        message.success('Đã lưu hoạt động');
      }
      closeModal();
    } catch (error) {
      message.error(editingId ? 'Không cập nhật được hoạt động' : 'Không lưu được hoạt động');
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
      await deleteActivity(id);
      message.success('Đã xóa hoạt động');
    } catch (error) {
      message.error('Không xóa được hoạt động');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (item) => {
    Modal.confirm({
      title: 'Xóa hoạt động này?',
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
        title="Nhật ký hoạt động"
        extra={<Button type="primary" icon={<FiPlus />} onClick={openCreateModal}>Thêm mới</Button>}
      >
        <div className="filter-row">
          <Select
            allowClear
            placeholder="Tất cả hoạt động"
            className="filter-field"
            value={filterType}
            onChange={setFilterType}
          >
            {ACTIVITY_TYPES.map((type) => <Option key={type} value={type}>{type}</Option>)}
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
          dataSource={filteredActivities}
          renderItem={(item) => (
            <List.Item>
              <div className="record-item">
                <div className="record-item-body">
                  <div className="record-item-header">
                    <span className="record-item-title">
                      <Tag color={TYPE_COLORS[item.type] || 'default'}>{item.type}</Tag>
                    </span>
                    <Text strong className="record-item-amount">{sessionLabel(item.session)}</Text>
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

      <Modal title={editingId ? 'Sửa hoạt động' : 'Ghi hoạt động mới'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit} onFinishFailed={onFinishFailed}>
          <Form.Item name="type" label="Hoạt động" rules={[{ required: true, message: 'Vui lòng chọn hoạt động' }]}>
            <Select>{ACTIVITY_TYPES.map((type) => <Option key={type} value={type}>{type}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="session" label="Buổi" rules={[{ required: true, message: 'Vui lòng chọn buổi' }]}>
            <Select>{SESSIONS.map((session) => <Option key={session.value} value={session.value}>{session.label}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" icon={<FiActivity />} htmlType="submit" loading={submitting} block>
            {editingId ? 'Cập nhật' : 'Lưu hoạt động'}
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
