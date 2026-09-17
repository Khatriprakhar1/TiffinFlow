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
import Menu from './pages/Menu';
import Plans from './pages/Plans';
import AddPlan from './pages/AddPlan';
import EditPlan from './pages/EditPlan';
import Clock from './pages/Clock';
import Transfers from './pages/Transfers';
import Import from './pages/Import';
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
      <Route path="/menu" element={
        <>
          <Navbar onToggleSidebar={() => {}} />
          <Menu />
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
      <Route path="/plans" element={
        <ProtectedRoute>
          <AppLayout><Plans /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/plans/new" element={
        <ProtectedRoute>
          <AppLayout><AddPlan /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/plans/:id/edit" element={
        <ProtectedRoute>
          <AppLayout><EditPlan /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/clock" element={
        <ProtectedRoute>
          <AppLayout><Clock /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/transfers" element={
        <ProtectedRoute>
          <AppLayout><Transfers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/import" element={
        <ProtectedRoute>
          <AppLayout><Import /></AppLayout>
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
