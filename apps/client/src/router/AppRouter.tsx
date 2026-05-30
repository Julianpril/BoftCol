import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/layout';
import { LandingPage } from '@/features/landing';
import { UploadPage } from '@/features/photos';
import { CheckoutPage } from '@/features/checkout';
import { NequiPaymentPage, PaymentStatusPage } from '@/features/payments';
import { AdminDashboardPage, AdminLoginPage, AdminSettingsPage, AdminCodesPage } from '@/features/admin';
import AdminSupportPage from '@/features/admin/AdminSupportPage';
import { SupportChatPage } from '@/features/support';

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
        <Route path="/admin/codes" element={<AdminCodesPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/support" element={<AdminSupportPage />} />
        
        {/* Independent Support Route */}
        <Route path="/support" element={<SupportChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
