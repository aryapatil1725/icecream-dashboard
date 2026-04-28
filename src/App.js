import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerCart from "./pages/CustomerCart";
import SimpleCart from "./pages/SimpleCart";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerProfile from "./pages/CustomerProfile";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          
          {/* Customer Routes */}
          <Route path="/customer/dashboard" element={
            <CustomerProtectedRoute>
              <CustomerDashboard />
            </CustomerProtectedRoute>
          } />
          <Route path="/customer/cart" element={
            <CustomerProtectedRoute>
              <CustomerCart />
            </CustomerProtectedRoute>
          } />
          <Route path="/customer/simple-cart" element={
            <CustomerProtectedRoute>
              <SimpleCart />
            </CustomerProtectedRoute>
          } />
          <Route path="/customer/orders" element={
            <CustomerProtectedRoute>
              <CustomerOrders />
            </CustomerProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <CustomerProtectedRoute>
              <CustomerProfile />
            </CustomerProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}