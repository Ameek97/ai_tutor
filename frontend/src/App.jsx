import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import UserDashboard from './UserDashboard.jsx';
import CoursesDashboard from './CoursesDashboard.jsx';
import CourseDetail from './CourseDetail.jsx';
import StudyPage from './Pages/StudyPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="app">
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className={`app ${isAuthenticated ? 'app-dashboard' : ''}`}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </main>
  );
}

export default App;
