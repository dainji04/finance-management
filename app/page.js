'use client';

import { useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tag, Tabs, Spin, Alert } from 'antd';
import { useFinance } from './components/FinanceProvider';

const { Text } = Typography;

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

function monthKey(date) {
  return new Date(date).toISOString().slice(0, 7);
}

function groupSum(items, key) {
  const map = new Map();
  items.forEach((item) => {
    const label = item[key] || 'Khác';
    map.set(label, (map.get(label) || 0) + item.amount);
  });
  return Array.from(map.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export default function SummaryPage() {
  const { data, loading, error } = useFinance();
  const selectedMonth = monthKey(new Date());

  const expenses = data.expenses.filter((item) => monthKey(item.date) === selectedMonth);
  const incomes = data.incomes.filter((item) => monthKey(item.date) === selectedMonth);
  const debtsThisMonth = data.debts.filter((item) => monthKey(item.date) === selectedMonth);

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalDebt = debtsThisMonth.reduce((sum, item) => sum + item.amount, 0);
  const expenseVsIncome = totalIncome - totalExpense;

  const incomeByType = useMemo(() => groupSum(incomes, 'type'), [incomes]);
  const debtByPerson = useMemo(() => groupSum(debtsThisMonth, 'person'), [debtsThisMonth]);

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

  const tabItems = [
    {
      key: 'budget',
      label: 'Ngân sách',
      children: (
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
      )
    },
    {
      key: 'income',
      label: 'Thu nhập',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          {incomeByType.length === 0 ? (
            <Text type="secondary">Chưa có khoản thu nào tháng này</Text>
          ) : (
            incomeByType.map((entry) => (
              <div className="row" key={entry.label}>
                <Text strong>{entry.label}</Text>
                <Text type="secondary">{formatCurrency(entry.amount)}</Text>
              </div>
            ))
          )}
        </Space>
      )
    },
    {
      key: 'debt',
      label: 'Công nợ',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          {debtByPerson.length === 0 ? (
            <Text type="secondary">Chưa có công nợ nào tháng này</Text>
          ) : (
            debtByPerson.map((entry) => (
              <div className="row" key={entry.label}>
                <Text strong>{entry.label}</Text>
                <Text type="secondary">{formatCurrency(entry.amount)}</Text>
              </div>
            ))
          )}
        </Space>
      )
    }
  ];

  return (
    <section className="stack">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Chi tháng này" value={totalExpense} formatter={(value) => formatCurrency(Number(value))} />
            <Text type={expenseVsIncome < 0 ? 'danger' : 'success'} style={{ display: 'block', marginTop: 8 }}>
              {expenseVsIncome < 0
                ? `Âm ${formatCurrency(Math.abs(expenseVsIncome))} so với thu nhập tháng này`
                : `Dư ${formatCurrency(expenseVsIncome)} so với thu nhập tháng này`}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}><Card><Statistic title="Thu tháng này" value={totalIncome} formatter={(value) => formatCurrency(Number(value))} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Công nợ tháng này" value={totalDebt} formatter={(value) => formatCurrency(Number(value))} /></Card></Col>
      </Row>

      <Card>
        <Tabs items={tabItems} centered />
      </Card>
    </section>
  );
}
