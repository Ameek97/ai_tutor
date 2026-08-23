# CoursePilot

An AI-powered educational platform designed to help university students study from their own course curriculum and learning materials.

Students can create courses, upload syllabi and study materials, automatically extract the course structure into chapters and topics, and interact with an AI tutor that answers questions using the student's course-specific learning material.

---

## Overview

The platform combines a traditional educational management system with an AI-powered RAG pipeline.

A student can:

* Create and manage university courses
* Upload a course syllabus
* Automatically extract chapters and topics from the syllabus
* Track topic completion
* Upload lecture notes, slides, textbooks, and other study materials
* Process study materials into searchable knowledge
* Ask questions to an AI tutor within a specific course
* Get answers grounded in the uploaded course material

The system keeps **course structure** and **study content** separate.

```text
Course
│
├── Syllabus
│     ↓
│   Chapters
│     └── Topics
│
└── Study Materials
      ↓
    PDF Processing
      ↓
    Chunking
      ↓
    Embeddings
      ↓
    Qdrant
      ↓
    AI Tutor
```

---

## Features

### Authentication

* User signup and login
* Password hashing with bcrypt
* JWT-based authentication
* Protected API routes
* Persistent authentication using JWT
* User-specific course and study material access

### Course Management

* Create courses
* View courses
* Delete courses
* Course-specific pages
* Ownership validation

### Syllabus Processing

Students can upload a syllabus PDF for a course.

The system:

```text
Syllabus PDF
    ↓
Cloudinary
    ↓
FastAPI
    ↓
PyPDFLoader
    ↓
Page-aware text
    ↓
LLM
    ↓
Chapters + Topics
    ↓
MongoDB
```

The LLM identifies the hierarchy:

```text
Chapter
├── Topic
├── Topic
└── Topic
```

MongoDB then creates the actual relationships between chapters and topics.

### Study Materials

Students can upload:

* Lecture notes
* Lecture slides
* Textbooks
* Course PDFs
* Other educational documents

Files are stored in Cloudinary while MongoDB stores their metadata and references.

### AI Tutor

The AI tutor is designed to answer questions using course-specific study material.

The intended RAG pipeline is:

```text
Student Question
       ↓
Question Embedding
       ↓
Qdrant Similarity Search
       ↓
Course-specific Retrieval
       ↓
Relevant Study Material Chunks
       ↓
LLM
       ↓
Grounded Answer
```

This allows the tutor to answer questions using the student's uploaded course material rather than relying only on general model knowledge.

### Topic Progress

Topics can be individually marked as completed.

This provides the foundation for future:

* Course progress
* Weak-topic detection
* Personalized recommendations
* Study analytics

---

# Tech Stack

## Frontend

* React
* JavaScript
* JSX
* React Router
* Redux Toolkit
* CSS

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Multer
* Cloudinary

## AI / Processing

* Python
* FastAPI
* PyPDFLoader
* LLM API
* Pydantic

## Vector Search

* Qdrant
* Embeddings
* Retrieval-Augmented Generation (RAG)

---

# Architecture

The application consists of a React frontend, Node/Express backend, and Python/FastAPI AI processing service.

```text
                    ┌─────────────────┐
                    │     React       │
                    │    Frontend     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Node / Express  │
                    │    Backend      │
                    └───────┬─────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
          ┌──────────┐ ┌──────────┐ ┌──────────┐
          │ MongoDB  │ │Cloudinary│ │ FastAPI  │
          │          │ │          │ │ Python   │
          └──────────┘ └──────────┘ └────┬─────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ PDF / LLM    │
                                  │ Processing   │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │    Qdrant    │
                                  │ Vector Store │
                                  └──────────────┘
```

---

# Project Structure

