import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tamilan Pride Dashboard',
  description: 'Tamilan Pride Discord Bot Management Dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
