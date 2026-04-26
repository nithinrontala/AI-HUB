import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Clock, Flame, Award, BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react';

export default function Progress() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Study Hours', value: '42.5h', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Current Streak', value: '12 Days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Courses Done', value: '8', icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Skill Score', value: '840', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="bg-slate-950 text-white p-6 md:p-12 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Performance Analytics</h1>
            <p className="text-slate-400 text-lg">Tracking your evolution as an AI Engineer.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl border-slate-800 flex flex-col items-center text-center">
              <div className={`p-4 ${stat.bg} rounded-2xl mb-4`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] border-slate-800">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <BarChart3 className="h-5 w-5 text-indigo-400" />
                 Learning Consistency
               </h3>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold">WEEKLY</span>
                  <span className="px-3 py-1 text-slate-500 rounded-lg text-xs font-bold hover:bg-white/5 cursor-pointer">MONTHLY</span>
               </div>
            </div>
            
            {/* Mock Chart Bars */}
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                   <div className="w-full relative">
                      <div 
                        className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-all rounded-t-xl"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                   </div>
                   <span className="text-xs text-slate-500 font-bold">
                     {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                   </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Radar / Focus */}
          <div className="glass-panel p-8 rounded-[2.5rem] border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-purple-400" />
               Skill Radar
            </h3>
            <div className="space-y-6">
               {[
                 { skill: 'Deep Learning', progress: 85, color: 'bg-indigo-500' },
                 { skill: 'Mathematics', progress: 62, color: 'bg-purple-500' },
                 { skill: 'Programming', progress: 91, color: 'bg-emerald-500' },
                 { skill: 'NLP', progress: 48, color: 'bg-pink-500' },
                 { skill: 'Deployment', progress: 35, color: 'bg-orange-500' }
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{item.skill}</span>
                      <span className="font-bold">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <div 
                        className={`h-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.progress}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
               <p className="text-xs text-slate-500 mb-4">Focus on "Deployment" next to increase your career match by +14%</p>
               <Button variant="outline" className="w-full border-slate-700 text-xs py-2">Get Recommendation</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
