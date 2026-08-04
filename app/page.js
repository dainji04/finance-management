'use client';

import { useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tag, Spin, Alert } from 'antd';
import { FiBarChart2 } from 'react-icons/fi';
import { useFinance } from './components/FinanceProvider';

const { Text } = Typography;

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

function monthKey(date) {
  return new Date(date).toISOString().slice(0, 7);
}

export default function SummaryPage() {
  const { data, loading, error } = useFinance();
  const selectedMonth = monthKey(new Date());
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const expenses = data.expenses.filter((item) => monthKey(item.date) === selectedMonth);
  const incomes = data.incomes.filter((item) => monthKey(item.date) === selectedMonth);
  const previousExpenses = data.expenses.filter((item) => monthKey(item.date) === previousMonth);

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const prevExpense = previousExpenses.reduce((sum, item) => sum + item.amount, 0);

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
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card><Statistic title="Chi tháng này" value={totalExpense} formatter={(value) => formatCurrency(Number(value))} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Thu tháng này" value={totalIncome} formatter={(value) => formatCurrency(Number(value))} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="So sánh tháng trước" value={totalExpense - prevExpense} formatter={(value) => formatCurrency(Number(value))} /></Card></Col>
      </Row>

      <Card title={<Space><FiBarChart2 /><span>Ngân sách theo danh mục</span></Space>}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {data.categories.map((category) => {
            const amount = expenses.filter((item) => item.categoryId === category.id).reduce((sum, item) => sum + item.amount, 0);
            const percent = category.budget ? Math.min(Math.round((amount / category.budget) * 100), 100) : 0;
            return (
              <div key={category.id}>
                <div className="row">
                  <Tag color={category.color} variant="solid" style={{ color: '#fff' }}>{category.name}</Tag>
                  <Text type="secondary">{formatCurrency(amount)} / {formatCurrency(category.budget)}</Text>
                </div>
                <Progress percent={percent} showInfo={false} />
              </div>
            );
          })}
        </Space>
      </Card>
    </section>
  );
}
