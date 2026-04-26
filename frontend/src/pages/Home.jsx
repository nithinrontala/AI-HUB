import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, LogOut, BookOpen, User as UserIcon, Settings } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-slate-400 text-lg">Continue your learning journey where you left off.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div 
            onClick={() => navigate('/recommendations')}
            className="glass-panel p-6 rounded-2xl hover:border-indigo-500/50 transition-colors group cursor-pointer"
          >
            <div className="p-3 bg-indigo-500/10 rounded-xl w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
              <BookOpen className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">My Recommendations</h3>
            <p className="text-slate-400 text-sm">View personalized courses curated by our AI based on your profile.</p>
          </div>

          <div 
            onClick={() => navigate('/learning-path')}
            className="glass-panel p-6 rounded-2xl hover:border-purple-500/50 transition-colors group cursor-pointer"
          >
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
              <UserIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Learning Path</h3>
            <p className="text-slate-400 text-sm">Track your long-term milestones and AI career roadmap.</p>
          </div>

          <div 
            onClick={() => navigate('/progress')}
            className="glass-panel p-6 rounded-2xl hover:border-pink-500/50 transition-colors group cursor-pointer"
          >
            <div className="p-3 bg-pink-500/10 rounded-xl w-fit mb-4 group-hover:bg-pink-500/20 transition-colors">
              <Settings className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics & Progress</h3>
            <p className="text-slate-400 text-sm">Deep dive into your learning statistics and focus areas.</p>
          </div>

          <div 
            onClick={() => navigate('/chat')}
            className="glass-panel p-6 rounded-2xl hover:border-blue-500/50 transition-colors group cursor-pointer"
          >
            <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Chat Assistant</h3>
            <p className="text-slate-400 text-sm">Ask questions about your courses or get instant help.</p>
          </div>

          <div 
            onClick={() => navigate('/feedback')}
            className="glass-panel p-6 rounded-2xl hover:border-green-500/50 transition-colors group cursor-pointer"
          >
            <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4 group-hover:bg-green-500/20 transition-colors">
              <Zap className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Continuous Improvement</h3>
            <p className="text-slate-400 text-sm">Share your feedback to help us refine your learning experience.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
