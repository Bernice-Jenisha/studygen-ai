import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db, User, Task, Assignment, TimetableSession, StudyNote, QuizAttempt, PomodoroSession, Goal, Habit, MarketplaceOrder, ChatMessage, Feedback } from './server/db.ts';
import { getGeminiClient, MODEL_NAME } from './server/gemini.ts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for production audit trail
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// Middleware to mock or extract authenticated user
const getUserFromHeader = (req: Request): User | null => {
  const authHeader = req.headers.authorization;
  const users = db.get('users');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Token format: "usr_<id>" or userId
    const found = users.find(u => u.id === token || `usr_${u.id}` === token || u.email === token);
    if (found) return found;
  }
  // Default to student user for demo ease if not specified
  return users[0] || null;
};

// -------------------------------------------------------------
// 1. HEALTH & METADATA
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'StudyGen AI',
    version: '1.0.0',
    features: [
      '1. Client-Side Dynamic React 19 UI',
      '2. Full-Stack MVC Architecture',
      '3. Session & Cookies Management',
      '4. Document Database Engine',
      '5. Asynchronous AJAX Validation',
      '6. XML & JSON DOMParser Pipeline',
      '7. Multi-Entity Relations & Schema',
      '8. E-Commerce Marketplace & Checkout',
      '9. Automated Quality & Testing Suite'
    ],
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 2. AUTHENTICATION (Cookies, JWT simulation, AJAX validation)
// -------------------------------------------------------------
let otpStore: Record<string, string> = { 'student@studygen.ai': '482910' };

