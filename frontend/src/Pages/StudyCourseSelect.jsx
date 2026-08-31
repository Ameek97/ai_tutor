import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function StudyCourseSelect() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const loadCourses = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await fetch('/api/courses', {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setCourses([]);
          setError(data.message || 'Failed to load courses');
          return;
        }

        setCourses(data.courses || []);
      } catch (err) {
        setCourses([]);
        setError('Unable to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Study</h1>
          <p className="auth-subtitle">Select a course to study</p>
        </div>
        <Link to="/dashboard" className="secondary-button nav-link-button">
          Back to Dashboard
        </Link>
      </header>

      {error ? <p className="auth-error">{error}</p> : null}

      <div className="courses-list-section">
        <h2>My Courses</h2>

        {loading ? <p className="dashboard-note">Loading courses...</p> : null}

        {!loading && !error && courses.length === 0 ? (
          <p className="dashboard-note">No courses yet. Create a course first.</p>
        ) : null}

        {!loading && courses.length > 0 ? (
          <ul className="courses-list">
            {courses.map((course) => (
              <li key={course._id} className="course-item">
                <Link to={`/study/${course._id}`} className="course-link">
                  {course.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default StudyCourseSelect;
