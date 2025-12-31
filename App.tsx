import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  LogOut,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  Moon,
  Sun,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Grid,
  List as ListIcon,
  Columns,
  Download,
  Upload,
  Check,
  AlertTriangle,
  Info,
  History,
  FileSpreadsheet,
  RotateCcw,
  Archive,
  RefreshCcw,
  LayoutList,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowRight
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

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string (New Field)
  deadline: string; // ISO string (Acts as End Date)
  priority: Priority;
  category: Category;
  status: Status;
  imageUrl?: string;
  subtasks: Subtask[];
  createdAt: number;
  deletedAt?: number | null; // For soft delete
  isArchived?: boolean; // For archive
}

interface Activity {
  id: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Completed' | 'Reopened' | 'System' | 'Archived' | 'Restored' | 'Moved';
  target: string; // Task Title
  timestamp: number;
  user: string;
}

interface User {
  username: string;
  name: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationItem {
    id: string;
    type: 'overdue' | 'due_today' | 'activity';
    message: string;
    timestamp: number;
    taskId?: string;
}

// --- Constants & Helpers ---

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const CATEGORIES: Category[] = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];

const COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
  Completed: '#10b981',
  Pending: '#6366f1',
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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

// Check if a date is between start and end (inclusive)
const isDateInRange = (checkDate: Date, startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    // Normalize to YYYY-MM-DD to ignore time for day comparison
    const check = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    return check.getTime() >= s.getTime() && check.getTime() <= e.getTime();
};

// --- Dummy Data Generator ---

