import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import HouseholdPage from './pages/household/HouseholdPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/household"
                element={
                    <ProtectedRoute>
                        <HouseholdPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
