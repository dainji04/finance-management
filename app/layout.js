import './globals.css';
import { FinanceProvider } from './components/FinanceProvider';
import { FinanceShell } from './components/FinanceShell';

export const metadata = {
  title: 'Quản lý chi tiêu cá nhân',
  description: 'Ứng dụng theo dõi chi tiêu, thu nhập và công nợ cho việc dùng thực tế trên Vercel.',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <FinanceProvider>
          <FinanceShell>{children}</FinanceShell>
        </FinanceProvider>
      </body>
    </html>
  );
}
