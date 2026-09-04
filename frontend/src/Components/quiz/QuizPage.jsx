import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const data = [
  {
    id: 'q1',
    question: 'Which normal form eliminates partial dependency?',
    options: [
      'First Normal Form',
      'Second Normal Form',
      'Third Normal Form',
      'Boyce-Codd Normal Form',
    ],
    correctAnswer: 2,
    explanation: 'Second Normal Form eliminates partial dependencies on a composite candidate key.',
    topic: 'Database Normalization',
    difficulty: 'medium',
  },
  {
    id: 'q2',
    question: 'Which data structure follows the FIFO principle?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 2,
    explanation: 'A queue follows First In, First Out (FIFO).',
    topic: 'Data Structures',
    difficulty: 'easy',
  },
  {
    id: 'q3',
    question: 'Which protocol is primarily used to securely transfer web pages?',
    options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
    correctAnswer: 3,
    explanation: 'HTTPS is HTTP secured using TLS encryption.',
    topic: 'Computer Networks',
    difficulty: 'easy',
  },
  {
    id: 'q4',
    question: 'Which component is responsible for executing instructions in a computer?',
    options: ['RAM', 'CPU', 'Hard Disk', 'Monitor'],
    correctAnswer: 2,
    explanation: 'The CPU executes program instructions and performs the required computations.',
    topic: 'Computer Organization',
    difficulty: 'easy',
  },
  {
    id: 'q5',
    question: 'Which SQL command is used to retrieve data from a table?',
    options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
    correctAnswer: 3,
    explanation: 'SELECT is used to retrieve records from one or more database tables.',
    topic: 'SQL',
    difficulty: 'medium',
  },
];

function QuizPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
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

  const handleContinue = () => {
    if (!selectedCourse) {
      return;
    }

    navigate(`/quiz/${selectedCourse}`);
  };

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Quiz</h1>
          <p className="auth-subtitle">Select a course</p>
        </div>
        <Link to="/dashboard" className="secondary-button nav-link-button">
          Back to Dashboard
        </Link>
      </header>

      {error ? <p className="auth-error">{error}</p> : null}

      <div className="courses-list-section">
        <h2>Select a Course</h2>

        {loading ? <p className="dashboard-note">Loading courses...</p> : null}

        {!loading && !error && courses.length === 0 ? (
          <p className="dashboard-note">No courses yet. Create a course first.</p>
        ) : null}

        {!loading && courses.length > 0 ? (
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
        ) : null}
      </div>

      {!loading && courses.length > 0 ? (
        <div className="courses-actions">
          <button type="button" onClick={handleContinue} disabled={!selectedCourse}>
            Continue
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default QuizPage;
