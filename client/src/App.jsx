import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import CustomerDetails from './pages/CustomerDetails';
import EditCustomer from './pages/EditCustomer';
import NotFound from './pages/NotFound';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-[57px] lg:pl-60 min-h-screen bg-gray-50">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </>
  );
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <>
          <Navbar onToggleSidebar={() => {}} />
          <Landing />
        </>
      } />
      <Route path="/login" element={
        <>
          <Navbar onToggleSidebar={() => {}} />
          <Login />
        </>
      } />
      <Route path="/register" element={
        <>
          <Navbar onToggleSidebar={() => {}} />
          <Register />
        </>
      } />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute>
          <AppLayout><Customers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/customers/new" element={
        <ProtectedRoute>
          <AppLayout><AddCustomer /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/customers/:id" element={
        <ProtectedRoute>
          <AppLayout><CustomerDetails /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/customers/:id/edit" element={
        <ProtectedRoute>
          <AppLayout><EditCustomer /></AppLayout>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <>
          <Navbar onToggleSidebar={() => {}} />
          <NotFound />
        </>
      } />
    </Routes>
  );
};

export default App;