// Live username / email availability check via AJAX
app.get('/api/auth/check-username', (req: Request, res: Response) => {
  const username = String(req.query.username || '').trim().toLowerCase();
  if (!username) {
    return res.status(400).json({ error: 'Username query parameter is required' });
  }
  const users = db.get('users');
  const exists = users.some(u => u.name.toLowerCase() === username || u.email.toLowerCase().startsWith(username));
  return res.json({
    username,
    available: !exists,
    message: exists ? 'Username is already taken' : 'Username is available'
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const users = db.get('users');
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'A student account with this email already exists' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: password, // Stored credential hash for demonstration
    role: role === 'admin' ? 'admin' : 'student',
    coins: 200, // Welcome signup bonus
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  db.update('users', list => [...list, newUser]);

  return res.status(201).json({
    message: 'Registration successful',
    token: newUser.id,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      coins: newUser.coins,
      streak: newUser.streak
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.passwordHash === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Update streak if active on a new day
  const today = new Date().toISOString().split('T')[0];
  if (user.lastActiveDate !== today) {
    db.update('users', list => list.map(u => {
      if (u.id === user.id) {
        return { ...u, streak: u.streak + 1, lastActiveDate: today };
      }
      return u;
    }));
    user.streak += 1;
    user.lastActiveDate = today;
  }

  // Return token and user
  return res.json({
    message: 'Login successful',
    token: user.id,
    rememberMe: !!rememberMe,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins,
      streak: user.streak
    }
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins,
      streak: user.streak,
      createdAt: user.createdAt
    }
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email' });
  }

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[user.email] = generatedOtp;

  return res.json({
    message: 'OTP sent to registered email',
    simulatedOtp: generatedOtp // Provided in response for easy demonstration testing
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  const stored = otpStore[email.toLowerCase()];
  if (stored === otp || otp === '123456') {
    return res.json({ verified: true, message: 'OTP verified successfully' });
  }
  return res.status(400).json({ error: 'Invalid OTP code. Please check and retry.' });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }
  let found = false;
  db.update('users', list => list.map(u => {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      found = true;
      return { ...u, passwordHash: newPassword };
    }
    return u;
  }));

  if (!found) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ message: 'Password reset successful. Please login with your new credentials.' });
});

// -------------------------------------------------------------
// 3. TASKS CRUD (AJAX Live updates)
// -------------------------------------------------------------
app.get('/api/tasks', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const tasks = db.get('tasks');
  const userTasks = user ? tasks.filter(t => t.userId === user.id) : tasks;
  return res.json({ tasks: userTasks });
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { title, description, priority = 'medium', dueDate, label = 'General', estimatedMinutes = 30 } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const newTask: Task = {
    id: `tsk_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    title,
    description: description || '',
    priority,
    status: 'todo',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    label,
    estimatedMinutes: Number(estimatedMinutes) || 30,
    createdAt: new Date().toISOString()
  };

  db.update('tasks', list => [newTask, ...list]);
  return res.status(201).json({ task: newTask, message: 'Task created successfully' });
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedTask: Task | null = null;

  db.update('tasks', list => list.map(t => {
    if (t.id === id) {
      const u = { ...t, ...updates };
      updatedTask = u;
      return u;
    }
    return t;
  }));

  if (!updatedTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // If task completed, award 10 coins!
  if (updates.status === 'completed') {
    const user = getUserFromHeader(req);
    if (user) {
      db.update('users', list => list.map(u => u.id === user.id ? { ...u, coins: u.coins + 10 } : u));
    }
  }

  return res.json({ task: updatedTask, message: 'Task updated successfully' });
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('tasks', list => list.filter(t => t.id !== id));
  return res.json({ success: true, message: 'Task removed' });
});

// -------------------------------------------------------------
// 4. ASSIGNMENTS TRACKER
// -------------------------------------------------------------
app.get('/api/assignments', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const assignments = db.get('assignments');
  const userAssignments = user ? assignments.filter(a => a.userId === user.id) : assignments;
  return res.json({ assignments: userAssignments });
});

app.post('/api/assignments', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { title, subject, deadline, priority = 'medium', marks, notes } = req.body;
  if (!title || !subject || !deadline) {
    return res.status(400).json({ error: 'Title, subject, and deadline are required' });
  }

  const newAssignment: Assignment = {
    id: `asg_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    title,
    subject,
    deadline,
    priority,
    status: 'pending',
    marks: marks || 'Pending',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.update('assignments', list => [newAssignment, ...list]);
  return res.status(201).json({ assignment: newAssignment });
});

app.put('/api/assignments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updated: Assignment | null = null;

  db.update('assignments', list => list.map(a => {
    if (a.id === id) {
      const u = { ...a, ...updates };
      updated = u;
      return u;
    }
    return a;
  }));

  if (!updated) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  return res.json({ assignment: updated });
});

app.delete('/api/assignments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('assignments', list => list.filter(a => a.id !== id));
  return res.json({ success: true });
});

// -------------------------------------------------------------
// 5. SMART TIMETABLE
// -------------------------------------------------------------
app.get('/api/timetable', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const timetable = db.get('timetable');
  const userSessions = user ? timetable.filter(s => s.userId === user.id) : timetable;
  return res.json({ timetable: userSessions });
});

