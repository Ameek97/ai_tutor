import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import UserDashboard from './UserDashboard.jsx';
import CoursesDashboard from './CoursesDashboard.jsx';
import CourseDetail from './CourseDetail.jsx';
import QuizPage from './Components/quiz/QuizPage.jsx';
import QuizHistory from './Components/quiz/QuizHistory.jsx';
import QuizCoursePage from './Components/quiz/QuizCoursePage.jsx';
import StudyPage from './Pages/Study/StudyPage.jsx';
import StudyCourseSelect from './Pages/Study/StudyCourseSelect.jsx';
import NotesPage from './Pages/Notes/NotesPage.jsx';
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
          path="/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/history"
          element={
            <ProtectedRoute>
              <QuizHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/attempt/:attemptId"
          element={
            <ProtectedRoute>
              <QuizCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:courseId"
          element={
            <ProtectedRoute>
              <QuizCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <StudyCourseSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/:courseId"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
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
