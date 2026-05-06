import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { BrainCircuit, LogOut, Home, BookOpen, MessageSquare, BarChart3, Target, MessageCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Recommendations', path: '/recommendations', icon: BookOpen },
    { name: 'Learning Path', path: '/learning-path', icon: Target },
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Feedback', path: '/feedback', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden xl:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <BrainCircuit className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">AI HUB</span>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile / Compact Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center px-6 xl:hidden justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-500" />
            <span className="font-bold">AI HUB</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
