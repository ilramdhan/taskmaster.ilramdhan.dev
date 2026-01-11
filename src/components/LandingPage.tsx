import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CheckSquare,
    LayoutDashboard,
    Calendar,
    BarChart3,
    Moon,
    Sun,
    ArrowRight,
    Zap,
    Shield,
    Download
} from 'lucide-react';

interface LandingPageProps {
    user: { username: string; name: string } | null;
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, darkMode, setDarkMode }) => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <CheckSquare className="w-8 h-8" />,
            title: 'Task Management',
            description: 'Create, organize, and track tasks with priorities, categories, and subtasks'
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: 'Calendar View',
            description: 'Visualize your schedule with drag-and-drop calendar integration'
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: 'Analytics Dashboard',
            description: 'Track your productivity with beautiful charts and insights'
        },
        {
            icon: <Download className="w-8 h-8" />,
            title: 'Import & Export',
            description: 'Backup your data with JSON and CSV export/import support'
        },
        {
            icon: <Moon className="w-8 h-8" />,
            title: 'Dark Mode',
            description: 'Easy on the eyes with warm dark mode support'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Privacy First',
            description: 'All data stored locally in your browser - no server required'
        }
    ];

    return (
        <div className="min-h-screen bg-warm-50 dark:bg-warm-900 transition-colors">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-50/80 dark:bg-warm-800/80 backdrop-blur-md border-b border-warm-200 dark:border-warm-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <CheckSquare className="w-8 h-8 text-primary-600" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                                TaskMaster
                            </span>
                        </Link>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                            >
                                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary-600/20 font-medium text-sm"
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary-600/20 font-medium text-sm"
                                >
                                    Login
                                    <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Zap size={16} />
                        100% Client-Side • No Server Required
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-warm-900 dark:text-warm-50 mb-6 leading-tight">
                        Manage Your Tasks
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">
                            Like a Pro
                        </span>
                    </h1>

                    <p className="text-xl text-warm-600 dark:text-warm-400 mb-10 max-w-2xl mx-auto">
                        A comprehensive task management dashboard with calendar view, analytics,
                        and everything you need to stay organized and productive.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(user ? '/dashboard' : '/login')}
                            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary-600/30 font-semibold text-lg"
                        >
                            {user ? 'Go to Dashboard' : 'Get Started'}
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-warm-100 dark:bg-warm-800/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-warm-900 dark:text-warm-50 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-lg text-warm-600 dark:text-warm-400">
                            Powerful features to help you manage tasks efficiently
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-warm-50 dark:bg-warm-800 p-6 rounded-xl border border-warm-200 dark:border-warm-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
                            >
                                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-warm-900 dark:text-warm-50 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-warm-600 dark:text-warm-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Get Organized?
                        </h2>
                        <p className="text-lg text-white/80 mb-8">
                            Start managing your tasks today. No signup required - just login and go!
                        </p>
                        <button
                            onClick={() => navigate(user ? '/dashboard' : '/login')}
                            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-warm-100 transition-colors"
                        >
                            {user ? 'Open Dashboard' : 'Start Now'}
                            <ArrowRight size={20} />
                        </button>
                        <p className="mt-4 text-sm text-white/60">
                            Demo: username <strong>admin</strong> / password <strong>123</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-warm-200 dark:border-warm-700">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-primary-600" />
                        <span className="font-semibold text-warm-900 dark:text-warm-50">TaskMaster</span>
                    </div>
                    <p className="text-sm text-warm-500 dark:text-warm-400">
                        Built with React + TypeScript + Vite • All data stored locally
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
