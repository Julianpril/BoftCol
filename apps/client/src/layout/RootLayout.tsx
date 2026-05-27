import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';

interface RootLayoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" key={location.key} style={{ animation: 'page-enter 0.35s cubic-bezier(0.23, 1, 0.32, 1) both' }}>
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
