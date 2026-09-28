import {
  User,
  Task,
  Assignment,
  TimetableSession,
  StudyNote,
  QuizAttempt,
  PomodoroSession,
  Goal,
  Habit,
  MarketplaceProduct,
  MarketplaceOrder,
  AIStudyPlan,
  AICoachFeedback,
  XMLSubjectItem,
  XMLResourceItem,
} from '../types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('studygen_token') || 'usr_student_01';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // Auth
  async checkUsername(username: string): Promise<{ available: boolean; message: string }> {
    const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; role?: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(data: { email: string; password: string; rememberMe?: boolean }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send OTP');
    }
    return res.json();
  },

  async verifyOtp(email: string, otp: string) {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'OTP verification failed');
    }
    return res.json();
  },

  async resetPassword(email: string, newPassword: string) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Password reset failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
    return res.json();
  },

  // Tasks
  async getTasks(): Promise<{ tasks: Task[] }> {
    const res = await fetch('/api/tasks', { headers: getAuthHeaders() });
    return res.json();
  },

  async createTask(task: Partial<Task>): Promise<{ task: Task }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(task)
    });
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<{ task: Task }> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Assignments
  async getAssignments(): Promise<{ assignments: Assignment[] }> {
    const res = await fetch('/api/assignments', { headers: getAuthHeaders() });
    return res.json();
  },

  async createAssignment(assignment: Partial<Assignment>): Promise<{ assignment: Assignment }> {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignment)
    });
    return res.json();
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<{ assignment: Assignment }> {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteAssignment(id: string) {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Timetable
  async getTimetable(): Promise<{ timetable: TimetableSession[] }> {
    const res = await fetch('/api/timetable', { headers: getAuthHeaders() });
    return res.json();
  },

  async createTimetableSession(session: Partial<TimetableSession>): Promise<{ session: TimetableSession }> {
    const res = await fetch('/api/timetable', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(session)
    });
    return res.json();
  },

  async deleteTimetableSession(id: string) {
    const res = await fetch(`/api/timetable/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async importTimetableSchedule(sessions: any[]) {
    const res = await fetch('/api/timetable/bulk-import', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessions })
    });
    return res.json();
  },

  // Pomodoro
  async getPomodoroStats(): Promise<{ sessions: PomodoroSession[]; totalMinutes: number; totalSessions: number }> {
    const res = await fetch('/api/pomodoro', { headers: getAuthHeaders() });
    return res.json();
  },

  async logPomodoroSession(data: { mode: string; durationMinutes: number; subject: string }) {
    const res = await fetch('/api/pomodoro', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Notes
  async getNotes(): Promise<{ notes: StudyNote[] }> {
    const res = await fetch('/api/notes', { headers: getAuthHeaders() });
    return res.json();
  },

  async createNote(note: Partial<StudyNote>): Promise<{ note: StudyNote }> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(note)
    });
    return res.json();
  },

  async deleteNote(id: string) {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Quizzes
  async getQuizzes(): Promise<{ leaderboard: QuizAttempt[]; allAttempts: QuizAttempt[] }> {
    const res = await fetch('/api/quizzes', { headers: getAuthHeaders() });
    return res.json();
  },

  async submitQuiz(data: {
    subject: string;
    difficulty: string;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
  }) {
    const res = await fetch('/api/quizzes/submit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Goals
  async getGoals(): Promise<{ goals: Goal[] }> {
    const res = await fetch('/api/goals', { headers: getAuthHeaders() });
    return res.json();
  },

  async createGoal(goal: Partial<Goal>): Promise<{ goal: Goal }> {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(goal)
    });
    return res.json();
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<{ goal: Goal }> {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteGoal(id: string) {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Habits
  async getHabits(): Promise<{ habits: Habit[] }> {
    const res = await fetch('/api/habits', { headers: getAuthHeaders() });
    return res.json();
  },

  async createHabit(name: string, category: string): Promise<{ habit: Habit }> {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, category })
    });
    return res.json();
  },

  async toggleHabitDate(id: string, date: string): Promise<{ habit: Habit }> {
    const res = await fetch(`/api/habits/${id}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date })
    });
    return res.json();
  },

  // Marketplace
  async getMarketplaceProducts(): Promise<{ products: MarketplaceProduct[] }> {
    const res = await fetch('/api/marketplace/products', { headers: getAuthHeaders() });
    return res.json();
  },

  async getMarketplaceOrders(): Promise<{ orders: MarketplaceOrder[] }> {
    const res = await fetch('/api/marketplace/orders', { headers: getAuthHeaders() });
    return res.json();
  },

  async checkoutProduct(productId: string): Promise<{ success: boolean; order: MarketplaceOrder; remainingCoins: number; message: string }> {
    const res = await fetch('/api/marketplace/checkout', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Checkout failed');
    }
    return res.json();
  },

  // AI features
  async generateStudyPlan(data: {
    subjects: string[];
    upcomingExams: string;
    dailyHours: number;
    difficulty: string;
    priority: string;
  }): Promise<{ plan: AIStudyPlan }> {
    const res = await fetch('/api/ai/study-plan', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate plan');
    }
    return res.json();
  },

  async summarizeNotes(data: {
    content: string;
    subject?: string;
    title?: string;
  }): Promise<{
    summary: string;
    keyPoints: string[];
    flashcards: Array<{ question: string; answer: string }>;
    mcqs: Array<{ question: string; options: string[]; answerIndex: number; explanation: string }>;
  }> {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to summarize');
    }
    return res.json();
  },

  async generateQuiz(data: {
    subject: string;
    difficulty: string;
    numQuestions: number;
    notesContent?: string;
  }): Promise<{ quiz: { title: string; subject: string; difficulty: string; questions: any[] } }> {
    const res = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate quiz');
    }
    return res.json();
  },

  async getAICoachAnalysis(): Promise<{ coach: AICoachFeedback }> {
    const res = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    return res.json();
  },

  async sendChatMessage(message: string, history: Array<{ role: string; content: string }>): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, history })
    });
    return res.json();
  },

  // XML Data Pipeline
  async fetchSubjectsXML(): Promise<{ rawXml: string; parsed: XMLSubjectItem[] }> {
    const res = await fetch('/api/xml/subjects');
    const rawXml = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawXml, 'application/xml');

    const subjects: XMLSubjectItem[] = [];
    const nodes = xmlDoc.getElementsByTagName('subject');
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const id = node.getAttribute('id') || '';
      const code = node.getElementsByTagName('code')[0]?.textContent || '';
      const name = node.getElementsByTagName('name')[0]?.textContent || '';
      const credits = Number(node.getElementsByTagName('credits')[0]?.textContent || '0');
      const faculty = node.getElementsByTagName('faculty')[0]?.textContent || '';
      const studyHoursPerWeek = Number(node.getElementsByTagName('studyHoursPerWeek')[0]?.textContent || '0');
      const difficulty = node.getElementsByTagName('difficulty')[0]?.textContent || '';
      const description = node.getElementsByTagName('description')[0]?.textContent || '';

      const topics: string[] = [];
      const topicNodes = node.getElementsByTagName('topic');
      for (let j = 0; j < topicNodes.length; j++) {
        topics.push(topicNodes[j].textContent || '');
      }

      subjects.push({ id, code, name, credits, faculty, studyHoursPerWeek, difficulty, description, topics });
    }

    return { rawXml, parsed: subjects };
  },

  async fetchResourcesXML(): Promise<{ rawXml: string; parsed: XMLResourceItem[] }> {
    const res = await fetch('/api/xml/resources');
    const rawXml = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawXml, 'application/xml');

    const resources: XMLResourceItem[] = [];
    const nodes = xmlDoc.getElementsByTagName('resource');
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const id = node.getAttribute('id') || '';
      const title = node.getElementsByTagName('title')[0]?.textContent || '';
      const category = node.getElementsByTagName('category')[0]?.textContent || '';
      const format = node.getElementsByTagName('format')[0]?.textContent || '';
      const fileSize = node.getElementsByTagName('fileSize')[0]?.textContent || '';
      const author = node.getElementsByTagName('author')[0]?.textContent || '';
      const rating = Number(node.getElementsByTagName('rating')[0]?.textContent || '0');
      const downloads = Number(node.getElementsByTagName('downloads')[0]?.textContent || '0');
      const accessLevel = node.getElementsByTagName('accessLevel')[0]?.textContent || '';
      const url = node.getElementsByTagName('url')[0]?.textContent || '';

      resources.push({ id, title, category, format, fileSize, author, rating, downloads, accessLevel, url });
    }

    return { rawXml, parsed: resources };
  },

  // Admin & Feedback
  async getAdminAnalytics() {
    const res = await fetch('/api/admin/analytics', { headers: getAuthHeaders() });
    return res.json();
  },

  async getAdminUsers() {
    const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
    return res.json();
  },

  async updateAdminUserRole(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async sendFeedback(rating: number, message: string) {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, message })
    });
    return res.json();
  },

  async resetDatabase() {
    const res = await fetch('/api/admin/reset-database', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
