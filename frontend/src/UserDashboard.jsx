function UserDashboard({ user, onLogout }) {
  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>User Dashboard</h1>
          <p className="auth-subtitle">You are signed in.</p>
        </div>
        <button type="button" onClick={onLogout}>
          Log out
        </button>
      </header>

      <div className="dashboard-info">
        <h2>Your information</h2>
        <p>
          <span>Name</span>
          {user.name}
        </p>
        <p>
          <span>Email</span>
          {user.email}
        </p>
      </div>

      <p className="dashboard-note">
        Courses and Study will be added in the next steps.
      </p>
    </section>
  );
}

export default UserDashboard;
