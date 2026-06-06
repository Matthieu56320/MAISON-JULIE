import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ProductsProvider } from './context/ProductsContext';
import { CartProvider } from './context/CartContext';
import { ConfigProvider } from './context/ConfigContext'; 
import { AuthProvider } from './context/AuthContext'; // ✦ 1. Import de l'AuthProvider
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/home';
import Catalog from './pages/catalog';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/contact';
import Cart from './pages/cart';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Legal from './pages/Legal';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReviewFormPage from './pages/ReviewFormPage';

// ✦ Import de tes pages de compte (ajuste le nom des fichiers si besoin)
import Account from './pages/Account'; 
import Login from './pages/Login'; // ou Register.jsx selon ton organisation

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.includes('maison-julie-secret-dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdmin && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalog />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/avis" element={<ReviewFormPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/commande/merci" element={<CheckoutSuccess />} />
          <Route path="/cgv" element={<Legal type="cgv" />} />
          <Route path="/mentions-legales" element={<Legal type="mentions" />} />
          <Route path="/maison-julie-secret-dashboard" element={<AdminDashboard />} />
          
          {/* ✦ 2. Tes nouvelles routes d'authentification */}
          <Route path="/mon-compte" element={<Account />} />
          <Route path="/connexion" element={<Login />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ConfigProvider>
      <ProductsProvider>
        <CartProvider>
          {/* ✦ 3. L'AuthProvider enveloppe TOUT le monde ici (surtout le Router et AppShell) */}
          <AuthProvider>
            <Router>
              <AppShell />
            </Router>
          </AuthProvider>
        </CartProvider>
      </ProductsProvider>
    </ConfigProvider>
  );
}

export default App;