```text
ai-educational-teacher/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── python/
│   ├── server.py
│   ├── main.py
│   ├── extract_topics.py
│   ├── llm_service.py
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

---

# Database Design

## User

```text
User
├── _id
├── name
├── email
├── password
├── createdAt
└── updatedAt
```

## Course

```text
Course
├── _id
├── user_id
├── name
├── createdAt
└── updatedAt
```

## Syllabus

A syllabus belongs to a course and contains the uploaded syllabus document.

```text
Syllabus
├── _id
├── user_id
├── course_id
├── fileName
├── fileUrl
├── cloudinaryPublicId
├── createdAt
└── updatedAt
```

## Chapter

Chapters represent the major units/modules extracted from the syllabus.

```text
Chapter
├── _id
├── course_id
├── name
├── order
├── createdAt
└── updatedAt
```

## Topic

Topics belong to a chapter.

```text
Topic
├── _id
├── course_id
├── chapter_id
├── name
├── order
├── completed
├── createdAt
└── updatedAt
```

The relationship is:

```text
Course
  │
  └── Chapter
        │
        ├── Topic
        ├── Topic
        └── Topic
```

## Study Material

```text
StudyMaterial
├── _id
├── user_id
├── course_id
├── fileName
├── fileUrl
├── cloudinaryPublicId
├── createdAt
└── updatedAt
```

---

# Syllabus → Chapter → Topic Pipeline

The syllabus processing service uses FastAPI.

Node sends only the information required by the Python service:

```json
{
  "document_id": "...",
  "course_id": "...",
  "pdf_url": "..."
}
```

FastAPI downloads the PDF and processes it page-by-page.

PyPDFLoader provides page-level documents.

Before sending the content to the LLM, explicit page markers are added:

```text
--- PAGE 1 ---

Introduction to Database Systems...

--- PAGE 2 ---

Relational Model...

--- PAGE 3 ---

SQL...
```

This allows the LLM to understand the actual document boundaries.

The LLM returns structured data:

```json
{
  "chapters": [
    {
      "name": "Relational Model",
      "order": 1,
      "topics": [
        {
          "name": "Relations",
          "order": 1
        },
        {
          "name": "Keys",
          "order": 2
        }
      ]
    }
  ]
}
```

The LLM does not generate MongoDB IDs.

Node creates the chapter first:

```text
LLM Chapter
    ↓
MongoDB Chapter.create()
    ↓
MongoDB generates _id
```

Then topics are created using that chapter ID:

```text
Topic
└── chapter_id → Chapter._id
```

This preserves a proper relational hierarchy inside MongoDB.

---

# Study Material → RAG Pipeline

Study materials follow a different pipeline from the syllabus.

```text
Study Material PDF
       ↓
Cloudinary
       ↓
MongoDB metadata
       ↓
PDF extraction
       ↓
Text chunks
       ↓
Embeddings
       ↓
Qdrant
```

Each vector can contain metadata such as:

```json
{
  "userId": "...",
  "courseId": "...",
  "documentId": "...",
  "chunkIndex": 12
}
```

The metadata allows retrieval to be restricted to the currently selected course and user's documents.

---

# AI Tutor

When a student asks a question:

```text
"What is normalization?"
```

the backend uses the selected course as the retrieval boundary.

```text
Question
   ↓
Embedding
   ↓
Qdrant
   ↓
Filter by course
   ↓
Retrieve relevant chunks
   ↓
LLM
   ↓
Answer
```

This creates a course-aware AI tutor rather than a generic chatbot.

---

# API Overview

## Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

## Courses

```text
POST   /api/courses
GET    /api/courses
GET    /api/courses/:courseId
DELETE /api/courses/:courseId
```

## Study Materials

```text
POST   /api/study-materials
GET    /api/study-materials/:courseId
DELETE /api/study-materials/:id
```

## Topics

```text
GET /api/courses/:courseId/topics
```

## Python AI Service

```text
POST /extract-topics
```

The Node backend communicates with the Python service using:

```text
PYTHON_SERVICE_URL
```

rather than a hardcoded service URL.

---

# Authentication Flow

```text
User Login
    ↓
