import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function QuizHistory() {
  const [attempts, setAttempts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');

  const getCourseName = (courseId) => {
    const course = courses.find((item) => item._id === courseId);
    return course?.name || courseId;
  };

  useEffect(() => {
    const loadHistory = async () => {
      setError('');
      setLoading(true);

      try {
        const [attemptsResponse, coursesResponse] = await Promise.all([
          axios.get('/api/quiz/attempts', {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }),
          axios.get('/api/courses', {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }),
        ]);

        setAttempts(attemptsResponse.data.attempts || []);
        setCourses(coursesResponse.data.courses || []);
      } catch (err) {
        setAttempts([]);
        setError(err.response?.data?.message || 'Failed to fetch quiz attempts');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Quiz History</h1>
          <p className="auth-subtitle">Your saved quiz attempts</p>
        </div>
        <Link to="/dashboard" className="secondary-button nav-link-button">
          Back to Dashboard
        </Link>
      </header>

      {error ? <p className="auth-error">{error}</p> : null}

      {loading ? <p className="dashboard-note">Loading attempts...</p> : null}

      {!loading && !error && attempts.length === 0 ? (
        <p className="dashboard-note">No quiz attempts yet. Complete a quiz to see it here.</p>
      ) : null}

      {!loading && attempts.length > 0 ? (
        <div className="courses-list-section">
          <h2>Attempts</h2>
          <ul className="courses-list">
            {attempts.map((attempt) => {
              const percentage =
                attempt.totalQuestions > 0
                  ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                  : 0;
              const dateLabel = attempt.createdAt
                ? new Date(attempt.createdAt).toLocaleString()
                : '';

              return (
                <li key={attempt._id}>
                  <p>
                    <strong>{getCourseName(attempt.course_id)}</strong>
                  </p>
                  <p className="dashboard-note">
                    {attempt.score} / {attempt.totalQuestions} ({percentage}%)
                  </p>
                  {dateLabel ? <p className="dashboard-note">{dateLabel}</p> : null}
                  <Link
                    to={`/quiz/attempt/${attempt._id}`}
                    className="nav-link-button secondary-button"
                  >
                    View Result
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default QuizHistory;
