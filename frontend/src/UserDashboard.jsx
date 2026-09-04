import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>User Dashboard</h1>
          <p className="auth-subtitle">You are signed in.</p>
        </div>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <div className="dashboard-info">
        <h2>Your information</h2>
        <p>
          <span>Name</span>
          {user?.name}
        </p>
        <p>
          <span>Email</span>
          {user?.email}
        </p>
      </div>

      <div className="dashboard-nav">
        <h2>Navigate</h2>
        <Link to="/courses" className="nav-link-button">
          Courses
        </Link>
        <Link to="/study" className="nav-link-button secondary-button">
          Study
        </Link>
        <Link to="/quiz" className="nav-link-button secondary-button">
          Quiz
        </Link>
      </div>
    </section>
  );
}

export default UserDashboard;
