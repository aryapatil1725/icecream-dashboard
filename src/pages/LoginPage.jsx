import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { LogIn, IceCream, User, Mail, Phone, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('admin');
  
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [isCustomerLogin, setIsCustomerLogin] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(adminUsername, adminPassword);
      login(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Admin login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isCustomerLogin) {
        const data = await authAPI.customerLogin(customerEmail);
        localStorage.setItem("customerEmail", data.customer.email);
        localStorage.setItem("customerName", data.customer.name);
        navigate("/customer/dashboard");
      } else {
        await authAPI.customerRegister(customerName, customerEmail, customerPhone);
        setIsCustomerLogin(true);
        setError("");
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPassword("");
        setCustomerPhone("");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">

      <div className="max-w-md w-full">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-brand-500 p-3 rounded-full">
                <IceCream className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Ice Cream Shop 🍦</h1>
            <p className="text-sm text-gray-600">Sweeten your day with delicious treats!</p>
          </div>

          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('admin');
                setError('');
              }}
              className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'admin'
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 hover:text-brand-600'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => {
                setActiveTab('customer');
                setError('');
              }}
              className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'customer'
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 hover:text-brand-600'
              }`}
            >
              Customer
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {activeTab === 'admin' && (
            <>
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <label htmlFor="admin-username" className="block text-xs font-bold text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="admin-password" className="block text-xs font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Admin Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-xs">
                <p className="font-bold text-gray-900 mb-1">Default Credentials:</p>
                <p className="text-gray-700">Username: <span className="font-mono bg-white px-1.5 py-0.5 rounded">admin</span></p>
                <p className="text-gray-700">Password: <span className="font-mono bg-white px-1.5 py-0.5 rounded">admin123</span></p>
              </div>
            </>
          )}

          {activeTab === 'customer' && (
            <>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setIsCustomerLogin(true);
                    setError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-md font-semibold text-xs transition-all ${
                    isCustomerLogin
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-600 hover:text-brand-600'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsCustomerLogin(false);
                    setError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-md font-semibold text-xs transition-all ${
                    !isCustomerLogin
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-600 hover:text-brand-600'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="space-y-3">
                {!isCustomerLogin && (
                  <div>
                    <label htmlFor="customer-name" className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-500" />
                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                        placeholder="John Doe"
                        required={!isCustomerLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="customer-email" className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-500" />
                    <input
                      id="customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customer-password" className="block text-xs font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <LogIn className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-500" />
                    <input
                      id="customer-password"
                      type="password"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {!isCustomerLogin && (
                  <div>
                    <label htmlFor="customer-phone" className="block text-xs font-bold text-gray-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-500" />
                      <input
                        id="customer-phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isCustomerLogin ? (
                        <>
                          <LogIn className="w-4 h-4" />
                          Customer Login
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          Create Account
                        </>
                      )}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;