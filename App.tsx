import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit2,
  Moon,
  Sun,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Menu,
  X,
  Grid,
  List as ListIcon,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// --- Types ---

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Pending' | 'Completed';
type Category = 'Work' | 'Personal' | 'Shopping' | 'Health' | 'Other';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  priority: Priority;
  category: Category;
  status: Status;
  imageUrl?: string;
  createdAt: number;
}

interface User {
  username: string;
  name: string;
}

// --- Constants & Helpers ---

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const CATEGORIES: Category[] = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];

const COLORS = {
  High: '#ef4444', // Red-500
  Medium: '#f59e0b', // Amber-500
  Low: '#3b82f6', // Blue-500
  Completed: '#10b981', // Emerald-500
  Pending: '#6366f1', // Indigo-500
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const getRelativeTime = (dateString: string) => {
  const diff = new Date(dateString).getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (diff < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days left`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// --- Dummy Data Generator ---

const generateDummyData = (): Task[] => {
  const tasks: Task[] = [];
  const titles = ['Review Q3 Budget', 'Buy Groceries', 'Team Meeting', 'Doctor Appointment', 'Design New Landing Page', 'Fix Bug #404', 'Client Call'];
  
  for (let i = 0; i < 7; i++) {
    const randomPriority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const randomStatus = Math.random() > 0.4 ? 'Pending' : 'Completed';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 10) - 2); // -2 to +8 days

    tasks.push({
      id: generateId(),
      title: titles[i],
      description: 'This is a sample task description generated for demonstration purposes.',
      deadline: futureDate.toISOString(),
      priority: randomPriority,
      category: randomCategory,
      status: randomStatus,
      createdAt: Date.now(),
      imageUrl: i % 3 === 0 ? `https://picsum.photos/seed/${i}/400/200` : undefined
    });
  }
  return tasks;
};

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // State: Authentication
  const [user, setUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // State: Data
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // State: UI/UX
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State: Task Management
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State: Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskForm, setNewTaskForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    category: 'Work',
    imageUrl: ''
  });

  // --- Effects ---

  // Initialize from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('utm_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedTasks = localStorage.getItem('utm_tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));

    const storedTheme = localStorage.getItem('utm_theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('utm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('utm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('utm_theme', 'light');
    }
  }, [darkMode]);

  // --- Handlers: Auth ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'admin' && passwordInput === '123') {
      const userData = { username: 'admin', name: 'Administrator' };
      setUser(userData);
      localStorage.setItem('utm_user', JSON.stringify(userData));
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Try admin / 123');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('utm_user');
    setUsernameInput('');
    setPasswordInput('');
  };

  // --- Handlers: Tasks ---

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.deadline) return;

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...newTaskForm as any } : t));
    } else {
      const newTask: Task = {
        id: generateId(),
        title: newTaskForm.title!,
        description: newTaskForm.description || '',
        deadline: newTaskForm.deadline!,
        priority: (newTaskForm.priority as Priority) || 'Medium',
        category: (newTaskForm.category as Category) || 'Work',
        status: 'Pending',
        createdAt: Date.now(),
        imageUrl: newTaskForm.imageUrl
      };
      setTasks(prev => [...prev, newTask]);
    }
    closeTaskModal();
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setNewTaskForm({
      title: '',
      description: '',
      deadline: new Date().toISOString().slice(0, 16),
      priority: 'Medium',
      category: 'Work',
      imageUrl: ''
    });
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTaskForm({ ...task, deadline: task.deadline.slice(0, 16) });
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleGenerateData = () => {
    const dummy = generateDummyData();
    setTasks(prev => [...prev, ...dummy]);
  };

  // --- Derived State: Analytics ---

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const overdue = tasks.filter(t => t.status === 'Pending' && new Date(t.deadline).getTime() < Date.now()).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => { if (t.status === 'Pending') counts[t.priority]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const weeklyData = useMemo(() => {
    // Simple mock for "Weekly Progress" - normally would group by date
    return [
      { name: 'Mon', completed: 2, pending: 4 },
      { name: 'Tue', completed: 3, pending: 2 },
      { name: 'Wed', completed: 5, pending: 1 },
      { name: 'Thu', completed: 2, pending: 3 },
      { name: 'Fri', completed: 4, pending: 5 },
      { name: 'Sat', completed: 1, pending: 1 },
      { name: 'Sun', completed: 0, pending: 2 },
    ];
  }, []);

  // --- Derived State: Filtered Tasks ---

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
        const matchesStatus = filterStatus === 'All' || 
                             (filterStatus === 'Active' ? t.status === 'Pending' : t.status === 'Completed');
        return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (sortBy === 'created') return b.createdAt - a.createdAt;
        // Priority sort: High > Medium > Low
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      });
  }, [tasks, searchQuery, filterPriority, filterCategory, filterStatus, sortBy]);

  // --- Views ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transform transition-all">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to manage your tasks</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white outline-none transition-all"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white outline-none transition-all"
                placeholder="123"
              />
            </div>
            
            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-primary-500/30"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            Hint: Use <strong>admin</strong> / <strong>123</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-700">
            <CheckSquare className="w-8 h-8 text-primary-600 mr-2" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">TaskMaster</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => { setCurrentView('tasks'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'tasks' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <CheckCircle2 size={20} />
              My Tasks
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
             <div className="mb-4">
                <button onClick={handleGenerateData} className="w-full text-xs text-center text-gray-400 hover:text-primary-500 underline">
                    Populate Dummy Data
                </button>
             </div>
            <div className="flex items-center justify-between mb-4">
               <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
               <button
                 onClick={() => setDarkMode(!darkMode)}
                 className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
               >
                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
               </button>
            </div>
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <LogOut size={12} /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {currentView === 'dashboard' ? 'Dashboard' : 'Task Management'}
            </h2>
          </div>
          <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium mr-1">{getGreeting()},</span> {user.name}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          
          {currentView === 'dashboard' ? (
            <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Tasks', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                  { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                  { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                  { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                      <LayoutDashboard size={24} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Task Priority Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#fff' : '#000' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Weekly Activity</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} />
                        <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#fff' : '#000' }}
                        />
                        <Legend />
                        <Bar dataKey="completed" fill={COLORS.Completed} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pending" fill={COLORS.Pending} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              {/* Controls Toolbar */}
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as Category | 'All')}
                      className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-200 outline-none"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
                      className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-200 outline-none"
                    >
                      <option value="All">All Priorities</option>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-200 outline-none"
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 w-full xl:w-auto justify-between xl:justify-end">
                  <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      <ListIcon size={18} />
                    </button>
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary-500/20 font-medium text-sm"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Task List/Grid */}
              {filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <CheckSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or create a new task.</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {filteredTasks.map(task => (
                    <div
                      key={task.id}
                      className={`group bg-white dark:bg-slate-800 rounded-xl border transition-all hover:shadow-lg ${
                        task.status === 'Completed' 
                        ? 'border-gray-200 dark:border-slate-700 opacity-75' 
                        : 'border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      {viewMode === 'grid' && task.imageUrl && (
                        <div className="h-32 w-full overflow-hidden rounded-t-xl bg-gray-100 relative">
                          <img src={task.imageUrl} alt="attachment" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {task.priority}
                          </div>
                          
                          <div className="relative">
                            <button 
                              onClick={() => {
                                const menu = document.getElementById(`menu-${task.id}`);
                                if(menu) menu.classList.toggle('hidden');
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {/* Simple Dropdown Logic */}
                            <div id={`menu-${task.id}`} className="hidden absolute right-0 mt-2 w-36 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-100 dark:border-slate-600 z-10 animate-fadeIn" onMouseLeave={(e) => e.currentTarget.classList.add('hidden')}>
                              <button onClick={() => { openEditModal(task); document.getElementById(`menu-${task.id}`)?.classList.add('hidden'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
                                <Edit2 size={14} /> Edit
                              </button>
                              <button onClick={() => { handleDeleteTask(task.id); document.getElementById(`menu-${task.id}`)?.classList.add('hidden'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border transition-colors flex items-center justify-center ${
                              task.status === 'Completed' 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-gray-300 dark:border-slate-500 hover:border-primary-500'
                            }`}
                          >
                            {task.status === 'Completed' && <CheckSquare size={14} />}
                          </button>
                          <div>
                            <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={14} />
                            <span className={`${
                               new Date(task.deadline).getTime() < Date.now() && task.status !== 'Completed' ? 'text-red-500 font-bold' : ''
                            }`}>
                              {formatDate(task.deadline)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-gray-300">
                               {task.category}
                             </span>
                          </div>
                        </div>
                         {task.status !== 'Completed' && (
                            <div className={`mt-2 text-xs font-medium text-right ${
                                getRelativeTime(task.deadline) === 'Overdue' ? 'text-red-500' : 'text-primary-600'
                            }`}>
                                {getRelativeTime(task.deadline)}
                            </div>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        title={editingTask ? "Edit Task" : "New Task"}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              required
              type="text"
              value={newTaskForm.title}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Q4 Report"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={newTaskForm.priority}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={newTaskForm.category}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value as Category })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
            <input
              required
              type="datetime-local"
              value={newTaskForm.deadline}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL (Optional)</label>
             <div className="flex gap-2">
                <input
                  type="url"
                  value={newTaskForm.imageUrl || ''}
                  onChange={(e) => setNewTaskForm({...newTaskForm, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="https://..."
                />
                {newTaskForm.imageUrl && (
                    <div className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                        <img src={newTaskForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={newTaskForm.description}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Add details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;