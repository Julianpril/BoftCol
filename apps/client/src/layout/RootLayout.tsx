import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

interface RootLayoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
