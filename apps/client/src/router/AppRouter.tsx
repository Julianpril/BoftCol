import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/layout';
import { LandingPage } from '@/features/landing';
import { UploadPage } from '@/features/photos';
import { CheckoutPage } from '@/features/checkout';
import { NequiPaymentPage, PaymentStatusPage } from '@/features/payments';
import { AdminDashboardPage, AdminLoginPage, AdminSettingsPage } from '@/features/admin';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with RootLayout */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/nequi" element={<NequiPaymentPage />} />
          <Route path="/payment/status" element={<PaymentStatusPage />} />
        </Route>

        {/* Admin Routes without RootLayout */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
