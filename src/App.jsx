import { useEffect, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header               from './components/Header'
import Footer               from './components/Footer'
import Home                 from './pages/Home'
import CategoryPage         from './pages/CategoryPage'
import ProvidersPage        from './pages/ProvidersPage'
import RegistroProveedoresPage from './pages/RegistroProveedoresPage'
import LoginPage            from './pages/LoginPage'
import ProviderDashboard    from './pages/ProviderDashboard'
import ResetPasswordPage    from './pages/ResetPasswordPage'
import AdminPanel           from './pages/AdminPanel'
import PricingPage          from './pages/PricingPage'
import VerificacionPage     from './pages/VerificacionPage'
import ProviderPage         from './pages/ProviderPage'
import FirstStepsPage       from './pages/FirstStepsPage'
import ProtectedRoute       from './components/ProtectedRoute'
import RemesasFloat        from './components/RemesasFloat'
import { AuthProvider }     from './hooks/useAuth'
// IMPORTANTE: Se eliminó initScrollTracking de la siguiente línea
import { useTranslation } from 'react-i18next'
import { trackPageView } from './utils/analytics'

function NotFound() {
  const { t } = useTranslation()
  return (
    <main style={{ padding: '180px 24px 80px', textAlign: 'center' }}>
      <h1 className="d-lg" style={{ color: 'var(--iris-900)', marginBottom: 16 }}>{t('not_found.title')}</h1>
      <a href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}><span>{t('not_found.back_home')}</span></a>
    </main>
  )
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);
  return null;
}

function Layout() {
  return (
    <>
      <AnalyticsListener />
      <ScrollTop />
      <Header />
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/proveedores"          element={<ProvidersPage />} />
        <Route path="/registro-proveedores" element={<RegistroProveedoresPage />} />
        <Route path="/planes"               element={<PricingPage />} />
        <Route path="/verificacion"         element={<VerificacionPage />} />
        <Route path="/proveedor/:slug"      element={<ProviderPage />} />
        <Route path="/primeros-pasos"       element={<FirstStepsPage />} />
        <Route path="/login"                element={<LoginPage />} />
        <Route path="/reset-password"       element={<ResetPasswordPage />} />
        <Route path="/mi-perfil"            element={
          <ProtectedRoute requireRole="provider">
            <ProviderDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin"                element={
          <ProtectedRoute requireRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <RemesasFloat />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}