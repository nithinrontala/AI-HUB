import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Star, Clock, Play, Sparkles, Filter, Loader2 } from 'lucide-react';

export default function Recommendations() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/recommendations/personalized?limit=6', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
              <Sparkles className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Personalized for You</h1>
              <p className="text-slate-400">Hybrid AI recommendations based on your profile and peers</p>
            </div>
          </div>
          <Button variant="outline" className="border-slate-800 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Calculating your perfect matches...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/50 rounded-[3rem] border border-white/5">
            <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="h-10 w-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No recommendations yet</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">Start interacting with courses or complete your profile to unlock personalized suggestions.</p>
            <Button onClick={() => navigate('/')}>Explore Catalog</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={course.id || index} className="glass-panel group rounded-[2rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500 flex flex-col border border-white/5">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={course.image_url || `https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800`} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-indigo-500/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-300 border border-indigo-500/30">
                      {course.tags?.[0] || 'AI Course'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 rounded-xl text-white text-xs font-black shadow-xl shadow-indigo-500/40">
                      <Sparkles className="h-3.5 w-3.5" />
                      {Math.round((0.85 + Math.random() * 0.14) * 100)}% MATCH
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col bg-slate-900/40">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors leading-tight">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-6 text-slate-500 text-xs font-medium mb-8 mt-auto">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      12h 30m
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      4.9 Rating
                    </div>
                  </div>

                  <Button onClick={() => navigate(`/course/${course.id}`)} className="w-full group/btn h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-500/20">
                    <span className="font-bold">Start Learning</span>
                    <Play className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform fill-current" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-indigo-900/60 via-slate-900 to-purple-900/60 border border-white/10 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Want more specific suggestions?</h2>
            <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
              Our AI can refine your path based on your specific career goals and technical background.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="px-10 h-14 rounded-2xl border-slate-700 hover:bg-slate-800 text-lg font-bold">Browse Catalog</Button>
              <Button onClick={() => navigate('/chat')} className="px-10 h-14 rounded-2xl bg-white text-slate-950 hover:bg-indigo-50 text-lg font-bold">Refine with AI</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

