# 🎓 Private Courses Platform API

A REST API for a private courses website, built with **Node.js**, **Express**, and **MongoDB**. Instructors create courses, lessons, and quizzes and enroll their students. Students follow their courses, complete lessons, and build learning streaks.

---

## ✨ Features

- **Role-based access**
  - `instructor`: creates and manages courses, lessons, quizzes, and enrollments
  - `student`: views enrolled courses and completes lessons and quizzes
  - `admin`: mange the platform
- **Courses & Lessons**
  - Full CRUD for courses, with lessons organized under each course
- **Quizzes**
  - Quizzes attached to [courses / lessons]
- **Enrollment system**
  - Private by design: students can't self-enroll, the instructor enrolls them
  - Enrollments are nested under courses: `/courses/:courseId/enrollments`
- **Lesson progress**
  - Students mark lessons as completed or not completed
- **Learning streaks**
  - Each user has a streak record: `currentStreak`, `longestStreak`, and `lastActiveDay`
  - The streak updates automatically when a student completes a lesson
- **Authentication & validation**
  - [JWT authentication], protected routes, and request validation

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | [JSON Web Tokens, bcrypt] |

---


## 📁 Project Structure

The project follows an MVC-style architecture:

```
├── routes/         # API route definitions
├── services/       # Business logic (enrollment, lesson completion, streaks, ...)
├── models/         # Mongoose schemas
├── middleware/     # Auth, role checks, error handling
├── utils/          # Helpers and validators
├── config/         # Database connection
└── server.js       # App entry point
```

---

### Run the app

```bash
# Development
npm run start


---

## 🔐 Authentication

Protected routes need a token in the request header:

