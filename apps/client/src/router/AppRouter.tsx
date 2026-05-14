import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/layout';
import { LandingPage } from '@/features/landing';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}