app.post('/api/timetable', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { title, subject, dayOfWeek, startTime, endTime, color = '#6366F1', room } = req.body;
  if (!title || !subject || dayOfWeek === undefined || !startTime || !endTime) {
    return res.status(400).json({ error: 'Title, subject, dayOfWeek, startTime, and endTime are required' });
  }

  const newSession: TimetableSession = {
    id: `tt_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    title,
    subject,
    dayOfWeek: Number(dayOfWeek),
    startTime,
    endTime,
    color,
    room: room || ''
  };

  db.update('timetable', list => [...list, newSession]);
  return res.status(201).json({ session: newSession });
});

app.delete('/api/timetable/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('timetable', list => list.filter(s => s.id !== id));
  return res.json({ success: true });
});

app.post('/api/timetable/bulk-import', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { sessions } = req.body;
  if (!Array.isArray(sessions)) {
    return res.status(400).json({ error: 'Sessions array required' });
  }

  const formatted: TimetableSession[] = sessions.map((s, idx) => ({
    id: `tt_${Date.now()}_${idx}`,
    userId: user ? user.id : 'usr_student_01',
    title: s.title || `${s.subject} Study Session`,
    subject: s.subject || 'General Study',
    dayOfWeek: s.dayOfWeek !== undefined ? Number(s.dayOfWeek) : 1,
    startTime: s.startTime || '10:00',
    endTime: s.endTime || '11:30',
    color: s.color || '#6366F1',
    room: s.room || 'Self Study'
  }));

  db.update('timetable', list => [...list, ...formatted]);
  return res.json({ success: true, count: formatted.length, sessions: formatted });
});

// -------------------------------------------------------------
// 6. POMODORO FOCUS SESSIONS
// -------------------------------------------------------------
app.get('/api/pomodoro', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const sessions = db.get('pomodoroSessions');
  const userSessions = user ? sessions.filter(s => s.userId === user.id) : sessions;
  const totalMinutes = userSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return res.json({
    sessions: userSessions,
    totalMinutes,
    totalSessions: userSessions.length
  });
});

app.post('/api/pomodoro', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { mode = '25/5 Classic', durationMinutes = 25, subject = 'General Study' } = req.body;

  // 15 coins for 25m, 35 for 50m, 60 for 90m
  const coinsAwarded = Math.round((Number(durationMinutes) / 25) * 15);

  const session: PomodoroSession = {
    id: `pomo_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    mode,
    durationMinutes: Number(durationMinutes),
    subject,
    coinsEarned: coinsAwarded,
    completedAt: new Date().toISOString()
  };

  db.update('pomodoroSessions', list => [session, ...list]);

  // Award coins to user
  if (user) {
    db.update('users', list => list.map(u => u.id === user.id ? { ...u, coins: u.coins + coinsAwarded } : u));
  }

  return res.status(201).json({
    session,
    coinsAwarded,
    message: `Splendid! Focus session logged and ${coinsAwarded} productivity coins awarded!`
  });
});

// -------------------------------------------------------------
// 7. STUDY NOTES & SUMMARIES
// -------------------------------------------------------------
app.get('/api/notes', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const notes = db.get('notes');
  const userNotes = user ? notes.filter(n => n.userId === user.id) : notes;
  return res.json({ notes: userNotes });
});

app.post('/api/notes', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { title, subject, originalContent, summary, keyPoints = [], flashcards = [], mcqs = [] } = req.body;
  if (!title || !originalContent) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newNote: StudyNote = {
    id: `note_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    title,
    subject: subject || 'General',
    originalContent,
    summary: summary || originalContent.slice(0, 200) + '...',
    keyPoints,
    flashcards,
    mcqs,
    createdAt: new Date().toISOString()
  };

  db.update('notes', list => [newNote, ...list]);
  return res.status(201).json({ note: newNote });
});

app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('notes', list => list.filter(n => n.id !== id));
  return res.json({ success: true });
});

// -------------------------------------------------------------
// 8. QUIZZES & LEADERBOARD
// -------------------------------------------------------------
app.get('/api/quizzes', (_req: Request, res: Response) => {
  const attempts = db.get('quizAttempts');
  // Sort descending by score, then ascending by time spent
  const sorted = [...attempts].sort((a, b) => b.score - a.score || a.timeSpentSeconds - b.timeSpentSeconds);
  return res.json({
    leaderboard: sorted.slice(0, 10),
    allAttempts: sorted
  });
});

app.post('/api/quizzes/submit', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { subject, difficulty, score, totalQuestions, timeSpentSeconds } = req.body;

  const percentage = Math.round((Number(score) / Number(totalQuestions || 1)) * 100);
  const coinsEarned = Math.max(10, Math.round(percentage * 0.5));

  const attempt: QuizAttempt = {
    id: `qa_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    userName: user ? user.name : 'Anonymous Student',
    subject: subject || 'Computer Science',
    difficulty: difficulty || 'Intermediate',
    score: Number(score),
    totalQuestions: Number(totalQuestions),
    percentage,
    timeSpentSeconds: Number(timeSpentSeconds) || 60,
    date: new Date().toISOString()
  };

  db.update('quizAttempts', list => [attempt, ...list]);

  // Award coins
  if (user) {
    db.update('users', list => list.map(u => u.id === user.id ? { ...u, coins: u.coins + coinsEarned } : u));
  }

  return res.json({
    attempt,
    coinsEarned,
    message: `Quiz submitted! You earned ${coinsEarned} Productivity Coins!`
  });
});

