import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain/hash for authentication demo
  role: 'student' | 'admin';
  coins: number;
  streak: number;
  lastActiveDate: string;
  avatar?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  label: string;
  estimatedMinutes?: number;
  createdAt: string;
}

export interface Assignment {
  id: string;
  userId: string;
  title: string;
  subject: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'submitted' | 'graded';
  marks?: string;
  notes?: string;
  createdAt: string;
}

export interface TimetableSession {
  id: string;
  userId: string;
  title: string;
  subject: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  color: string;
  room?: string;
}

export interface StudyNote {
  id: string;
  userId: string;
  title: string;
  subject: string;
  originalContent: string;
  summary: string;
  keyPoints: string[];
  flashcards: Array<{ question: string; answer: string }>;
  mcqs: Array<{ question: string; options: string[]; answerIndex: number; explanation: string }>;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  date: string;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  mode: string;
  durationMinutes: number;
  subject: string;
  coinsEarned: number;
  completedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'semester';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  completed: boolean;
  badge?: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  category: string;
  completedDates: string[]; // YYYY-MM-DD
  currentStreak: number;
  longestStreak: number;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  category: string;
  priceCoins: number;
  description: string;
  rating: number;
  downloads: number;
  badge?: string;
}

export interface MarketplaceOrder {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  coinsPaid: number;
  invoiceNumber: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  message: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  tasks: Task[];
  assignments: Assignment[];
  timetable: TimetableSession[];
  notes: StudyNote[];
  quizAttempts: QuizAttempt[];
  pomodoroSessions: PomodoroSession[];
  goals: Goal[];
  habits: Habit[];
  products: MarketplaceProduct[];
  orders: MarketplaceOrder[];
  chatMessages: ChatMessage[];
  feedback: Feedback[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'database.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'usr_student_01',
      name: 'Jenisha',
      email: 'student@studygen.ai',
      passwordHash: 'study123',
      role: 'student',
      coins: 450,
      streak: 7,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr_admin_01',
      name: 'Prof. K. Ram(Admin)',
      email: 'admin@studygen.ai',
      passwordHash: 'admin123',
      role: 'admin',
      coins: 9999,
      streak: 30,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: '2026-08-15T08:00:00Z',
    },
  ],
  tasks: [
    {
      id: 'tsk_1',
      userId: 'usr_student_01',
      title: 'Complete Distributed Systems XML Data Pipeline',
      description: 'Implement DOMParser pipeline and render in styled interactive data table.',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2026-09-30',
      label: 'Coursework',
      estimatedMinutes: 60,
      createdAt: '2026-09-25T10:00:00Z',
    },
    {
      id: 'tsk_2',
      userId: 'usr_student_01',
      title: 'Revise DBMS Normalization 1NF to BCNF',
      description: 'Review functional dependency closures and lossless join decomposition.',
      priority: 'high',
      status: 'todo',
      dueDate: '2026-10-02',
      label: 'Exam Prep',
      estimatedMinutes: 90,
      createdAt: '2026-09-26T11:00:00Z',
    },
    {
      id: 'tsk_3',
      userId: 'usr_student_01',
      title: 'Solve 3 LeetCode Dynamic Programming problems',
      description: '0/1 Knapsack, Coin Change, and Longest Common Subsequence.',
      priority: 'medium',
      status: 'completed',
      dueDate: '2026-09-27',
      label: 'DSA',
      estimatedMinutes: 75,
      createdAt: '2026-09-24T09:00:00Z',
    },
    {
      id: 'tsk_4',
      userId: 'usr_student_01',
      title: 'Read Computer Networks TCP Flow Control Chapter',
      description: 'Sliding window protocol, Congestion Avoidance algorithms.',
      priority: 'low',
      status: 'todo',
      dueDate: '2026-10-05',
      label: 'Reading',
      estimatedMinutes: 45,
      createdAt: '2026-09-27T14:00:00Z',
    },
  ],
  assignments: [
    {
      id: 'asg_1',
      userId: 'usr_student_01',
      title: 'Full Stack Cloud Web Architecture Project Report',
      subject: 'Web Technologies & Systems',
      deadline: '2026-10-04T23:59:00Z',
      priority: 'high',
      status: 'in_progress',
      marks: 'Pending Evaluation',
      notes: 'Include architecture diagrams, API benchmarks, and JWT session handling.',
      createdAt: '2026-09-20T08:00:00Z',
    },
    {
      id: 'asg_2',
      userId: 'usr_student_01',
      title: 'Relational Database Schema Design for Healthcare ERP',
      subject: 'Database Management Systems',
      deadline: '2026-10-01T17:00:00Z',
      priority: 'medium',
      status: 'pending',
      marks: 'Not Submitted',
      notes: 'Needs ER diagram and DDL script with foreign keys.',
      createdAt: '2026-09-22T09:30:00Z',
    },
    {
      id: 'asg_3',
      userId: 'usr_student_01',
      title: 'Socket Programming Client-Server Chat in C',
      subject: 'Computer Networks',
      deadline: '2026-09-25T17:00:00Z', // Late
      priority: 'high',
      status: 'submitted',
      marks: '94/100',
      notes: 'Submitted via university course portal.',
      createdAt: '2026-09-18T10:00:00Z',
    },
  ],
  timetable: [
    { id: 'tt_1', userId: 'usr_student_01', title: 'Web Architecture Workshop', subject: 'Web Technologies', dayOfWeek: 1, startTime: '09:00', endTime: '11:00', color: '#6366F1', room: 'Hall 304' },
    { id: 'tt_2', userId: 'usr_student_01', title: 'DBMS Relational Algebra', subject: 'DBMS', dayOfWeek: 1, startTime: '11:30', endTime: '13:00', color: '#3B82F6', room: 'Hall B' },
    { id: 'tt_3', userId: 'usr_student_01', title: 'Deep Work & Coding', subject: 'Self Study', dayOfWeek: 1, startTime: '15:00', endTime: '17:00', color: '#10B981', room: 'Library' },
    { id: 'tt_4', userId: 'usr_student_01', title: 'Computer Networks Lecture', subject: 'Networks', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', color: '#EC4899', room: 'Hall A' },
    { id: 'tt_5', userId: 'usr_student_01', title: 'AI & Machine Learning Seminar', subject: 'AI/ML', dayOfWeek: 3, startTime: '14:00', endTime: '16:00', color: '#8B5CF6', room: 'Seminar Hall' },
    { id: 'tt_6', userId: 'usr_student_01', title: 'Algorithms Problem Solving', subject: 'DAA', dayOfWeek: 4, startTime: '09:30', endTime: '11:30', color: '#F59E0B', room: 'Hall C' },
    { id: 'tt_7', userId: 'usr_student_01', title: 'Pomodoro Focus Session', subject: 'Revision', dayOfWeek: 5, startTime: '16:00', endTime: '18:00', color: '#06B6D4', room: 'Study Desk' },
  ],
  notes: [
    {
      id: 'note_1',
      userId: 'usr_student_01',
      title: 'Database Normalization Master Summary',
      subject: 'DBMS',
      originalContent: 'Normalization is the process of organizing relational database tables to reduce redundancy and improve data integrity. 1NF requires atomic values. 2NF removes partial functional dependencies on candidate keys. 3NF eliminates transitive dependencies. Boyce-Codd Normal Form (BCNF) requires that for every functional dependency X -> Y, X must be a superkey.',
      summary: 'Normalization systematically eliminates data anomalies (insertion, update, deletion) by decomposing relations. Key milestones include 1NF (atomic attributes), 2NF (no partial dependency), 3NF (no transitive dependency), and BCNF (strictly superkey determinants).',
      keyPoints: [
        'Anomalies avoided: Insertion, Deletion, and Modification.',
        '1NF: Every cell holds an atomic, indivisible value.',
        '2NF: Must be in 1NF and no non-prime attribute depends on a proper subset of candidate key.',
        '3NF: Must be in 2NF and no non-prime attribute depends transitively on candidate key.',
        'BCNF: For every dependency X -> Y, X must be a super key.',
      ],
      flashcards: [
        { question: 'What is the primary condition for 2NF?', answer: 'The table must be in 1NF and contain no partial functional dependencies on any candidate key.' },
        { question: 'How does BCNF differ from 3NF?', answer: 'BCNF is stricter: every functional dependency X -> Y must have X as a super key, even if Y is a prime attribute.' },
        { question: 'What is a transitive dependency?', answer: 'When functional dependency A -> B and B -> C exists, causing A -> C indirectly.' },
      ],
      mcqs: [
        {
          question: 'If a relation has functional dependency X -> Y and X is NOT a super key, it violates:',
          options: ['1NF', '2NF', 'BCNF', '4NF'],
          answerIndex: 2,
          explanation: 'BCNF strictly requires every determinant X in X -> Y to be a super key.',
        },
      ],
      createdAt: '2026-09-24T14:30:00Z',
    },
  ],
  quizAttempts: [
    {
      id: 'qa_1',
      userId: 'usr_student_01',
      userName: 'Jenisha',
      subject: 'Database Management Systems',
      difficulty: 'Intermediate',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      timeSpentSeconds: 145,
      date: '2026-09-26T16:20:00Z',
    },
    {
      id: 'qa_2',
      userId: 'usr_student_02',
      userName: 'Sneha Patel',
      subject: 'Computer Networks',
      difficulty: 'Advanced',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      timeSpentSeconds: 180,
      date: '2026-09-27T10:15:00Z',
    },
    {
      id: 'qa_3',
      userId: 'usr_student_03',
      userName: 'Rahul Nair',
      subject: 'Web Technologies',
      difficulty: 'Intermediate',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      timeSpentSeconds: 120,
      date: '2026-09-27T18:40:00Z',
    },
  ],
  pomodoroSessions: [
    { id: 'pomo_1', userId: 'usr_student_01', mode: '25/5 Classic', durationMinutes: 25, subject: 'Web Technologies', coinsEarned: 15, completedAt: '2026-09-27T14:00:00Z' },
    { id: 'pomo_2', userId: 'usr_student_01', mode: '50/10 Extended', durationMinutes: 50, subject: 'DBMS', coinsEarned: 35, completedAt: '2026-09-27T16:00:00Z' },
    { id: 'pomo_3', userId: 'usr_student_01', mode: '25/5 Classic', durationMinutes: 25, subject: 'Algorithms', coinsEarned: 15, completedAt: '2026-09-28T09:00:00Z' },
  ],
  goals: [
    { id: 'gl_1', userId: 'usr_student_01', title: 'Weekly Study Target', type: 'weekly', targetValue: 20, currentValue: 14.5, unit: 'hours', deadline: '2026-10-04', completed: false, badge: 'Focus Champion' },
    { id: 'gl_2', userId: 'usr_student_01', title: 'Master Core Engineering Modules', type: 'semester', targetValue: 10, currentValue: 7, unit: 'modules', deadline: '2026-10-15', completed: false, badge: 'Knowledge Master' },
    { id: 'gl_3', userId: 'usr_student_01', title: 'Daily Pomodoro Milestone', type: 'daily', targetValue: 4, currentValue: 4, unit: 'sessions', deadline: '2026-09-28', completed: true, badge: 'Streak Starter' },
  ],
  habits: [
    {
      id: 'hb_1',
      userId: 'usr_student_01',
      name: 'Coding & LeetCode Practice',
      category: 'Technical',
      completedDates: ['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28'],
      currentStreak: 7,
      longestStreak: 14,
    },
    {
      id: 'hb_2',
      userId: 'usr_student_01',
      name: 'Deep Reading / Textbooks',
      category: 'Academics',
      completedDates: ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-28'],
      currentStreak: 3,
      longestStreak: 8,
    },
    {
      id: 'hb_3',
      userId: 'usr_student_01',
      name: 'Pomodoro Deep Focus Blocks',
      category: 'Productivity',
      completedDates: ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28'],
      currentStreak: 8,
      longestStreak: 12,
    },
  ],
  products: [
    {
      id: 'prod_1',
      title: 'Ultimate Semester Exam Revision Pack',
      category: 'Revision Guides',
      priceCoins: 120,
      description: 'Comprehensive chapter formula sheets, quick definitions, and key algorithms for CSE 6th Semester.',
      rating: 4.9,
      downloads: 382,
      badge: 'Best Seller',
    },
    {
      id: 'prod_2',
      title: 'Minimalist Notion Academic Workspace Template',
      category: 'Templates',
      priceCoins: 90,
      description: 'A pre-configured Notion template with exam trackers, lecture note databases, and assignment Gantt charts.',
      rating: 4.8,
      downloads: 245,
      badge: 'Staff Pick',
    },
    {
      id: 'prod_3',
      title: 'Cyberpunk Focus Pomodoro Dark Theme',
      category: 'Themes',
      priceCoins: 50,
      description: 'Custom neon indigo UI skin with focused soundscapes and high-contrast OLED night mode.',
      rating: 4.7,
      downloads: 512,
    },
    {
      id: 'prod_4',
      title: '150+ Top DSA Dynamic Programming Flashcards',
      category: 'Flashcard Packs',
      priceCoins: 75,
      description: 'Spaced repetition flashcard deck covering recurrence formulas, state spaces, and edge cases.',
      rating: 5.0,
      downloads: 620,
      badge: 'Hot',
    },
    {
      id: 'prod_5',
      title: 'Full Stack Scalable Architecture Blueprints',
      category: 'Templates',
      priceCoins: 110,
      description: 'Complete architecture diagrams, Postman collections, and security validation schemas.',
      rating: 4.9,
      downloads: 198,
    },
  ],
  orders: [
    {
      id: 'ord_1',
      userId: 'usr_student_01',
      productId: 'prod_4',
      productTitle: '150+ Top DSA Dynamic Programming Flashcards',
      coinsPaid: 75,
      invoiceNumber: 'INV-2026-0042',
      createdAt: '2026-09-26T12:00:00Z',
    },
  ],
  chatMessages: [
    {
      id: 'msg_1',
      userId: 'usr_student_01',
      role: 'user',
      content: 'Can you explain the difference between 3NF and BCNF with a simple example?',
      timestamp: '2026-09-27T11:00:00Z',
    },
    {
      id: 'msg_2',
      userId: 'usr_student_01',
      role: 'assistant',
      content: 'In 3NF, for any functional dependency X -> Y, either X is a superkey OR Y is a prime attribute (part of any candidate key).\n\nIn BCNF, the exception for prime attributes is removed: X must ALWAYS be a superkey without exception. For example, if a table has (Student, Subject, Teacher) where Teacher -> Subject, but (Student, Subject) is the primary key, it is in 3NF (since Subject is prime) but violates BCNF because Teacher alone is not a superkey.',
      timestamp: '2026-09-27T11:00:15Z',
    },
  ],
  feedback: [
    {
      id: 'fb_1',
      userId: 'usr_student_01',
      userName: 'Jenisha',
      rating: 5,
      message: 'The AI study planner and Pomodoro coin incentives have significantly improved my study habits before semester exams!',
      createdAt: '2026-09-27T19:00:00Z',
    },
  ],
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, falling back to seed data:', err);
    }
    // Save initial data
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public update<K extends keyof DatabaseSchema>(collection: K, updater: (items: DatabaseSchema[K]) => DatabaseSchema[K]) {
    this.data[collection] = updater(this.data[collection]);
    this.saveData(this.data);
    return this.data[collection];
  }

  public resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveData(this.data);
    return this.data;
  }
}

export const db = new DatabaseManager();
