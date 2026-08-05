'use client';

import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Spin, Alert, Switch } from 'antd';
import { FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi';
import { useFinance } from '../components/FinanceProvider';
import { useTheme } from '../components/ThemeProvider';

const { Title, Text } = Typography;

export default function AuthPage() {
  const { data, updateProfile, loading, error } = useFinance();
  const { darkMode, toggleDarkMode } = useTheme();
  const [form, setForm] = useState(data.profile);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setForm(data.profile);
  }, [data.profile]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await updateProfile({ ...form, balance: Number(form.balance || 0) });
      message.success('Đã lưu hồ sơ');
    } catch (err) {
      message.error('Không lưu được hồ sơ');
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

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
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>Giao diện & Chủ đề</Title>
        <div className="row" style={{ padding: '4px 0' }}>
          <div>
            <Text strong style={{ display: 'block' }}>Chế độ Tối (Dark Mode)</Text>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              Chuyển đổi màu sắc toàn bộ giao diện sang tông tối để bảo vệ mắt
            </Text>
          </div>
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            checkedChildren={<FiMoon style={{ display: 'inline', verticalAlign: '-2px' }} />}
            unCheckedChildren={<FiSun style={{ display: 'inline', verticalAlign: '-2px' }} />}
          />
        </div>
      </Card>

      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>Thông tin người dùng</Title>
        <form className="form-grid" onSubmit={submit}>
          <div className="field full">
            <label>Tên hiển thị</label>
            <Input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} required />
          </div>
          <div className="field full">
            <label>Tên thật</label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="field full">
            <label>Email (tài khoản đăng nhập)</label>
            <Input type="email" value={form.email} disabled />
          </div>
          <div className="field full">
            <label>Số điện thoại</label>
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </div>
          <div className="field full">
            <label>Số dư ban đầu</label>
            <Input
              type="number"
              value={form.balance ?? 0}
              onChange={(event) => setForm({ ...form, balance: event.target.value })}
            />
          </div>
          <Button type="primary" icon={<FiUser />} htmlType="submit">Lưu hồ sơ</Button>
        </form>
      </Card>

      <Card>
        <Button danger icon={<FiLogOut />} onClick={logout} loading={loggingOut} block>
          Đăng xuất
        </Button>
      </Card>
    </section>
  );
}
