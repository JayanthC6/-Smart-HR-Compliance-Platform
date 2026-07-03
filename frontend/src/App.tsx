import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import PoliciesPage from './pages/admin/Policies';
import OnboardingPage from './pages/admin/Onboarding';
import EmployeeHome from './pages/employee/Home';
import EmployeePolicies from './pages/employee/Policies';
import EmployeeTasks from './pages/employee/Tasks';
import AiChat from './pages/employee/AiChat';
import CompliancePage from './pages/admin/Compliance';
import AuditPage from './pages/admin/AuditLog';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<PrivateRoute><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin/policies" element={<PrivateRoute><Layout><PoliciesPage /></Layout></PrivateRoute>} />
      <Route path="/admin/onboarding" element={<PrivateRoute><Layout><OnboardingPage /></Layout></PrivateRoute>} />
      <Route path="/admin/compliance" element={<PrivateRoute><Layout><CompliancePage /></Layout></PrivateRoute>} />
      <Route path="/admin/audit" element={<PrivateRoute><Layout><AuditPage /></Layout></PrivateRoute>} />
      <Route path="/employee" element={<PrivateRoute><Layout><EmployeeHome /></Layout></PrivateRoute>} />
      <Route path="/employee/policies" element={<PrivateRoute><Layout><EmployeePolicies /></Layout></PrivateRoute>} />
      <Route path="/employee/tasks" element={<PrivateRoute><Layout><EmployeeTasks /></Layout></PrivateRoute>} />
      <Route path="/employee/ai" element={<PrivateRoute><Layout><AiChat /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}