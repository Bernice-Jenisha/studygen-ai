export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  coins: number;
  streak: number;
  createdAt?: string;
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

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
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
  completedDates: string[];
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

export interface AIStudyPlan {
  summary: string;
  weeklyHours: number;
  priorityAnalysis: string;
  dailySchedule: Array<{
    time: string;
    activity: string;
    subject: string;
    focus: 'High' | 'Medium' | 'Low';
  }>;
  revisionTips: string[];
  breakSchedule: string;
}

export interface AICoachFeedback {
  overallScore: number;
  strengths: string[];
  bottlenecks: string[];
  recommendations: Array<{
    title: string;
    action: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  motivationalQuote: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface XMLSubjectItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  faculty: string;
  studyHoursPerWeek: number;
  difficulty: string;
  description: string;
  topics: string[];
}

export interface XMLResourceItem {
  id: string;
  title: string;
  category: string;
  format: string;
  fileSize: string;
  author: string;
  rating: number;
  downloads: number;
  accessLevel: string;
  url: string;
}
