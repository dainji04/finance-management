'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { FiUserPlus } from 'react-icons/fi';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          displayName: values.displayName
        })
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Tạo tài khoản thất bại');
      }
      window.location.href = '/';
    } catch (error) {
      message.error(error.message || 'Tạo tài khoản thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Title level={3} style={{ marginBottom: 4 }}>Tạo tài khoản</Title>
        <Text type="secondary">Bắt đầu quản lý chi tiêu của riêng bạn</Text>
        <Form layout="vertical" onFinish={submit} style={{ marginTop: 24 }}>
          <Form.Item name="displayName" label="Tên hiển thị" rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}>
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Mật khẩu cần tối thiểu 6 ký tự' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                }
              })
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<FiUserPlus />} loading={submitting} block>
            Tạo tài khoản
          </Button>
        </Form>
        <Text style={{ display: 'block', marginTop: 16, textAlign: 'center' }}>
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </Text>
      </Card>
    </div>
  );
}
