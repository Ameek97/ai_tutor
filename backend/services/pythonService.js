const axios = require('axios');

const getPythonServiceUrl = () => {
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL;

  if (!pythonServiceUrl) {
    throw new Error('PYTHON_SERVICE_URL is missing from environment variables');
  }

  return pythonServiceUrl.replace(/\/$/, '');
};

const pythonRequest = async ({ method, path, data, timeout }) => {
  return axios({
    method,
    url: `${getPythonServiceUrl()}${path}`,
    data,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout,
  });
};

module.exports = {
  getPythonServiceUrl,
  pythonRequest,
};