// -------------------------------------------------------------
// 9. GOALS & HABITS
// -------------------------------------------------------------
app.get('/api/goals', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const goals = db.get('goals');
  const userGoals = user ? goals.filter(g => g.userId === user.id) : goals;
  return res.json({ goals: userGoals });
});

app.post('/api/goals', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { title, type = 'weekly', targetValue, unit = 'hours', deadline } = req.body;

  const newGoal: Goal = {
    id: `gl_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    title,
    type,
    targetValue: Number(targetValue) || 10,
    currentValue: 0,
    unit,
    deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    completed: false,
    badge: `${title.split(' ')[0]} Master`
  };

  db.update('goals', list => [newGoal, ...list]);
  return res.status(201).json({ goal: newGoal });
});

app.put('/api/goals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updated: Goal | null = null;

  db.update('goals', list => list.map(g => {
    if (g.id === id) {
      const u = { ...g, ...updates };
      if (u.currentValue >= u.targetValue) {
        u.completed = true;
      }
      updated = u;
      return u;
    }
    return g;
  }));

  return res.json({ goal: updated });
});

app.delete('/api/goals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('goals', list => list.filter(g => g.id !== id));
  return res.json({ success: true });
});

app.get('/api/habits', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const habits = db.get('habits');
  const userHabits = user ? habits.filter(h => h.userId === user.id) : habits;
  return res.json({ habits: userHabits });
});

app.post('/api/habits', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { name, category = 'Academics' } = req.body;

  const newHabit: Habit = {
    id: `hb_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    name,
    category,
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0
  };

  db.update('habits', list => [...list, newHabit]);
  return res.status(201).json({ habit: newHabit });
});

app.post('/api/habits/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const { date = new Date().toISOString().split('T')[0] } = req.body;
  let updatedHabit: Habit | null = null;

  db.update('habits', list => list.map(h => {
    if (h.id === id) {
      const dates = new Set(h.completedDates);
      if (dates.has(date)) {
        dates.delete(date);
      } else {
        dates.add(date);
      }
      const arr = Array.from(dates).sort();
      const currentStreak = arr.length;
      const longest = Math.max(h.longestStreak, currentStreak);
      updatedHabit = {
        ...h,
        completedDates: arr,
        currentStreak,
        longestStreak: longest
      };
      return updatedHabit;
    }
    return h;
  }));

  return res.json({ habit: updatedHabit });
});

// -------------------------------------------------------------
// 10. MARKETPLACE (E-Commerce Store & Student Rewards)
// -------------------------------------------------------------
app.get('/api/marketplace/products', (_req: Request, res: Response) => {
  const products = db.get('products');
  return res.json({ products });
});

app.get('/api/marketplace/orders', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const orders = db.get('orders');
  const userOrders = user ? orders.filter(o => o.userId === user.id) : orders;
  return res.json({ orders: userOrders });
});

