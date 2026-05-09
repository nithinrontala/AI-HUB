import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Clock, Flame, Award, BarChart3, TrendingUp, Calendar, Zap, Loader2, Trophy, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_BASE_URL = "http://localhost:8000";

export default function Progress() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const headers = { "Authorization": `Bearer ${token}` };
        
        const [statsRes, lbRes] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/stats`, { headers }),
          fetch(`${API_BASE_URL}/dashboard/leaderboard`, { headers })
        ]);

        if (!statsRes.ok) {
          const errData = await statsRes.json().catch(() => ({}));
          throw new Error(errData.detail || `Error ${statsRes.status}: Failed to fetch stats`);
        }
        
        const statsData = await statsRes.json();
        const lbData = lbRes.ok ? await lbRes.json() : [];
        
        setData(statsData);
        setLeaderboard(lbData);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message === "Failed to fetch" 
          ? "Cannot connect to server. Please ensure the backend is running at http://localhost:8000" 
          : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center text-white p-6">
        <div className="glass-panel p-10 rounded-[2rem] border-red-500/20 text-center max-w-md">
          <div className="p-4 bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
             <Zap className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.reload()} className="w-full">Try Again</Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full border-slate-800">Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Courses Enrolled', value: data.enrolled_count, icon: BrainCircuit, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Learning Points', value: data.total_points, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Courses Completed', value: data.completed_count, icon: Award, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Global Rank', value: `#${leaderboard.findIndex(u => u.name === data.name) + 1 || '10+' }`, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const chartData = data.activity.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: item.count
  }));

  return (
    <div className="bg-slate-950 text-white p-6 md:p-12 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {data.name}</h1>
            <p className="text-slate-400 text-lg">Tracking your evolution as an AI Engineer.</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/learning-path')} variant="outline" className="border-slate-800">
              View Learning Path
            </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] border-slate-800">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <BarChart3 className="h-5 w-5 text-indigo-400" />
                 Learning Consistency
               </h3>
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last 7 Days</div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#6366f1' : '#312e81'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Mastery */}
          <div className="glass-panel p-8 rounded-[2.5rem] border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-purple-400" />
               Skill Mastery
            </h3>
            <div className="space-y-6">
               {data.skills.length > 0 ? data.skills.slice(0, 5).map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{item.skill}</span>
                      <span className="font-bold">{Math.round(item.progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500" style={{ width: `${item.progress}%` }}></div>
                    </div>
                 </div>
               )) : (
                 <p className="text-slate-500 text-center py-8 text-sm italic">Enroll in courses to track skills</p>
               )}
            </div>
            <Button onClick={() => navigate('/chat')} variant="outline" className="w-full mt-8 border-slate-800 text-xs py-2">Explore Skills</Button>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="glass-panel p-8 rounded-[2.5rem] border-slate-800">
           <div className="flex items-center gap-2 mb-8">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h3 className="text-2xl font-bold">Global Leaderboard</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                 {leaderboard.length > 0 ? leaderboard.map((user, i) => (
                   <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                     user.name === data.name ? 'bg-indigo-500/10 border-indigo-500/50' : 
                     i === 0 ? 'bg-yellow-500/5 border-yellow-500/20 shadow-lg shadow-yellow-500/5' : 'bg-slate-900/50 border-slate-800'
                   }`}>
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            i === 0 ? 'bg-yellow-500 text-slate-950' : 
                            i === 1 ? 'bg-slate-300 text-slate-950' :
                            i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                         }`}>
                            {i + 1}
                         </div>
                         <div>
                            <div className="font-bold">{user.name} {user.name === data.name && '(You)'}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">{i === 0 ? 'Top Performer' : 'Elite Learner'}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-lg font-bold text-indigo-400">{user.points}</div>
                         <div className="text-[10px] text-slate-500 font-bold uppercase">Points</div>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-12 text-slate-500 italic">No leaderboard data available yet.</div>
                 )}
              </div>
              
              <div className="bg-indigo-600/10 rounded-[2rem] p-8 border border-indigo-500/20 flex flex-col justify-center items-center text-center">
                 <div className="p-5 bg-indigo-500 rounded-3xl mb-6 shadow-xl shadow-indigo-500/20">
                    <Medal className="h-10 w-10 text-white" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Climb the Ranks</h4>
                 <p className="text-slate-400 text-sm max-w-xs mb-6">Complete quizzes and courses to earn Learning Points and unlock exclusive AI-Hub badges.</p>
                 <Button onClick={() => navigate('/recommendations')} className="bg-indigo-500 hover:bg-indigo-400 px-8">Earn Points Now</Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
