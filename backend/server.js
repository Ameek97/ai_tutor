require('dotenv').config();
const dns = require('dns'); 
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studyMaterialRoutes = require('./routes/studyMaterialRoutes');
const syllabusRoutes = require('./routes/syllabusRoutes');
const topicRoutes = require('./routes/topicRoutes');
const studyRoutes = require('./routes/studyRoutes');

dns.setServers(["1.1.1.1","8.8.8.8"]);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'AI Educational Teacher API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/syllabi', syllabusRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/study', studyRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from environment variables');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
