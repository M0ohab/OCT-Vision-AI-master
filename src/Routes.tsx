import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import Education from './pages/Education';
import ProtectedRoute from './components/ProtectedRoute';

export default function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diagnosis"
        element={
          <ProtectedRoute>
            <Diagnosis />
          </ProtectedRoute>
        }
      />
      <Route path="/education" element={<Education />} />
    </RouterRoutes>
  );
}