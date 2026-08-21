import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function CourseDetail() {
  const { courseId } = useParams();
  const fileInputRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [courseError, setCourseError] = useState('');
  const [materialsError, setMaterialsError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const loadCourse = async () => {
      setCourseError('');
      setLoadingCourse(true);

      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setCourse(null);
          setCourseError(data.message || 'Failed to load course');
          return;
        }

        setCourse(data.course);
      } catch (err) {
        setCourse(null);
        setCourseError('Unable to connect to the server');
      } finally {
        setLoadingCourse(false);
      }
    };

    const loadMaterials = async () => {
      setMaterialsError('');
      setLoadingMaterials(true);

      try {
        const response = await fetch(`/api/study-materials/${courseId}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMaterials([]);
          setMaterialsError(data.message || 'Failed to load study materials');
          return;
        }

        setMaterials(data.studyMaterials || []);
      } catch (err) {
        setMaterials([]);
        setMaterialsError('Unable to connect to the server');
      } finally {
        setLoadingMaterials(false);
      }
    };

    loadCourse();
    loadMaterials();
  }, [courseId]);

  const handleUploadClick = () => {
    if (uploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed');
      return;
    }

    setUploadError('');
    setMaterialsError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', courseId);

      const response = await fetch('/api/study-materials', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.message || 'Failed to upload PDF');
        return;
      }

      setMaterials((prev) => [data.studyMaterial, ...prev]);
    } catch (err) {
      setUploadError('Unable to connect to the server');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    setMaterialsError('');
    setDeletingId(materialId);

    try {
      const response = await fetch(`/api/study-materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMaterialsError(data.message || 'Failed to delete study material');
        return;
      }

      setMaterials((prev) => prev.filter((material) => material._id !== materialId));
    } catch (err) {
      setMaterialsError('Unable to connect to the server');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="dashboard-card course-detail-page">
      <header className="dashboard-header">
        <div>
          {loadingCourse ? (
            <h1>Loading course...</h1>
          ) : (
            <h1>{course?.name || 'Course Detail'}</h1>
          )}
          <p className="auth-subtitle">Course overview</p>
        </div>
        <Link to="/courses" className="secondary-button nav-link-button">
          Back to Courses
        </Link>
      </header>

      {courseError ? <p className="auth-error">{courseError}</p> : null}

      {!courseError ? (
        <section className="course-section">
          <div className="course-section-header">
            <h2>Study Materials</h2>
            <button type="button" onClick={handleUploadClick} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {uploadError ? <p className="auth-error">{uploadError}</p> : null}
          {materialsError ? <p className="auth-error">{materialsError}</p> : null}

          {loadingMaterials ? (
            <p className="dashboard-note">Loading study materials...</p>
          ) : null}

          {!loadingMaterials && !materialsError && materials.length === 0 ? (
            <p className="dashboard-note">No study materials uploaded yet.</p>
          ) : null}

          {!loadingMaterials && materials.length > 0 ? (
            <ul className="courses-list">
              {materials.map((material) => (
                <li key={material._id} className="course-item">
                  <span className="material-name">{material.fileName}</span>
                  <div className="material-actions">
                    { material.fileUrl ? (
                      
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-button nav-link-button"
                      >
                        Open
                      </a>
                    ) : (
                      <button type="button" className="secondary-button" disabled>
                        Open
                      </button>
                    )}

                    
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDeleteMaterial(material._id)}
                      disabled={deletingId === material._id}
                    >
                      {deletingId === material._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}

export default CourseDetail;
