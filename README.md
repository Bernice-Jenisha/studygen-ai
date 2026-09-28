# StudyGen AI — Intelligent Study Planner & Productivity Assistant

> **Production-Quality Full Stack Academic & Productivity Platform**  
> Built with React 19, TypeScript, Tailwind CSS, Node.js, Express.js, MongoDB-style Persistent Document Engine, and **Google Gemini 3.8 Flash**.

---

## 🌟 Overview

**StudyGen AI** is an intelligent academic planner and productivity assistant tailored for engineering students. It transforms exam dates, course credits, and daily schedules into personalized, scientifically optimized study plans using Google Gemini.

StudyGen AI combines a modern, Notion-like UI aesthetic with powerful AI generation tools: note summarizers, interactive flashcard decks, custom quizzes with timers and instant grading, a GitHub-style habit heatmap, and an in-app student marketplace powered by productivity reward coins.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies & Implementations |
|:---|:---|
| **Frontend UI** | **React 19**, TypeScript, Tailwind CSS v4, Lucide React, Motion animations, Web Audio API synthesis |
| **Backend API** | **Node.js**, **Express.js**, RESTful microservice controllers, Vite development middleware |
| **Artificial Intelligence** | **Google Gemini 3.8 Flash** (`@google/genai` TypeScript SDK) for study schedules, notes synthesis, quizzes, and productivity coaching |
| **Database Engine** | In-Memory & Persistent Document Store (`data/database.json`) supporting ACID-like atomic updates and collection indexing |
| **Security & Auth** | Bearer Token Session Management, Password Entropy Meter, AJAX Username Uniqueness Verification, Role-Based Access Control (Student / Admin) |
| **Data Pipelines** | XML & JSON Data Pipelines with client-side `DOMParser()`, live search, filter, and schema inspection |

---

## 🚀 Key Modules & Features

1. **Authentication & Session Security**
   - JWT-style Bearer authentication with Remember-Me support.
   - Live AJAX username availability check without page reload.
   - Interactive password strength entropy meter.
   - Password reset flow with 6-digit OTP verification.
   - Instant 1-Click "Demo Student" and "Demo Admin" role switchers for frictionless exploration.

2. **Student Dashboard**
   - Dynamic time-contextual greeting (`Good morning / afternoon / evening`).
   - 6 KPI metric cards: Today's Focus Hours, Weekly Hours, Pending Assignments, Tasks Completed, Productivity Score, and Study Streak.
   - Interactive SVG Daily Study Hours bar chart & Subject Focus distribution donut chart.
   - Priority task checklist and urgent assignment deadline warnings.

3. **AI Study Planner (Gemini 3.8 Flash)**
   - Inputs: Enrolled subjects, exam milestones, daily study bandwidth (1–10 hrs), difficulty level, and study strategy.
   - Outputs: Strategic synthesis, chronological daily timetable, high-yield revision tips, and Pomodoro break schedules.
   - **One-Click Sync:** Automatically exports generated schedule directly into the Smart Timetable.

4. **Smart Timetable**
   - 7-day weekly schedule grid (Monday to Sunday) from 08:00 to 20:00.
   - Color-coded subjects with room tags and lecture time blocks.
   - Full CRUD: add, view, and delete sessions with live calendar sync.

5. **Task Manager**
   - Real-time AJAX CRUD without page refresh.
   - Priority tags (High, Medium, Low) and category labels (Coursework, Exam Prep, DSA, Reading).
   - Task completion triggers Web Audio celebration chime, confetti, and awards **10 Productivity Coins**.

6. **Assignment Tracker**
   - Status tracking: `Pending`, `In Progress`, `Submitted`, `Graded`.
   - Automatic overdue warnings with highlighted alert banners.
   - Marks tracking and submission notes.

7. **Pomodoro Focus Timer**
   - 3 Modes: `25/5 Classic`, `50/10 Extended Focus`, and `90/20 Ultradian Rhythm`.
   - Web Audio synthesized gentle bell chimes at session start and completion.
   - Earns Productivity Coins upon completed focus blocks (+15 to +60 coins).
   - Session history log with timestamps and duration stats.

8. **AI Notes Assistant & Flashcard Deck**
   - Upload lecture files (`.txt`, `.md`, `.json`, `.csv`) or paste notes.
   - Gemini Generative AI creates:
     - Executive Concept Summary.
     - High-Yield Key Takeaways.
     - **Interactive 3D Flippable Flashcards** with Question and Answer recall.
     - Multiple-Choice Practice Questions with detailed explanations.