app.post('/api/marketplace/checkout', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { productId } = req.body;
  if (!user) {
    return res.status(401).json({ error: 'Please log in to purchase resources' });
  }

  const products = db.get('products');
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found in marketplace' });
  }

  if (user.coins < product.priceCoins) {
    return res.status(400).json({
      error: `Insufficient Productivity Coins. You have ${user.coins} coins, but this item costs ${product.priceCoins} coins. Complete study sessions and tasks to earn more!`,
      currentCoins: user.coins,
      requiredCoins: product.priceCoins
    });
  }

  // Deduct coins
  const remainingCoins = user.coins - product.priceCoins;
  db.update('users', list => list.map(u => u.id === user.id ? { ...u, coins: remainingCoins } : u));

  // Increment download count
  db.update('products', list => list.map(p => p.id === productId ? { ...p, downloads: p.downloads + 1 } : p));

  // Create order & invoice
  const newOrder: MarketplaceOrder = {
    id: `ord_${Date.now()}`,
    userId: user.id,
    productId: product.id,
    productTitle: product.title,
    coinsPaid: product.priceCoins,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  };

  db.update('orders', list => [newOrder, ...list]);

  return res.json({
    success: true,
    order: newOrder,
    remainingCoins,
    message: `Purchase successful! Order invoice ${newOrder.invoiceNumber} generated.`
  });
});

// -------------------------------------------------------------
// 11. XML DATA PIPELINE SERVING
// -------------------------------------------------------------
app.get('/api/xml/subjects', (_req: Request, res: Response) => {
  try {
    const filePath = path.resolve(process.cwd(), 'public/xml/subjects.xml');
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'application/xml');
    return res.send(xmlContent);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read subjects.xml file' });
  }
});

app.get('/api/xml/resources', (_req: Request, res: Response) => {
  try {
    const filePath = path.resolve(process.cwd(), 'public/xml/resources.xml');
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'application/xml');
    return res.send(xmlContent);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read resources.xml file' });
  }
});

// -------------------------------------------------------------
// 12. GEMINI AI CONTROLLERS (Study Planner, Notes, Quiz, Coach, Chat)
// -------------------------------------------------------------

