const axios = require('axios');

const extractTopicsFromSyllabus = async ({ document_id, course_id, pdf_url }) => {
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL;

  if (!pythonServiceUrl) {
    throw new Error('PYTHON_SERVICE_URL is missing from environment variables');
  }

  const extractTopicsUrl = `${pythonServiceUrl.replace(/\/$/, '')}/extract-topics`;

  try {
    const response = await axios.post(
      extractTopicsUrl,
      {
        document_id,
        course_id,
        pdf_url,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.detail || error.response.data?.message || error.message;
      const message = typeof detail === 'string' ? detail : JSON.stringify(detail);
      throw new Error(`Python service error (${error.response.status}): ${message}`);
    }

    if (error.request) {
      throw new Error('Unable to reach the Python service');
    }

    throw new Error(error.message || 'Failed to call the Python service');
  }
};

module.exports = {
  extractTopicsFromSyllabus,
};
