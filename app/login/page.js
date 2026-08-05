'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { FiLogIn } from 'react-icons/fi';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Đăng nhập thất bại');
      }
      window.location.href = '/';
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Title level={3} style={{ marginBottom: 4 }}>Đăng nhập</Title>
        <Text type="secondary">Quản lý chi tiêu cá nhân</Text>
        <Form layout="vertical" onFinish={submit} style={{ marginTop: 24 }}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<FiLogIn />} loading={submitting} block>
            Đăng nhập
          </Button>
        </Form>
        <Text style={{ display: 'block', marginTop: 16, textAlign: 'center' }}>
          Chưa có tài khoản? <Link href="/register">Tạo tài khoản</Link>
        </Text>
      </Card>
    </div>
  );
}
