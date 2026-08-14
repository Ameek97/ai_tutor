import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function CoursesDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchCourses = async () => {
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
        setError(data.message || 'Failed to load courses');
        return;
      }

      setCourses(data.courses || []);
    } catch (err) {
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setError('');

    if (!courseName.trim()) {
      setError('Course name is required');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: courseName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create course');
        return;
      }

      setCourses((prev) => [data.course, ...prev]);
      setCourseName('');
      setShowForm(false);
    } catch (err) {
      setError('Unable to connect to the server');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    setError('');
    setDeletingId(courseId);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to delete course');
        return;
      }

      setCourses((prev) => prev.filter((course) => course._id !== courseId));
    } catch (err) {
      setError('Unable to connect to the server');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelCreate = () => {
    setShowForm(false);
    setCourseName('');
    setError('');
  };

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Courses</h1>
          <p className="auth-subtitle">Manage your courses</p>
        </div>
        <Link to="/dashboard" className="secondary-button nav-link-button">
          Back to Dashboard
        </Link>
      </header>

      <div className="courses-actions">
        <button type="button" onClick={() => setShowForm(true)}>
          + Create Course
        </button>
      </div>

      {showForm ? (
        <form className="create-course-form" onSubmit={handleCreateCourse}>
          <label>
            Course Name
            <input
              type="text"
              value={courseName}
              onChange={(event) => setCourseName(event.target.value)}
              placeholder="e.g. DBMS"
              required
            />
          </label>
          <div className="create-course-actions">
            <button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleCancelCreate}
              disabled={creating}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="auth-error">{error}</p> : null}

      <div className="courses-list-section">
        <h2>My Courses</h2>

        {loading ? <p className="dashboard-note">Loading courses...</p> : null}

        {!loading && courses.length === 0 ? (
          <p className="dashboard-note">No courses yet. Create your first course.</p>
        ) : null}

        {!loading && courses.length > 0 ? (
          <ul className="courses-list">
            {courses.map((course) => (
              <li key={course._id} className="course-item">
                <Link to={`/courses/${course._id}`} className="course-link">
                  {course.name}
                </Link>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDeleteCourse(course._id)}
                  disabled={deletingId === course._id}
                >
                  {deletingId === course._id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default CoursesDashboard;
