import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Star, Clock, Play, Sparkles, Filter, Loader2, Users, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { api } from '../utils/api';

const tabs = [
  { id: 'hybrid', label: 'Hybrid Intelligence', icon: Zap, description: 'Best of both worlds' },
  { id: 'content', label: 'Content-Based', icon: Layers, description: 'Similar to what you like' },
  { id: 'collaborative', label: 'Collaborative', icon: Users, description: 'What others are learning' },
];

export default function Recommendations() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hybrid');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/recommendations/personalized?rec_type=${activeTab}&limit=6`);
        setCourses(data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [activeTab]);

  const getMatchColor = (score) => {
    if (score >= 0.8) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (score >= 0.5) return 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30';
    return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Smart Discovery</h1>
              <p className="text-slate-400 text-lg">AI-powered learning paths tailored for your success</p>
            </div>
          </div>
          
          <div className="flex p-1.5 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`relative z-10 h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description of active tab */}
        <div className="mb-12 px-6 py-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-indigo-300 font-medium text-sm">
                {tabs.find(t => t.id === activeTab)?.description}
            </p>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-[40px] opacity-20 animate-pulse"></div>
                <Loader2 className="h-16 w-16 text-indigo-500 animate-spin relative z-10" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white mb-2">Analyzing your profile</p>
                <p className="text-slate-500 animate-pulse">Matching with top-tier AI content...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-12 rounded-[3rem] text-center max-w-2xl mx-auto"
            >
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                <BrainCircuit className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
              <p className="text-slate-400 mb-8">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-500">Try Again</Button>
            </motion.div>
          ) : courses.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-slate-900/50 rounded-[3rem] border border-white/5 relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px]"></div>
              <div className="relative z-10">
                <div className="bg-slate-800/50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
                  <BrainCircuit className="h-12 w-12 text-slate-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">No insights yet</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">Start your journey by interacting with some courses so our AI can learn what you love.</p>
                <Button onClick={() => navigate('/')} className="px-8 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-lg font-bold">Explore Now</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {courses.map((course, index) => {
                const matchScore = course.score ? Math.min(Math.round(course.score * 100), 99) : Math.round((0.85 + Math.random() * 0.1) * 100);
                const scoreStyle = getMatchColor(matchScore / 100);
                
                return (
                  <motion.div 
                    key={course.id || index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-full hover:shadow-2xl hover:shadow-indigo-500/10"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img 
                        src={course.image_url || `https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800`} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/10">
                          {course.tags?.[0] || 'AI Intelligence'}
                        </span>
                      </div>

                      {/* Match Score */}
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-xl border font-black text-xs shadow-xl ${scoreStyle}`}>
                          <Sparkles className="h-4 w-4" />
                          {matchScore}% MATCH
                        </div>
                      </div>
                    </div>

                    <div className="p-8 pt-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">{course.title}</h3>
                      <p className="text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed">{course.description}</p>
                      
                      <div className="flex items-center gap-8 text-slate-500 text-xs font-bold mb-8 mt-auto">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Clock className="h-4 w-4 text-indigo-400" />
                          </div>
                          12.5h Total
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          4.9 Rating
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate(`/course/${course.id}`)} 
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-xl shadow-indigo-600/20 group/btn overflow-hidden relative"
                      >
                        <span className="relative z-10 flex items-center justify-center font-black tracking-wide text-lg">
                          ENROLL NOW
                          <Play className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform fill-current" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-16 rounded-[4rem] bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-white/10 relative overflow-hidden group text-center"
        >
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Still searching for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">perfect path?</span></h2>
            <p className="text-slate-400 mb-12 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
              Interact with our AI guide to dynamically refine your recommendations based on your evolving career aspirations.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="px-12 h-16 rounded-[1.25rem] border-white/10 hover:bg-white/5 text-lg font-black tracking-wide transition-all"
              >
                BROWSE CATALOG
              </Button>
              <Button 
                onClick={() => navigate('/chat')} 
                className="px-12 h-16 rounded-[1.25rem] bg-white text-slate-950 hover:bg-indigo-50 text-lg font-black tracking-wide shadow-2xl shadow-white/10"
              >
                START AI CHAT
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

