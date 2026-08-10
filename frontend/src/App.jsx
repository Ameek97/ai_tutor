import { useEffect, useState } from 'react';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import UserDashboard from './UserDashboard.jsx';
import './App.css';

function App() {
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem('token');
          setUser(null);
          return;
        }

        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthView('login');
  };

  if (checkingAuth) {
    return (
      <main className="app">
        <p>Checking authentication...</p>
      </main>
    );
  }

  // Only authenticated users can see the dashboard
  if (user) {
    return (
      <main className="app app-dashboard">
        <UserDashboard user={user} onLogout={handleLogout} />
      </main>
    );
  }

  return (
    <main className="app">
      {authView === 'signup' ? (
        <Signup
          onSignupSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      ) : (
        <Login
          onLoginSuccess={handleAuthSuccess}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      )}
    </main>
  );
}

export default App;
