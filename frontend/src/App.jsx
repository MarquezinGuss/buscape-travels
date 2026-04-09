// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TripPage from "./pages/TripPage";

// Rota protegida: redireciona para /login se não autenticado
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Rota pública: redireciona para / se já autenticado
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Rotas protegidas */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
