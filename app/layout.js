import './globals.css';
import { FinanceProvider } from './components/FinanceProvider';
import { FinanceShell } from './components/FinanceShell';
import { ThemeProvider } from './components/ThemeProvider';

export const metadata = {
  title: 'Quản lý chi tiêu cá nhân',
  description: 'Ứng dụng theo dõi chi tiêu, thu nhập và công nợ cho việc dùng thực tế trên Vercel.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo2.jpg',
    shortcut: '/logo2.jpg',
    apple: '/logo2.jpg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="apple-touch-icon" href="/logo2.jpg" />
      </head>
      <body>
        <ThemeProvider>
          <FinanceProvider>
            <FinanceShell>{children}</FinanceShell>
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

