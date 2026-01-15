import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { CartProvider } from './context/CartContext';

// Components
import ProductCatalog from './components/ProductCatalog';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';

// Protected Route Component
const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Login route - always accessible */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/products" replace />
              ) : (
              <LoginPage onLogin={handleLogin} />
            )
          } 
        />

        {/* Home route - accessible to authenticated users */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              element={<HomePage user={user} onLogout={handleLogout} />}
            />
          } 
        />

        {/* Products route - accessible to authenticated users */}
        <Route 
          path="/products" 
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              element={<ProductCatalog user={user} onLogout={handleLogout} />}
            />
          } 
        />

        {/* Admin route - accessible to authenticated users */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              element={<AdminDashboard user={user} onLogout={handleLogout} />}
            />
          } 
        />

        {/* Cart route - accessible to authenticated users */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              element={<CartPage user={user} onLogout={handleLogout} />}
            />
          } 
        />

        {/* Order Confirmation route - accessible to authenticated users */}
        <Route 
          path="/order-confirmation/:orderId" 
          element={<OrderConfirmationPage user={user} />} 
        />

        {/* Purchase History route - accessible to authenticated users */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              element={<PurchaseHistoryPage user={user} />}
            />
          } 
        />

        {/* Catch all - redirect to login if not authenticated, products if authenticated */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/products" : "/login"} replace />} 
        />
      </Routes>
    </Router>
    </CartProvider>
  );
};

export default App;
