'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FinanceContext = createContext(null);

const defaultProfile = { displayName: 'Bạn', name: '', email: '', phone: '', balance: 0 };

function normalizeRecord(record) {
  if (!record) return record;
  const normalized = { ...record, id: record._id ? String(record._id) : record.id };
  delete normalized._id;
  delete normalized.__v;
  return normalized;
}

function normalizeList(list = []) {
  return list.map(normalizeRecord);
}

export function FinanceProvider({ children }) {
  const [data, setData] = useState({ categories: [], expenses: [], incomes: [], debts: [], activities: [], profile: defaultProfile });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to load data');
        const body = await response.json();
        setData({
          categories: normalizeList(body.categories),
          expenses: normalizeList(body.expenses),
          incomes: normalizeList(body.incomes),
          debts: normalizeList(body.debts),
          activities: normalizeList(body.activities),
          profile: body.profile ? { ...defaultProfile, ...body.profile } : defaultProfile
        });
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        setError(error?.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const api = useMemo(() => ({
    data,
    loading,
    error,
    addExpense: async (payload) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không lưu được chi tiêu');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, expenses: [saved, ...prev.expenses] }));
      return saved;
    },
    updateExpense: async (id, payload) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không cập nhật được chi tiêu');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, expenses: prev.expenses.map((item) => (item.id === saved.id ? saved : item)) }));
      return saved;
    },
    deleteExpense: async (id) => {
      const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Không xóa được chi tiêu');
      }
      setData((prev) => ({ ...prev, expenses: prev.expenses.filter((item) => item.id !== id) }));
    },
    addIncome: async (payload) => {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không lưu được thu nhập');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, incomes: [saved, ...prev.incomes] }));
      return saved;
    },
    updateIncome: async (id, payload) => {
      const response = await fetch(`/api/income/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không cập nhật được thu nhập');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, incomes: prev.incomes.map((item) => (item.id === saved.id ? saved : item)) }));
      return saved;
    },
    deleteIncome: async (id) => {
      const response = await fetch(`/api/income/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Không xóa được thu nhập');
      }
      setData((prev) => ({ ...prev, incomes: prev.incomes.filter((item) => item.id !== id) }));
    },
    addDebt: async (payload) => {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không lưu được công nợ');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, debts: [saved, ...prev.debts] }));
      return saved;
    },
    updateDebt: async (id, payload) => {
      const response = await fetch(`/api/debts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không cập nhật được công nợ');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, debts: prev.debts.map((item) => (item.id === saved.id ? saved : item)) }));
      return saved;
    },
    deleteDebt: async (id) => {
      const response = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Không xóa được công nợ');
      }
      setData((prev) => ({ ...prev, debts: prev.debts.filter((item) => item.id !== id) }));
    },
    addCategory: async (payload) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không lưu được danh mục');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, categories: [saved, ...prev.categories] }));
      return saved;
    },
    updateCategory: async (id, payload) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không cập nhật được danh mục');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, categories: prev.categories.map((item) => (item.id === saved.id ? saved : item)) }));
      return saved;
    },
    deleteCategory: async (id) => {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Không xóa được danh mục');
      }
      setData((prev) => ({ ...prev, categories: prev.categories.filter((item) => item.id !== id) }));
    },
    addActivity: async (payload) => {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không lưu được hoạt động');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, activities: [saved, ...prev.activities] }));
      return saved;
    },
    updateActivity: async (id, payload) => {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không cập nhật được hoạt động');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, activities: prev.activities.map((item) => (item.id === saved.id ? saved : item)) }));
      return saved;
    },
    deleteActivity: async (id) => {
      const response = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Không xóa được hoạt động');
      }
      setData((prev) => ({ ...prev, activities: prev.activities.filter((item) => item.id !== id) }));
    },
    updateProfile: async (payload) => {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'Không lưu được hồ sơ');
      }
      const saved = normalizeRecord(body);
      setData((prev) => ({ ...prev, profile: saved }));
      return saved;
    }
  }), [data, loading]);

  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider');
  return context;
}
