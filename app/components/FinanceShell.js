'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Menu } from 'antd';
import { FiDollarSign, FiGrid, FiTrendingUp, FiBriefcase, FiActivity, FiBarChart2, FiUser } from 'react-icons/fi';

const { Header, Content } = Layout;

const links = [
  { href: '/', label: 'Tổng hợp', icon: <FiBarChart2 /> },
  { href: '/expenses', label: 'Chi tiêu', icon: <FiDollarSign /> },
  { href: '/categories', label: 'Danh mục', icon: <FiGrid /> },
  { href: '/income', label: 'Tiền vào', icon: <FiTrendingUp /> },
  { href: '/debts', label: 'Công nợ', icon: <FiBriefcase /> },
  { href: '/activities', label: 'Hoạt động', icon: <FiActivity /> },
  { href: '/auth', label: 'Hồ sơ', icon: <FiUser /> }
];

export function FinanceShell({ children }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const currentLink = links.find((link) => link.href === pathname);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const updateLayout = () => setIsMobile(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);

    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f7fb' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}>
        <div className="topbar">
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, minHeight: 24 }}>
            {currentLink?.icon}
            <span>{currentLink?.label ?? 'Quản lý chi tiêu'}</span>
          </div>
        </div>
      </Header>
      <Content style={{ padding: isMobile ? '16px 16px 84px' : '16px' }}>
        <div className="shell">
          {!isMobile && (
            <Menu
              mode="horizontal"
              selectedKeys={[pathname]}
              style={{ marginBottom: 16, borderRadius: 12 }}
              items={links.map((link) => ({
                key: link.href,
                icon: link.icon,
                label: <Link href={link.href}>{link.label}</Link>
              }))}
            />
          )}
          {children}
        </div>
      </Content>

      {isMobile && (
        <nav className="mobile-nav-bar" aria-label="Điều hướng chính">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link${active ? ' active' : ''}`}
                aria-label={link.label}
              >
                <span className="mobile-nav-icon">{link.icon}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </Layout>
  );
}
