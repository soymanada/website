import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header        from './components/Header'
import Footer        from './components/Footer'
import Home          from './pages/Home'
import CategoryPage  from './pages/CategoryPage'
import ProvidersPage         from './pages/ProvidersPage'
import RegistroProveedoresPage from './pages/RegistroProveedoresPage'
// IMPORTANTE: Se eliminó initScrollTracking de la siguiente línea
import { trackPageView } from './utils/analytics'

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
        <Route path="*" element={
          <main style={{ padding: '180px 24px 80px', textAlign: 'center' }}>
            <h1 className="d-lg" style={{ color: 'var(--iris-900)', marginBottom: 16 }}>Página no encontrada</h1>
            <a href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}><span>Volver al inicio</span></a>
          </main>
        } />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}