const generateDummyData = (): { tasks: Task[], activities: Activity[] } => {
  const tasks: Task[] = [];
  const activities: Activity[] = [];
  const titles = ['Review Q3 Budget', 'Buy Groceries', 'Team Meeting', 'Doctor Appointment', 'Design New Landing Page', 'Fix Bug #404', 'Client Call', 'Clean Garage', 'Update Portfolio'];
  
  for (let i = 0; i < 9; i++) {
    const randomPriority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const randomStatus = Math.random() > 0.4 ? 'Pending' : 'Completed';
    
    // Create Start and End dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 10) - 5); // Start range -5 to +5 days from now
    
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 3) + 1); // Duration 1-4 days

    // Simulate some archived and deleted tasks
    const isArchived = i === 7;
    const deletedAt = i === 8 ? Date.now() : null;

    const task: Task = {
      id: generateId(),
      title: titles[i],
      description: 'This is a sample task description generated for demonstration purposes. It contains enough text to test the layout.',
      startDate: startDate.toISOString(),
      deadline: deadline.toISOString(),
      priority: randomPriority,
      category: randomCategory,
      status: randomStatus,
      createdAt: Date.now() - (Math.random() * 100000000),
      imageUrl: i % 3 === 0 ? `https://picsum.photos/seed/${i}/400/200` : undefined,
      subtasks: [
        { id: generateId(), title: 'Research', completed: true },
        { id: generateId(), title: 'Drafting', completed: false },
        { id: generateId(), title: 'Final Review', completed: false }
      ],
      isArchived,
      deletedAt
    };
    tasks.push(task);

    // Generate matching activity
    activities.push({
      id: generateId(),
      action: 'Created',
      target: task.title,
      timestamp: task.createdAt,
      user: 'Administrator'
    });
  }

  // Sort activities by newest
  activities.sort((a, b) => b.timestamp - a.timestamp);

  return { tasks, activities };
};

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all animate-slideIn ${
            toast.type === 'success' ? 'bg-emerald-600' : 
            toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'error' && <AlertTriangle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const TaskCard: React.FC<{
  task: Task;
  viewMode: 'grid' | 'list' | 'board';
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void; // Soft Delete
  onPermanentDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onArchive?: (task: Task) => void;
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  isRecycleBin?: boolean;
}> = ({ task, viewMode, onEdit, onDelete, onPermanentDelete, onRestore, onArchive, onToggleStatus, onToggleSubtask, isRecycleBin }) => {
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;
  
  // -- List View Compact Mode --
  if (viewMode === 'list') {
    return (
      <div className={`group bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all flex items-center p-3 gap-4 ${task.status === 'Completed' ? 'opacity-75' : ''}`}>
         {/* Status Checkbox */}
         {!isRecycleBin && (
            <button
                onClick={() => onToggleStatus(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border transition-colors flex items-center justify-center ${
                task.status === 'Completed' 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'border-gray-300 dark:border-slate-500 hover:border-primary-500'
                }`}
            >
                {task.status === 'Completed' && <CheckSquare size={14} />}
            </button>
         )}

         {/* Image Thumbnail */}
         {task.imageUrl && (
             <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 hidden sm:block">
                 <img src={task.imageUrl} alt="thumb" className="w-full h-full object-cover" />
             </div>
         )}

         {/* Content */}
         <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
            <div className="md:col-span-2">
                <h3 className={`font-semibold text-sm text-gray-900 dark:text-white truncate ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.description}</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                    {task.priority}
                </span>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <CalendarIcon size={12} />
                    <span className={new Date(task.deadline).getTime() < Date.now() && task.status !== 'Completed' ? 'text-red-500' : ''}>
                        {formatDate(task.deadline)}
                    </span>
                </div>
            </div>

            {/* Subtask Summary for List View */}
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                {task.subtasks.length > 0 && (
                    <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} /> {completedSubtasks}/{task.subtasks.length} subtasks
                    </span>
                )}
            </div>
         </div>

         {/* Actions */}
         <div className="relative flex-shrink-0">
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const menu = document.getElementById(`menu-list-${task.id}`);
                  document.querySelectorAll('[id^="menu-"]').forEach(el => el.classList.add('hidden'));
                  if(menu) menu.classList.toggle('hidden');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <MoreVertical size={16} />
              </button>
              <div id={`menu-list-${task.id}`} className="hidden absolute right-0 top-8 w-40 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-100 dark:border-slate-600 z-50 animate-fadeIn" onMouseLeave={(e) => e.currentTarget.classList.add('hidden')}>
                {isRecycleBin ? (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onRestore && onRestore(task.id); }} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2">
                            <RefreshCcw size={14} /> Restore
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onPermanentDelete && onPermanentDelete(task.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Trash2 size={14} /> Delete Forever
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
                            <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onArchive && onArchive(task); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
                            <Archive size={14} /> {task.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Trash2 size={14} /> Delete
                        </button>
                    </>
                )}
              </div>
         </div>
      </div>
    );
  }

  // -- Grid & Board View --
  return (
    <div
      className={`group bg-white dark:bg-slate-800 rounded-xl border transition-all hover:shadow-lg flex flex-col h-auto ${
        task.status === 'Completed' 
        ? 'border-gray-200 dark:border-slate-700 opacity-75' 
        : 'border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
      }`}
    >
      {task.imageUrl && (
        <div className="h-32 w-full overflow-hidden rounded-t-xl bg-gray-100 relative shrink-0">
          <img src={task.imageUrl} alt="attachment" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
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
              onClick={(e) => {
                e.stopPropagation();
                const menu = document.getElementById(`menu-${task.id}`);
                document.querySelectorAll('[id^="menu-"]').forEach(el => {
                  if (el.id !== `menu-${task.id}`) el.classList.add('hidden');
                });
                if(menu) menu.classList.toggle('hidden');
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <MoreVertical size={18} />
            </button>
            <div id={`menu-${task.id}`} className="hidden absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-100 dark:border-slate-600 z-50 animate-fadeIn" onMouseLeave={(e) => e.currentTarget.classList.add('hidden')}>
               {isRecycleBin ? (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onRestore && onRestore(task.id); document.getElementById(`menu-${task.id}`)?.classList.add('hidden'); }} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2">
                            <RefreshCcw size={14} /> Restore
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onPermanentDelete && onPermanentDelete(task.id); document.getElementById(`menu-${task.id}`)?.classList.add('hidden'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Trash2 size={14} /> Delete Forever
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(task); document.getElementById(`menu-${task.id}`)?.classList.add('hidden'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
                            <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onArchive && onArchive(task); document.getElementById(`menu-${task.id}`)?.classList.add('hidden'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
                            <Archive size={14} /> {task.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); document.getElementById(`menu-${task.id}`)?.classList.add('hidden'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Trash2 size={14} /> Delete
                        </button>
                    </>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 mb-3 flex-1">
          {!isRecycleBin && (
            <button
                onClick={() => onToggleStatus(task.id)}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded border transition-colors flex items-center justify-center ${
                task.status === 'Completed' 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'border-gray-300 dark:border-slate-500 hover:border-primary-500'
                }`}
            >
                {task.status === 'Completed' && <CheckSquare size={14} />}
            </button>
          )}
          <div className="w-full min-w-0">
            <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 truncate ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
            
            {/* Subtasks Progress - Show ALL */}
            {task.subtasks.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-2">
                  <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                {!isRecycleBin && (
                    <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {task.subtasks.map(st => (
                        <div key={st.id} onClick={() => onToggleSubtask(task.id, st.id)} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white group/subtask">
                            <div className={`mt-0.5 w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${st.completed ? 'bg-primary-500 border-primary-500' : 'border-gray-400 group-hover/subtask:border-primary-500'}`}>
                                {st.completed && <Check size={8} className="text-white"/>}
                            </div>
                            <span className={`${st.completed ? 'line-through opacity-70' : ''} leading-tight`}>{st.title}</span>
                        </div>
                    ))}
                    </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <CalendarIcon size={14} />
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // State: UI/UX
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'archived' | 'recycle_bin' | 'calendar'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // State: Calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  // State: Task Management
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('grid');

  // State: Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form State
  const [newTaskForm, setNewTaskForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    startDate: '',
    deadline: '',
    priority: 'Medium',
    category: 'Work',
    imageUrl: '',
    subtasks: []
  });
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // --- Helpers ---

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logActivity = (action: Activity['action'], target: string) => {
    const newActivity: Activity = {
      id: generateId(),
      action,
      target,
      timestamp: Date.now(),
      user: user?.name || 'User'
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50 activities
  };

  // --- Handlers: Auth ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'admin' && passwordInput === '123') {
      const userData = { username: 'admin', name: 'Administrator' };
      setUser(userData);
      localStorage.setItem('utm_user', JSON.stringify(userData));
      setLoginError('');
      addToast('Welcome back, Admin!');
    } else {
      setLoginError('Invalid credentials. Try admin / 123');
      addToast('Login failed', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('utm_user');
    setUsernameInput('');
    setPasswordInput('');
    addToast('Logged out successfully', 'info');
  };

  // --- Handlers: Data Management ---

  const handleResetData = (showToast = true) => {
    if (showToast && !window.confirm("This will erase all current tasks and restore dummy data. Continue?")) return;
    
    const { tasks: dTasks, activities: dActivities } = generateDummyData();
    setTasks(dTasks);
    setActivities(dActivities);
    
    // Force Save
    localStorage.setItem('utm_tasks', JSON.stringify(dTasks));
    localStorage.setItem('utm_activities', JSON.stringify(dActivities));

    if (showToast) addToast('Data reset to defaults', 'info');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tasks_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addToast('JSON exported successfully');
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = ["ID", "Title", "Description", "Priority", "Category", "Status", "Start Date", "Deadline", "Created At"];
    
    // CSV Rows
    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${t.description.replace(/"/g, '""')}"`,
      t.priority,
      t.category,
      t.status,
      t.startDate,
      t.deadline,
      new Date(t.createdAt).toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tasks_export.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addToast('CSV exported successfully');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          if (event.target?.result) {
            const parsed = JSON.parse(event.target.result as string);
            if (Array.isArray(parsed)) {
              setTasks(parsed);
              logActivity('System', `Imported ${parsed.length} tasks from JSON`);
              addToast(`Imported ${parsed.length} tasks successfully`);
            } else {
              addToast('Invalid JSON format', 'error');
            }
          }
        } catch (error) {
          addToast('Error parsing file', 'error');
        }
      };
      // Reset input
      e.target.value = '';
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) return;

          const lines = text.split('\n');
          // Simple CSV parser (assuming standard CSV format exported by this app)
          const newTasks: Task[] = [];
          
          for(let i=1; i<lines.length; i++) {
            if(!lines[i].trim()) continue;
            
            // Basic split (Note: robust CSV parsing usually needs a library for edge cases with commas in quotes)
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            
            if (row && row.length >= 8) { // Updated for new column count
               // Cleanup quotes
               const clean = (str: string) => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"') : '';

               newTasks.push({
                 id: row[0] || generateId(),
                 title: clean(row[1]),
                 description: clean(row[2]),
                 priority: (clean(row[3]) as Priority) || 'Medium',
                 category: (clean(row[4]) as Category) || 'Work',
                 status: (clean(row[5]) as Status) || 'Pending',
                 startDate: clean(row[6]) || new Date().toISOString(),
                 deadline: clean(row[7]) || new Date().toISOString(),
                 createdAt: Date.now(),
                 subtasks: [],
                 isArchived: false,
                 deletedAt: null
               });
            }
          }

          if (newTasks.length > 0) {
            setTasks(prev => [...prev, ...newTasks]);
            logActivity('System', `Imported ${newTasks.length} tasks from CSV`);
            addToast(`Imported ${newTasks.length} tasks from CSV`);
          } else {
             addToast('No valid tasks found in CSV', 'error');
          }

        } catch (error) {
          console.error(error);
          addToast('Error parsing CSV file', 'error');
        }
      };
       // Reset input
       e.target.value = '';
    }
  }

  // --- Handlers: Tasks ---

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setNewTaskForm(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { id: generateId(), title: newSubtaskInput, completed: false }]
    }));
    setNewSubtaskInput('');
  };

  const removeSubtaskFromForm = (id: string) => {
    setNewTaskForm(prev => ({
      ...prev,
      subtasks: prev.subtasks?.filter(s => s.id !== id)
    }));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.deadline || !newTaskForm.startDate) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    if (new Date(newTaskForm.deadline) < new Date(newTaskForm.startDate)) {
        addToast('Deadline cannot be before Start Date', 'error');
        return;
    }

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...newTaskForm as any } : t));
      logActivity('Updated', newTaskForm.title!);
      addToast('Task updated successfully');
    } else {
      const newTask: Task = {
        id: generateId(),
        title: newTaskForm.title!,
        description: newTaskForm.description || '',
        startDate: newTaskForm.startDate!,
        deadline: newTaskForm.deadline!,
        priority: (newTaskForm.priority as Priority) || 'Medium',
        category: (newTaskForm.category as Category) || 'Work',
        status: 'Pending',
        createdAt: Date.now(),
        imageUrl: newTaskForm.imageUrl,
        subtasks: newTaskForm.subtasks || [],
        isArchived: false,
        deletedAt: null
      };
      setTasks(prev => [...prev, newTask]);
      logActivity('Created', newTask.title);
      addToast('New task created');
    }
    closeTaskModal();
  };

  const handleDeleteTask = (id: string) => {
    // Soft Delete
    if (window.confirm('Move this task to Recycle Bin?')) {
      const task = tasks.find(t => t.id === id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, deletedAt: Date.now() } : t));
      if (task) logActivity('Deleted', task.title);
      addToast('Moved to Recycle Bin', 'info');
    }
  };

  const handleRestoreTask = (id: string) => {
      const task = tasks.find(t => t.id === id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, deletedAt: null } : t));
      if (task) logActivity('Restored', task.title);
      addToast('Task restored', 'success');
  };

  const handlePermanentDelete = (id: string) => {
      if (window.confirm('Permanently delete this task? This cannot be undone.')) {
        setTasks(prev => prev.filter(t => t.id !== id));
        addToast('Task permanently deleted', 'error');
      }
  };

  const handleArchiveTask = (task: Task) => {
      const newArchivedStatus = !task.isArchived;
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isArchived: newArchivedStatus } : t));
      logActivity(newArchivedStatus ? 'Archived' : 'Restored', task.title);
      addToast(newArchivedStatus ? 'Task archived' : 'Task unarchived', 'info');
  };

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, status: newStatus } : t
      ));
      logActivity(newStatus === 'Completed' ? 'Completed' : 'Reopened', task.title);
    }
  };

  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newSubtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
      
      // Auto-update parent status logic
      // If ALL subtasks are completed -> Task is Completed
      // If ANY subtask is uncompleted -> Task is Pending (optional, but requested)
      const allCompleted = newSubtasks.length > 0 && newSubtasks.every(s => s.completed);
      
      return {
        ...t,
        subtasks: newSubtasks,
        status: allCompleted ? 'Completed' : 'Pending'
      };
    }));
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setNewTaskForm({
      title: '',
      description: '',
      startDate: new Date().toISOString().slice(0, 16),
      deadline: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // +1 hour
      priority: 'Medium',
      category: 'Work',
      imageUrl: '',
      subtasks: []
    });
    setNewSubtaskInput('');
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTaskForm({ 
        ...task, 
        startDate: task.startDate.slice(0, 16),
        deadline: task.deadline.slice(0, 16) 
    });
    setNewSubtaskInput('');
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
      // Open modal with pre-filled date
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      // Set time to current time but on selected date
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes());
      
      // Local time ISO string adjustment
      const tzOffset = selectedDate.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(selectedDate.getTime() - tzOffset)).toISOString().slice(0, 16);
      
      // Default deadline is 1 hour after start
      const deadlineDate = new Date(selectedDate.getTime() + 60 * 60 * 1000);
      const localISODeadline = (new Date(deadlineDate.getTime() - tzOffset)).toISOString().slice(0, 16);

      setEditingTask(null);
      setNewTaskForm({
          title: '',
          description: '',
          startDate: localISOTime,
          deadline: localISODeadline,
          priority: 'Medium',
          category: 'Work',
          imageUrl: '',
          subtasks: []
      });
      setNewSubtaskInput('');
      setIsTaskModalOpen(true);
  };

  // Drag and Drop Helpers for Calendar
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      e.dataTransfer.setData('taskId', taskId);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('taskId');
      if (!taskId) return;

      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Calculate new start date
      const newStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      // Keep original time of day
      const oldStartDate = new Date(task.startDate);
      newStartDate.setHours(oldStartDate.getHours(), oldStartDate.getMinutes());

      // Calculate duration to shift deadline
      const oldDeadline = new Date(task.deadline);
      const duration = oldDeadline.getTime() - oldStartDate.getTime();
      
      const newDeadline = new Date(newStartDate.getTime() + duration);

      // Update task
      setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, startDate: newStartDate.toISOString(), deadline: newDeadline.toISOString() } : t
      ));
      
      logActivity('Moved', task.title);
      addToast(`Moved task to ${formatDate(newStartDate.toISOString())}`);
  };

  // --- Effects ---

  // Load Data
  useEffect(() => {
    const storedUser = localStorage.getItem('utm_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedTheme = localStorage.getItem('utm_theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const storedTasks = localStorage.getItem('utm_tasks');
    const storedActivities = localStorage.getItem('utm_activities');

    if (storedTasks && JSON.parse(storedTasks).length > 0) {
      setTasks(JSON.parse(storedTasks));
      if (storedActivities) setActivities(JSON.parse(storedActivities));
    } else {
      // AUTO LOAD DEFAULT DATA IF EMPTY
      handleResetData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist Data
  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('utm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (activities.length > 0) localStorage.setItem('utm_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('utm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('utm_theme', 'light');
    }
  }, [darkMode]);

  // --- Derived State: Analytics & Notifications ---

  const stats = useMemo(() => {
    // Only count active tasks for main stats
    const activeTasks = tasks.filter(t => !t.deletedAt && !t.isArchived);
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const overdue = activeTasks.filter(t => t.status === 'Pending' && new Date(t.deadline).getTime() < Date.now()).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const notifications: NotificationItem[] = useMemo(() => {
      const activeTasks = tasks.filter(t => !t.deletedAt && !t.isArchived && t.status === 'Pending');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const notifs: NotificationItem[] = [];

      // Overdue Tasks
      activeTasks.forEach(t => {
          const due = new Date(t.deadline);
          if (due.getTime() < now.getTime()) {
              notifs.push({
                  id: `overdue-${t.id}`,
                  type: 'overdue',
                  message: `Task overdue: ${t.title}`,
                  timestamp: due.getTime(),
                  taskId: t.id
              });
          } else if (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime() === today.getTime()) {
              // Due Today
               notifs.push({
                  id: `due-${t.id}`,
                  type: 'due_today',
                  message: `Due today: ${t.title}`,
                  timestamp: due.getTime(),
                  taskId: t.id
              });
          }
      });

      // Recent Activity (System) - last 3
      activities.slice(0, 3).forEach(act => {
          notifs.push({
              id: `act-${act.id}`,
              type: 'activity',
              message: `${act.action}: ${act.target} by ${act.user}`,
              timestamp: act.timestamp
          });
      });

      // Sort by newest
      return notifs.sort((a, b) => b.timestamp - a.timestamp);
  }, [tasks, activities]);

  const priorityData = useMemo(() => {
    const activeTasks = tasks.filter(t => !t.deletedAt && !t.isArchived);
    const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    activeTasks.forEach(t => { if (t.status === 'Pending') counts[t.priority]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const monthlyActivityData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    // Last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayNum = date.getDate();
        
        const activeTasks = tasks.filter(t => !t.deletedAt && !t.isArchived);

        const pendingCount = activeTasks.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate.getDate() === date.getDate() && tDate.getMonth() === date.getMonth() && t.status === 'Pending';
        }).length;

        const completedCount = activeTasks.filter(t => {
             const tDate = new Date(t.createdAt);
             return t.status === 'Completed' && tDate.getDate() === date.getDate() && tDate.getMonth() === date.getMonth();
        }).length;

        data.push({
            name: dayNum, // Just the number
            completed: completedCount,
            pending: pendingCount
        });
    }
    return data;
  }, [tasks]);

  // --- Derived State: Filtered Tasks ---

  const filteredTasks = useMemo(() => {
    let baseTasks = tasks;

    if (currentView === 'recycle_bin') {
        baseTasks = tasks.filter(t => t.deletedAt !== null && t.deletedAt !== undefined);
    } else if (currentView === 'archived') {
        baseTasks = tasks.filter(t => t.isArchived && !t.deletedAt);
    } else {
        // Dashboard or My Tasks: show only active (not deleted, not archived)
        baseTasks = tasks.filter(t => !t.deletedAt && !t.isArchived);
    }

    return baseTasks
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
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      });
  }, [tasks, searchQuery, filterPriority, filterCategory, filterStatus, sortBy, currentView]);

  // --- Views ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 px-4">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-700">
            <CheckSquare className="w-8 h-8 text-primary-600 mr-2" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">TaskMaster</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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

             <button
              onClick={() => { setCurrentView('calendar'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'calendar' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <CalendarIcon size={20} />
              Calendar
            </button>
            
            <button
              onClick={() => { setCurrentView('archived'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'archived' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Archive size={20} />
              Archived
            </button>
            <button
              onClick={() => { setCurrentView('recycle_bin'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'recycle_bin' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Trash2 size={20} />
              Recycle Bin
            </button>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Data Management</p>
                
                {/* JSON Export */}
                <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                <Download size={16} /> Export JSON
                </button>
                
                {/* CSV Export */}
                <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                <FileSpreadsheet size={16} /> Export CSV (Excel)
                </button>

                {/* JSON Import */}
                <div className="relative">
                    <input 
                        type="file" 
                        accept=".json"
                        onChange={handleImportJSON}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg pointer-events-none"
                    >
                    <Upload size={16} /> Import JSON
                    </button>
                </div>

                {/* CSV Import */}
                 <div className="relative">
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleImportCSV}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg pointer-events-none"
                    >
                    <FileSpreadsheet size={16} /> Import CSV
                    </button>
                </div>

                {/* Reset Button */}
                <button
                    onClick={() => handleResetData(true)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-2"
                >
                    <RotateCcw size={16} /> Reset to Default
                </button>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
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
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
              {currentView.replace('_', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
                <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 relative"
                >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                    )}
                </button>
                
                {isNotificationsOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 animate-fadeIn overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setIsNotificationsOpen(false);
                                                if (notif.taskId) setCurrentView('tasks');
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                {notif.type === 'overdue' ? <AlertCircle size={16} className="text-red-500 mt-1 shrink-0" /> :
                                                 notif.type === 'due_today' ? <Clock size={16} className="text-amber-500 mt-1 shrink-0" /> :
                                                 <Info size={16} className="text-blue-500 mt-1 shrink-0" />}
                                                <div>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                                                    <span className="text-xs text-gray-400 mt-1 block">{formatTime(notif.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-slate-700 pl-4">
                <span className="font-medium mr-1">{getGreeting()},</span> {user.name}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          
          {currentView === 'calendar' ? (
              <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn h-full flex flex-col">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex-1 flex flex-col overflow-hidden">
                      {/* Calendar Header */}
                      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </h2>
                          <div className="flex gap-2">
                              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                  <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300"/>
                              </button>
                              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40">
                                  Today
                              </button>
                              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                  <ChevronRight size={20} className="text-gray-600 dark:text-gray-300"/>
                              </button>
                          </div>
                      </div>

                       {/* Calendar Days Header (Fixed) */}
                       <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-slate-700 last:border-r-0">
                                  {day}
                              </div>
                          ))}
                      </div>

                      {/* Calendar Grid Body (Scrollable & Flexible) */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-7 auto-rows-fr">
                            {/* Days Cells */}
                            {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[8rem] bg-gray-50/50 dark:bg-slate-900/30 border-b border-r border-gray-100 dark:border-slate-700 last:border-r-0"></div>
                            ))}
                            
                            {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                                const day = i + 1;
                                const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                // Filter tasks that span across this date
                                const dayTasks = tasks.filter(t => !t.deletedAt && !t.isArchived && isDateInRange(currentDayDate, t.startDate, t.deadline));
                                const isToday = new Date().toDateString() === currentDayDate.toDateString();

                                return (
                                    <div 
                                        key={day} 
                                        className={`min-h-[8rem] p-2 border-b border-r border-gray-100 dark:border-slate-700 last:border-r-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group relative`}
                                        onClick={() => handleDateClick(day)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, day)}
                                    >
                                        <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {day}
                                        </div>
                                        <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                            {dayTasks.map(t => {
                                                const isStartDay = new Date(t.startDate).toDateString() === currentDayDate.toDateString();
                                                return (
                                                <div 
                                                    key={t.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, t.id)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(t);
                                                    }}
                                                    className={`text-xs px-1.5 py-1 rounded truncate border-l-2 cursor-grab active:cursor-grabbing hover:opacity-80 shadow-sm ${
                                                        t.status === 'Completed' ? 'bg-gray-100 text-gray-500 border-gray-400 dark:bg-slate-700 dark:text-gray-400 line-through' :
                                                        t.priority === 'High' ? 'bg-red-50 text-red-700 border-red-500 dark:bg-red-900/20 dark:text-red-300' :
                                                        t.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-500 dark:bg-amber-900/20 dark:text-amber-300' :
                                                        'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300'
                                                    }`}
                                                    title={`${t.title} (${formatDate(t.startDate)} - ${formatDate(t.deadline)})`}
                                                >
                                                    {isStartDay && <span className="font-bold mr-1">★</span>}
                                                    {t.title}
                                                </div>
                                            )})}
                                        </div>
                                        {/* Add hint on hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                            <Plus className="text-gray-300 dark:text-gray-600 w-8 h-8" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                      </div>
                  </div>
              </div>
          ) : currentView === 'dashboard' ? (
            <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Tasks', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: <LayoutList size={24} /> },
                  { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <CheckCircle2 size={24} /> },
                  { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: <Clock size={24} /> },
                  { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: <AlertCircle size={24} /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts & Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Charts (Stacked) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Priority Chart - Improved Layout */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Priority Distribution</h3>
                        <div className="flex flex-col md:flex-row items-center justify-between h-64">
                            {/* Chart */}
                            <div className="w-full md:w-1/2 h-full">
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
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Custom Legend */}
                            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 pl-0 md:pl-8">
                                {priorityData.map((item) => {
                                    const total = priorityData.reduce((acc, curr) => acc + curr.value, 0);
                                    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                    return (
                                        <div key={item.name} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}></div>
                                                <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name} Priority</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-900 dark:text-white font-bold">{item.value}</span>
                                                <span className="text-xs text-gray-400 w-10 text-right">{percentage}%</span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {priorityData.every(i => i.value === 0) && (
                                     <p className="text-sm text-gray-400 text-center italic">No pending tasks to display</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Weekly Chart (Below Priority as requested) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">30 Days Activity</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyActivityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} interval={0} tick={{fontSize: 10}} />
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

                {/* Right Column: Activity Log */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full max-h-[800px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <History size={20} className="text-primary-500"/> Recent Activity
                        </h3>
                        <span className="text-xs text-gray-400">{activities.length} records</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {activities.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">No recent activity</div>
                        ) : (
                            activities.map(log => (
                                <div key={log.id} className="flex gap-3 items-start border-b border-gray-100 dark:border-slate-700 pb-3 last:border-0">
                                    <div className={`mt-1 p-1.5 rounded-full shrink-0 ${
                                        log.action === 'Created' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                        log.action === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        log.action === 'Deleted' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        log.action === 'Archived' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                        log.action === 'Moved' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                        {log.action === 'Created' && <Plus size={12} />}
                                        {log.action === 'Completed' && <Check size={12} />}
                                        {log.action === 'Deleted' && <Trash2 size={12} />}
                                        {log.action === 'Archived' && <Archive size={12} />}
                                        {log.action === 'Moved' && <ArrowRight size={12} />}
                                        {(log.action === 'Updated' || log.action === 'Reopened' || log.action === 'System' || log.action === 'Restored') && <Info size={12} />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            <span className="font-semibold">{log.action}:</span> {log.target}
                                        </p>
                                        <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                            <span>{formatTime(log.timestamp)}</span>
                                            <span>•</span>
                                            <span>{log.user}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn h-full flex flex-col">
              {/* Controls Toolbar */}
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 shrink-0">
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
                  </div>
                </div>

                <div className="flex gap-3 w-full xl:w-auto justify-between xl:justify-end">
                  <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      title="List View"
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      <ListIcon size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('board')}
                      title="Kanban Board"
                      className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      <Columns size={18} />
                    </button>
                  </div>
                  {currentView === 'tasks' && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary-500/20 font-medium text-sm"
                    >
                        <Plus size={18} />
                        Add Task
                    </button>
                  )}
                </div>
              </div>

              {/* Task Content Area */}
              {filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    {currentView === 'recycle_bin' ? <Trash2 className="w-8 h-8 text-gray-400" /> : <CheckSquare className="w-8 h-8 text-gray-400" />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {currentView === 'recycle_bin' ? 'Recycle Bin is empty' : 'No tasks found'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {currentView === 'recycle_bin' ? 'Deleted items will appear here.' : 'Try adjusting your filters or create a new task.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Kanban Board View */}
                  {viewMode === 'board' && (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                      <div className="flex gap-6 h-full min-w-[1000px]">
                        {/* Column: To Do (Pending) */}
                        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-800/50 rounded-xl p-4 h-full overflow-hidden">
                          <div className="flex items-center justify-between mb-4 px-2">
                             <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div> {currentView === 'recycle_bin' ? 'Deleted' : 'To Do'}
                             </h3>
                             <span className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded-full text-gray-500">{filteredTasks.filter(t => t.status === 'Pending').length}</span>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                             {filteredTasks.filter(t => t.status === 'Pending').map(task => (
                                <TaskCard 
                                  key={task.id} 
                                  task={task} 
                                  viewMode={viewMode}
                                  onEdit={openEditModal}
                                  onDelete={handleDeleteTask}
                                  onPermanentDelete={handlePermanentDelete}
                                  onRestore={handleRestoreTask}
                                  onArchive={handleArchiveTask}
                                  onToggleStatus={toggleTaskStatus}
                                  onToggleSubtask={toggleSubtaskStatus}
                                  isRecycleBin={currentView === 'recycle_bin'}
                                />
                             ))}
                          </div>
                        </div>

                        {/* Column: Completed */}
                        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-800/50 rounded-xl p-4 h-full overflow-hidden">
                          <div className="flex items-center justify-between mb-4 px-2">
                             <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Completed
                             </h3>
                             <span className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded-full text-gray-500">{filteredTasks.filter(t => t.status === 'Completed').length}</span>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                             {filteredTasks.filter(t => t.status === 'Completed').map(task => (
                                <TaskCard 
                                  key={task.id} 
                                  task={task}
                                  viewMode={viewMode}
                                  onEdit={openEditModal}
                                  onDelete={handleDeleteTask}
                                  onPermanentDelete={handlePermanentDelete}
                                  onRestore={handleRestoreTask}
                                  onArchive={handleArchiveTask}
                                  onToggleStatus={toggleTaskStatus}
                                  onToggleSubtask={toggleSubtaskStatus}
                                  isRecycleBin={currentView === 'recycle_bin'}
                                />
                             ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grid View */}
                  {viewMode === 'grid' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                       {filteredTasks.map(task => (
                         <TaskCard 
                            key={task.id} 
                            task={task} 
                            viewMode={viewMode}
                            onEdit={openEditModal}
                            onDelete={handleDeleteTask}
                            onPermanentDelete={handlePermanentDelete}
                            onRestore={handleRestoreTask}
                            onArchive={handleArchiveTask}
                            onToggleStatus={toggleTaskStatus}
                            onToggleSubtask={toggleSubtaskStatus}
                            isRecycleBin={currentView === 'recycle_bin'}
                         />
                       ))}
                     </div>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-3 pb-4">
                      {filteredTasks.map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          viewMode={viewMode}
                          onEdit={openEditModal}
                          onDelete={handleDeleteTask}
                          onPermanentDelete={handlePermanentDelete}
                          onRestore={handleRestoreTask}
                          onArchive={handleArchiveTask}
                          onToggleStatus={toggleTaskStatus}
                          onToggleSubtask={toggleSubtaskStatus}
                          isRecycleBin={currentView === 'recycle_bin'}
                        />
                      ))}
                    </div>
                  )}
                </>
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
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                required
                type="datetime-local"
                value={newTaskForm.startDate}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline (End)</label>
                <input
                required
                type="datetime-local"
                value={newTaskForm.deadline}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
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

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtasks (Checklist)</label>
             <div className="flex gap-2 mb-2">
                 <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtask();
                        }
                    }}
                    placeholder="Add a step..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                 />
                 <button type="button" onClick={handleAddSubtask} className="px-3 py-2 bg-gray-100 dark:bg-slate-600 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-500">
                    <Plus size={18} />
                 </button>
             </div>
             <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                 {newTaskForm.subtasks?.map(st => (
                     <div key={st.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg">
                         <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{st.title}</span>
                         <button type="button" onClick={() => removeSubtaskFromForm(st.id)} className="text-red-500 hover:text-red-700 p-1">
                             <X size={14} />
                         </button>
                     </div>
                 ))}
             </div>
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
                    <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 shrink-0">
                        <img src={newTaskForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
             </div>
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
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default App;