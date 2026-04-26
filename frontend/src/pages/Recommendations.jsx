import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Star, Clock, Play, Sparkles, Filter } from 'lucide-react';

export default function Recommendations() {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: 'Neural Networks Fundamentals',
      provider: 'AI Hub Academy',
      duration: '12h 30m',
      rating: 4.9,
      match: 98,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
      category: 'Deep Learning'
    },
    {
      id: 2,
      title: 'Advanced NLP with Transformers',
      provider: 'Tech Institute',
      duration: '18h 45m',
      rating: 4.8,
      match: 94,
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
      category: 'NLP'
    },
    {
      id: 3,
      title: 'AI Ethics and Governance',
      provider: 'Future Lab',
      duration: '6h 20m',
      rating: 4.7,
      match: 89,
      image: 'https://images.unsplash.com/photo-1676299081847-c0326a0333d5?auto=format&fit=crop&q=80&w=800',
      category: 'Ethics'
    }
  ];

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold">Initial Recommendations</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="glass-panel group rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-400 border border-indigo-500/30">
                    {course.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500 rounded-lg text-white text-xs font-bold shadow-lg shadow-indigo-500/40">
                    <Sparkles className="h-3 w-3" />
                    {course.match}% Match
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{course.provider}</p>
                
                <div className="flex items-center gap-4 text-slate-500 text-sm mb-6 mt-auto">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {course.rating}
                  </div>
                </div>

                <Button onClick={() => navigate('/course/1')} className="w-full group/btn">
                  Start Learning
                  <Play className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-white/10 text-center">
          <h2 className="text-2xl font-bold mb-4">Not what you're looking for?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">Tell our AI more about your specific needs, or explore the full catalog.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="px-8 border-slate-700">Browse All Courses</Button>
            <Button onClick={() => navigate('/chat')} className="px-8">Chat with AI Assistant</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