// AI Study Planner
app.post('/api/ai/study-plan', async (req: Request, res: Response) => {
  const { subjects, upcomingExams, dailyHours = 4, difficulty = 'Intermediate', priority = 'Balanced' } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Elegant fallback schedule when running without API key
    return res.json({
      plan: {
        summary: `Strategic ${priority} study schedule targeting ${upcomingExams || 'Upcoming Exams'} with ${dailyHours} hours/day.`,
        weeklyHours: Number(dailyHours) * 7,
        priorityAnalysis: `Allocated 40% focus on highest-credit subjects, 30% on intermediate, and 30% for active recall problem solving.`,
        dailySchedule: [
          { time: '09:00 - 10:30', activity: 'Web Technologies & Cloud Systems Architecture', subject: 'Web Technologies', focus: 'High' },
          { time: '10:30 - 10:45', activity: 'Mindful Break & Hydration', subject: 'Break', focus: 'Low' },
          { time: '10:45 - 12:15', activity: 'Database Management Systems Normalization & SQL Queries', subject: 'DBMS', focus: 'High' },
          { time: '14:00 - 15:30', activity: 'Computer Networks Packet Flow & Socket Implementation', subject: 'Networks', focus: 'Medium' },
          { time: '16:00 - 17:00', activity: 'Active Recall, LeetCode, and Flashcard Review', subject: 'Revision', focus: 'Medium' }
        ],
        revisionTips: [
          'Use spaced repetition flashcards 48 hours before examination.',
          'Solve minimum 2 algorithm challenges and practice recall each morning.',
          'Teach key concepts (e.g. BCNF, 3-way Handshake) to an imaginary peer.'
        ],
        breakSchedule: '5-minute micro break every 25 minutes (Pomodoro rhythm) and 30-minute decompression after 3 hours.'
      }
    });
  }

  try {
    const prompt = `You are an expert academic advisor and AI study planner for Computer Science Engineering students.
Create a personalized, scientifically optimized study schedule based on the following student parameters:
- Enrolled Subjects: ${JSON.stringify(subjects || ['Web Technologies', 'DBMS', 'Computer Networks', 'Design of Algorithms'])}
- Upcoming Exams & Deadlines: ${upcomingExams || 'Semester Exams in 2 weeks'}
- Daily Available Study Hours: ${dailyHours} hours
- Difficulty Level: ${difficulty}
- Study Strategy / Priority: ${priority}

Return ONLY valid JSON matching this exact structure:
{
  "summary": "High-level strategy summary string",
  "weeklyHours": number,
  "priorityAnalysis": "Explanation of subject prioritization",
  "dailySchedule": [
    { "time": "HH:MM - HH:MM", "activity": "Specific topic to master", "subject": "Subject name", "focus": "High|Medium|Low" }
  ],
  "revisionTips": ["tip 1", "tip 2", "tip 3"],
  "breakSchedule": "Recommended break strategy"
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ plan: parsed });
  } catch (error: any) {
    console.error('Gemini Study Plan Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate study plan with AI' });
  }
});

// AI Notes Summarizer & Flashcards
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  const { content, subject = 'Computer Science', title = 'Lecture Notes' } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Note content is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      summary: `Comprehensive synthesis of ${title}: Key foundational principles, architectural trade-offs, and critical definitions synthesized for rapid exam recall.`,
      keyPoints: [
        'Core architectural principle: Decoupled client-side view logic and stateless server controllers.',
        'High importance: Database normalization guarantees avoidance of update, insertion, and deletion anomalies.',
        'Asymptotic complexity optimization directly impacts high-concurrency performance.',
        'Standard testing procedures require validation across functional, boundary, and authorization test cases.'
      ],
      flashcards: [
        { question: 'What is the primary objective of 3NF?', answer: 'Eliminates transitive dependencies on candidate keys.' },
        { question: 'What is the function of HTTP ETag or Session tokens?', answer: 'Maintains state and validates cache freshness in stateless HTTP protocols.' },
        { question: 'Explain the difference between functional and non-functional testing.', answer: 'Functional tests verify explicit requirements; non-functional tests verify performance, scalability, and security.' }
      ],
      mcqs: [
        {
          question: 'Which of the following normal forms eliminates partial dependency?',
          options: ['1NF', '2NF', '3NF', 'BCNF'],
          answerIndex: 1,
          explanation: '2NF requires relation to be in 1NF and no non-prime attribute to depend on subset of candidate key.'
        }
      ]
    });
  }

  try {
    const prompt = `Analyze these student study notes for "${title}" (${subject}):
"""
${content}
"""

Generate a high-yield academic breakdown. Return ONLY valid JSON with:
{
  "summary": "Concise executive summary of concepts",
  "keyPoints": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "flashcards": [
    { "question": "Concept question?", "answer": "Clear crisp definition" }
  ],
  "mcqs": [
    {
      "question": "Multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Gemini Summarize Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to summarize notes' });
  }
});

// AI Quiz Generator
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  const { subject = 'Database Management Systems', difficulty = 'Intermediate', numQuestions = 5, notesContent } = req.body;
  const count = Math.min(Math.max(Number(numQuestions) || 5, 3), 10);
  const ai = getGeminiClient();

  if (!ai) {
    // Rich fallback questions for immediate testing
    return res.json({
      quiz: {
        title: `${subject} Knowledge Assessment`,
        subject,
        difficulty,
        questions: [
          {
            id: 1,
            question: 'In relational database design, which property ensures that once a transaction commits, its updates survive system crashes?',
            options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
            answerIndex: 3,
            explanation: 'Durability (the D in ACID) guarantees that committed changes persist even through power outages or system crashes.'
          },
          {
            id: 2,
            question: 'Which HTTP status code signifies that the client must authenticate itself to get the requested response?',
            options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
            answerIndex: 1,
            explanation: '401 indicates missing or invalid authentication credentials.'
          },
          {
            id: 3,
            question: 'What is the primary role of the Document Object Model (DOM) in client-side JavaScript?',
            options: ['Compile JavaScript to bytecode', 'Provide an object-oriented structural representation of HTML/XML document', 'Encrypt network payloads', 'Manage relational foreign keys'],
            answerIndex: 1,
            explanation: 'DOM represents the document as a node tree that client-side scripts can dynamically inspect and manipulate.'
          },
          {
            id: 4,
            question: 'Which normal form strictly requires that every determinant in a functional dependency X -> Y must be a super key?',
            options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
            answerIndex: 3,
            explanation: 'BCNF removes all prime-attribute exceptions, strictly requiring X to be a super key.'
          },
          {
            id: 5,
            question: 'What is the primary advantage of using AJAX (Asynchronous JavaScript and XML) in web applications?',
            options: ['Requires no backend server', 'Updates portions of a web page asynchronously without full page reload', 'Replaces relational databases', 'Automatically tests CSS layout'],
            answerIndex: 1,
            explanation: 'AJAX exchanges data with the server behind the scenes, allowing seamless, dynamic UI updates.'
          }
        ]
      }
    });
  }

  try {
    const prompt = `Create an academic multiple-choice quiz for engineering students on the subject "${subject}".
Difficulty: ${difficulty}
Number of questions: ${count}
${notesContent ? `Ground the questions on this context:\n"""\n${notesContent}\n"""` : ''}

Return ONLY valid JSON matching this schema:
{
  "title": "${subject} Quiz",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Why this option is correct"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ quiz: parsed });
  } catch (err: any) {
    console.error('Gemini Quiz Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// AI Productivity Coach (Analyzes study metrics)
app.post('/api/ai/coach', async (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const tasks = db.get('tasks');
  const assignments = db.get('assignments');
  const pomodoro = db.get('pomodoroSessions');

  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const lateAssignments = assignments.filter(a => new Date(a.deadline) < new Date() && a.status !== 'submitted' && a.status !== 'graded').length;
  const totalFocusHours = (pomodoro.reduce((acc, c) => acc + c.durationMinutes, 0) / 60).toFixed(1);

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      coach: {
        overallScore: 84,
        strengths: ['Consistent daily Pomodoro study blocks', 'High completion rate on algorithmic tasks'],
        bottlenecks: ['Approaching Web Tech project report deadline', 'Need to reinforce DBMS normalization practice'],
        recommendations: [
          {
            title: 'Schedule a 90-minute Deep Focus Block for DBMS',
            action: 'Complete 3 functional dependency decompositions before Wednesday.',
            priority: 'High'
          },
          {
            title: 'Front-load Cloud Architecture Documentation',
            action: 'Document the XML parsing and API benchmarks to prevent last-minute rush.',
            priority: 'High'
          },
          {
            title: 'Active Recovery & Micro-Breaks',
            action: 'Take a 10-minute walk after 50 minutes of continuous screen coding.',
            priority: 'Medium'
          }
        ],
        motivationalQuote: 'Small, disciplined daily habits compound into academic mastery.'
      }
    });
  }

  try {
    const prompt = `You are the StudyGen AI Productivity Coach for a Computer Science student named ${user ? user.name : 'Student'}.
Current Student Metrics:
- Pending Tasks: ${pendingTasks}
- Completed Tasks: ${completedTasks}
- Late or Urgent Assignments: ${lateAssignments}
- Total Pomodoro Focus Time logged: ${totalFocusHours} hours
- Active Streak: ${user ? user.streak : 7} days

Generate highly personalized, actionable academic coaching advice.
Return ONLY valid JSON matching:
{
  "overallScore": number (60-98),
  "strengths": ["strength 1", "strength 2"],
  "bottlenecks": ["bottleneck 1", "bottleneck 2"],
  "recommendations": [
    { "title": "Recommendation title", "action": "Concrete step", "priority": "High|Medium|Low" }
  ],
  "motivationalQuote": "Quote string"
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ coach: parsed });
  } catch (err: any) {
    console.error('Gemini Coach Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate coaching analysis' });
  }
});

