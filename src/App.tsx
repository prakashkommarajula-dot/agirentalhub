/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import FarmerHome from './pages/FarmerHome';
import EquipmentDetails from './pages/EquipmentDetails';
import BookingPage from './pages/Booking';
import PaymentPage from './pages/Payment';
import OrderConfirmed from './pages/OrderConfirmed';
import OwnerDashboard from './pages/OwnerDashboard';
import AddEquipment from './pages/AddEquipment';
import BookingHistory from './pages/BookingHistory';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Farmer Routes */}
        <Route path="/farmer/home" element={
          <ProtectedRoute role="farmer">
            <FarmerHome />
          </ProtectedRoute>
        } />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        <Route path="/booking/:id" element={
          <ProtectedRoute role="farmer">
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="/payment/:bookingId" element={
          <ProtectedRoute role="farmer">
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/order-confirmed" element={
          <ProtectedRoute role="farmer">
            <OrderConfirmed />
          </ProtectedRoute>
        } />
        
        {/* Owner Routes */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute role="owner">
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/owner/add-equipment" element={
          <ProtectedRoute role="owner">
            <AddEquipment />
          </ProtectedRoute>
        } />
        
        {/* Shared Routes */}
        <Route path="/bookings" element={
          <ProtectedRoute>
            <BookingHistory />
          </ProtectedRoute>
        } />
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
