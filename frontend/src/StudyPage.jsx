import { Link } from 'react-router-dom';

function StudyPage() {
  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Study</h1>
          <p className="auth-subtitle">AI tutor will be added later.</p>
        </div>
        <Link to="/dashboard" className="secondary-button nav-link-button">
          Back to Dashboard
        </Link>
      </header>
      <p className="dashboard-note">
        This is a placeholder Study page. Course selection and AI chat will come in a future step.
      </p>
    </section>
  );
}

export default StudyPage;