Node verifies credentials
    ↓
JWT generated
    ↓
Frontend stores JWT
    ↓
Authenticated API request
    ↓
authMiddleware
    ↓
req.user.id
```

The frontend never sends a `userId` to identify the current user.

The backend obtains the authenticated user's ID from the JWT.

Ownership is checked before accessing:

* Courses
* Syllabi
* Study Materials
* Course-specific data

---

# File Upload Architecture

Multer handles the incoming multipart/form-data request.

```text
React
   ↓
multipart/form-data
   ↓
Multer
   ↓
req.file
   ↓
Cloudinary
   ↓
secure_url + public_id
   ↓
MongoDB metadata
```

Multer is only responsible for handling the HTTP file upload.

Cloudinary is responsible for persistent file storage.

MongoDB stores the file metadata and Cloudinary reference.

---

# Environment Variables

## Node

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

PYTHON_SERVICE_URL=http://localhost:8000
```

## Python

Create the required Python environment variables according to the LLM provider being used.

Never commit API keys or secrets to Git.

Use `.env.example` files to document required variables without exposing credentials.

---

# Running Locally

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd ai-educational-teacher
```

## 2. Start MongoDB

Make sure MongoDB is available and configure:

```env
MONGO_URI=...
```

## 3. Start the Python service

Navigate to the Python directory:

```bash
cd python
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

The Python service will be available at:

```text
http://localhost:8000
```

## 4. Start the Node backend

Open another terminal:

```bash
cd backend
npm install
npm run dev
```

The backend runs on the configured Node port.

Make sure:

```env
PYTHON_SERVICE_URL=http://localhost:8000
```

is configured in the backend environment.

## 5. Start the React frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by the frontend development server.

---

# Development Flow

The main application flow is:

```text
User
 ↓
React
 ↓
Node / Express
 ↓
MongoDB
```

For syllabus analysis:

```text
React
 ↓
Node
 ↓
FastAPI
 ↓
PyPDFLoader
 ↓
LLM
 ↓
Node
 ↓
MongoDB
```

For study-material RAG:

```text
React
 ↓
Node
 ↓
Cloudinary
 ↓
PDF Processing
 ↓
Embeddings
 ↓
Qdrant
 ↓
LLM
 ↓
React
```

---

# Design Principles

The project intentionally keeps the architecture relatively simple.

### JavaScript

The frontend and Node backend use JavaScript rather than TypeScript.

### Separation of responsibilities

Node handles:

* Authentication
* Users
* Courses
* MongoDB
* File metadata
* Application APIs

Python handles:

* PDF processing
* LLM-based syllabus analysis
* AI-related processing

Qdrant handles:

* Vector embeddings
* Similarity search

Cloudinary handles:

* Persistent PDF storage

### Course-level isolation

AI retrieval is scoped to the selected course so that study material from unrelated courses is not accidentally used when answering a question.

### Incremental development

The project is designed to add AI functionality incrementally rather than introducing unnecessary infrastructure at the beginning.

---

# Future Improvements

Potential future features include:

* More detailed course progress analytics
* Quiz and MCQ generation
* Flashcards
* Weak-topic detection
* Personalized study recommendations
* AI-generated study plans
* Conversation history
* Redis-based caching
* Background PDF-processing jobs
* Rate limiting
* Improved document management
* Multiple syllabus versions
* More advanced agentic AI workflows

---

# Project Status

```text
Authentication                  ✅
Course Management               ✅
Course Detail                   ✅
Syllabus Upload                 ✅
Syllabus Topic Extraction       ✅
Chapter / Topic Hierarchy       ✅
Study Material Upload           ✅
Cloudinary Storage              ✅
PDF Processing                  ✅
LLM Integration                 ✅
RAG Pipeline                    ✅
Qdrant Vector Search            ✅
AI Tutor                        ✅
Topic Progress                  ✅
```

---

## License

This project is intended as an educational and portfolio project.
