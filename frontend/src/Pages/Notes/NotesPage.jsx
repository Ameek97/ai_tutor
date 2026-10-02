import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function NotesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    {/* once the pages loads, fetch the courses */}

    const loadCourses = async () => {
     
    };

    loadCourses();
  }, []);

  const handleContinue = async () => {
    if (!selectedCourse) {
      return; }

    setLoading(true);

    // TODO: fetch topics for selectedCourse and store them with setTopics.
  };

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Notes</h1>
          <p className="auth-subtitle">Select a course</p>
        </div>
        <Link to="/dashboard" className="secondary-button nav-link-button">
          Back to Dashboard
        </Link>
      </header>

      {loading ? <p className="dashboard-note">Loading...</p> : null}

      {!loading ? (
        <div className="courses-list-section">
          <h2>Select a Course</h2>

          {courses.length === 0 ? (
            <p className="dashboard-note">No courses yet. Create a course first.</p>
          ) : (
            <ul className="courses-list">
              {courses.map((course) => (
                <li key={course._id}>
                  <button
                    type="button"
                    className={
                      selectedCourse === course._id
                        ? 'quiz-course-option quiz-course-option-selected'
                        : 'quiz-course-option'
                    }
                    onClick={() => setSelectedCourse(course._id)}
                  >
                    {course.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {!loading ? (
        <div className="courses-actions">
          <button type="button" onClick={handleContinue} disabled={!selectedCourse}>
            Continue
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default NotesPage;