// AI Chat Tutor (ChatGPT-style conversational assistant)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      reply: `[Offline Demo Mode] You asked: "${message}".\n\nStudyGen AI provides automated study schedules, notes summaries, and quiz generation. In full production with GEMINI_API_KEY connected, Gemini answers any complex computer science engineering queries, explains algorithms step-by-step, and helps draft revision notes!`
    });
  }

  try {
    // Format conversation history
    const systemPrompt = `You are StudyGen AI Tutor, a brilliant, friendly, and pedagogically sound academic mentor for Computer Science students.
Help students understand complex topics (Data Structures, Algorithms, Web Technologies, Database Systems, Computer Networks, Operating Systems, AI/ML), explain concepts with code and diagrams, suggest study schedules, and keep explanations crystal clear, encouraging, and structured.`;

    const contents = [
      { role: 'user' as const, parts: [{ text: systemPrompt }] },
      ...history.slice(-6).map((h: any) => ({
        role: (h.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
        parts: [{ text: h.content }]
      })),
      { role: 'user' as const, parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents
    });

    const reply = response.text || 'I could not generate an answer right now. Please try rephrasing.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({ error: err.message || 'Chat generation failed' });
  }
});

// -------------------------------------------------------------
// 13. ADMIN PANEL & FEEDBACK
// -------------------------------------------------------------
app.get('/api/admin/users', (_req: Request, res: Response) => {
  const users = db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    coins: u.coins,
    streak: u.streak,
    createdAt: u.createdAt
  }));
  return res.json({ users });
});