9. **AI Quiz Generator**
   - Subject selection (DBMS, Web Architecture, Networks, Algorithms, AI/ML).
   - Difficulty selection (Beginner, Intermediate, Advanced) and question count (3, 5, or 8 questions).
   - Live Countdown Timer, instant score percentage, comprehensive answer review, and attempt history tracker.

10. **Habit Tracker (GitHub-Style Heatmap)**
    - 28-day visual commit-style habit grid with progressive green intensity.
    - Streak calculations: Current Streak and Longest Streak.
    - Habit categories: Technical, Academics, Productivity, Health.

11. **Goal Tracker & Milestones**
    - Daily, Weekly, Monthly, and Semester academic targets.
    - Interactive increment/decrement sliders for real-time progress updates.
    - Unlocks milestone badges (e.g. *Focus Champion*, *Knowledge Master*, *Streak Starter*).

12. **AI Productivity Coach**
    - Analyzes student velocity: tasks completed, focus hours logged, streak consistency, and late assignments.
    - Computes an overall Productivity Health Score (0–100%).
    - Provides personalized strengths, bottleneck diagnosis, and actionable high-yield recommendations.

13. **Study Marketplace & Rewards Store**
    - Gamified economy: spend earned Productivity Coins on academic revision packs, notion templates, dark themes, and algorithm cheat sheets.
    - Instant coin deduction, automated invoice generation (`INV-YYYY-XXXX`), and order history ledger.

14. **AI Academic Tutor Chat**
    - Conversational tutoring powered by Gemini 3.8 Flash.
    - Quick prompt starters for complex engineering concepts (BCNF vs 3NF, TCP 3-Way Handshake, Dynamic Programming Knapsack).

15. **Developer Hub & System Architecture (`/src/pages/DeveloperHubView.tsx`)**
    - XML DOMParser Pipeline: interactive DOM node traversal for curriculum subjects and academic resources with live search and raw XML syntax viewer.
    - AJAX Real-Time Validation Sandbox: debounced username and email collision detection against backend API.
    - Automated Test Verification Matrix: 9 comprehensive test suites with live execution and real-time PASS verification.
    - RESTful API Reference with one-click **Postman Collection Export**.

16. **Administrative Console**
    - System health and real-time statistics (total users, tasks logged, focus hours, revenue coins).
    - User management with instant Student / Admin role toggling.
    - Student feedback inbox and one-click database reset.

---

## 🛠️ REST API Specification

| Method | Endpoint | Description | Auth |
|:---:|:---|:---|:---:|
| `GET` | `/api/health` | System health check and enabled capabilities | Public |
| `POST` | `/api/auth/register` | Student signup with 200 welcome coins bonus | Public |
| `POST` | `/api/auth/login` | Authentication & token dispatch | Public |
| `GET` | `/api/auth/check-username` | Real-time AJAX username availability check | Public |
| `POST` | `/api/auth/forgot-password` | Password recovery with OTP generation | Public |
| `GET` | `/api/tasks` | Retrieve user tasks sorted by priority and due date | Bearer |
| `POST` | `/api/tasks` | Create task with priority and tags | Bearer |
| `PUT` | `/api/tasks/:id` | Update task status and trigger reward coins | Bearer |
| `DELETE` | `/api/tasks/:id` | Remove task from user list | Bearer |
| `GET` | `/api/assignments` | List assignments with overdue status flags | Bearer |
| `POST` | `/api/pomodoro/sessions` | Record completed focus session & award coins | Bearer |
| `GET` | `/api/xml/subjects` | Stream XML subjects document with Content-Type application/xml | Public |
| `GET` | `/api/xml/resources` | Stream XML resources repository document | Public |
| `POST` | `/api/ai/study-plan` | Gemini 3.8 Flash personalized study schedule synthesis | Bearer |
| `POST` | `/api/ai/summarize` | Gemini notes executive summary & flashcards generation | Bearer |
| `POST` | `/api/ai/quiz` | Gemini academic quiz generation with timer & explanations | Bearer |
| `POST` | `/api/ai/coach` | Gemini productivity health evaluation & recommendations | Bearer |
| `POST` | `/api/ai/chat` | Gemini interactive study tutor conversation | Bearer |
| `POST` | `/api/marketplace/checkout` | Purchase resources and deduct productivity coins | Bearer |
| `GET` | `/api/admin/analytics` | Administrative dashboard metrics and usage analytics | Admin |

---

## 💻 Local Development Setup

1. **Clone and Install Dependencies:**
   ```bash
   git clone <repo-url>
   cd studygen-ai
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

3. **Run the Full Stack Application:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build:**
   ```bash
   npm run build
   npm run preview
   ```