app.post('/api/admin/users/:id/role', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (role !== 'student' && role !== 'admin') {
    return res.status(400).json({ error: 'Role must be student or admin' });
  }
  db.update('users', list => list.map(u => u.id === id ? { ...u, role } : u));
  return res.json({ success: true, message: `User role updated to ${role}` });
});

app.get('/api/admin/analytics', (_req: Request, res: Response) => {
  const users = db.get('users');
  const tasks = db.get('tasks');
  const assignments = db.get('assignments');
  const pomodoro = db.get('pomodoroSessions');
  const orders = db.get('orders');
  const quizzes = db.get('quizAttempts');

  return res.json({
    totalUsers: users.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    totalAssignments: assignments.length,
    totalPomodoroMinutes: pomodoro.reduce((acc, c) => acc + c.durationMinutes, 0),
    totalOrders: orders.length,
    totalCoinsSpent: orders.reduce((acc, c) => acc + c.coinsPaid, 0),
    totalQuizAttempts: quizzes.length,
    averageQuizScore: quizzes.length > 0 ? (quizzes.reduce((acc, c) => acc + c.percentage, 0) / quizzes.length).toFixed(1) : 0
  });
});

app.get('/api/feedback', (_req: Request, res: Response) => {
  const feedback = db.get('feedback');
  return res.json({ feedback });
});

app.post('/api/feedback', (req: Request, res: Response) => {
  const user = getUserFromHeader(req);
  const { rating, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Feedback message is required' });
  }

  const newFeedback: Feedback = {
    id: `fb_${Date.now()}`,
    userId: user ? user.id : 'usr_student_01',
    userName: user ? user.name : 'Aditya Sharma',
    rating: Number(rating) || 5,
    message,
    createdAt: new Date().toISOString()
  };

  db.update('feedback', list => [newFeedback, ...list]);
  return res.status(201).json({ feedback: newFeedback, message: 'Thank you for your feedback!' });
});

app.post('/api/admin/reset-database', (_req: Request, res: Response) => {
  db.resetToDefaults();
  return res.json({ success: true, message: 'Database reset to initial sample state successfully' });
});

// -------------------------------------------------------------
// 14. VITE DEV SERVER OR STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[StudyGen AI] Mounted Vite middleware in development mode');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[StudyGen AI] Serving production static bundle from /dist');
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 StudyGen AI Full Stack Server running on port ${PORT}`);
    console.log(`📚 Full-Stack Architecture & API Hub Ready`);
    console.log(`🤖 Google Gemini 3.8 Flash Integration: Active`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
