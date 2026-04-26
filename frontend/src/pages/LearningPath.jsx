import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, CheckCircle2, Circle, ChevronRight, Star, Target, Zap, Clock } from 'lucide-react';

export default function LearningPath() {
  const navigate = useNavigate();

  const path = [
    { title: 'Neural Network Basics', status: 'completed', duration: '5 days' },
    { title: 'Deep Architectures', status: 'active', duration: 'Currently learning' },
    { title: 'Transformers & NLP', status: 'locked', duration: '2 weeks estimated' },
    { title: 'AI for Production', status: 'locked', duration: '1 month estimated' },
  ];

  return (
    <div className="bg-slate-950 text-white p-6 md:p-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
               <BrainCircuit className="h-8 w-8 text-indigo-400" />
             </div>
             <div>
               <h1 className="text-3xl font-bold">Your Learning Path</h1>
               <p className="text-slate-400">Mastering Machine Learning Specialist</p>
             </div>
          </div>
        </header>

        <div className="space-y-0 relative">
          {/* Vertical Line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-800"></div>

          {path.map((step, i) => (
            <div key={i} className="relative pl-16 pb-12 group last:pb-0">
              {/* Node Icon */}
              <div className={`absolute left-0 top-0 h-14 w-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                step.status === 'completed' ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20' :
                step.status === 'active' ? 'bg-indigo-500 border-indigo-500 shadow-xl shadow-indigo-500/30 scale-110' :
                'bg-slate-900 border-slate-800 opacity-60'
              }`}>
                {step.status === 'completed' ? <CheckCircle2 className="h-6 w-6 text-green-500" /> :
                 step.status === 'active' ? <Zap className="h-6 w-6 text-white animate-pulse" /> :
                 <Circle className="h-6 w-6 text-slate-700" />}
              </div>

              <div className={`glass-panel p-6 rounded-3xl transition-all duration-300 ${
                step.status === 'active' ? 'border-indigo-500/50 bg-indigo-500/5' : 'hover:border-slate-700'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                         step.status === 'completed' ? 'text-green-500' : 
                         step.status === 'active' ? 'text-indigo-400' : 'text-slate-600'
                       }`}>
                         {step.status}
                       </span>
                     </div>
                     <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                     <div className="flex items-center gap-4 text-sm text-slate-500">
                       <div className="flex items-center gap-1">
                         <Clock className="h-4 w-4" />
                         {step.duration}
                       </div>
                       {step.status === 'completed' && (
                         <div className="flex items-center gap-1 text-yellow-500">
                           <Star className="h-4 w-4 fill-yellow-500" />
                           Top Performer
                         </div>
                       )}
                     </div>
                   </div>
                   
                   {step.status === 'active' && (
                     <Button onClick={() => navigate('/course/1')} className="md:w-auto">
                       Resume Now
                       <ChevronRight className="ml-2 h-4 w-4" />
                     </Button>
                   )}
                </div>

                {step.status === 'active' && (
                  <div className="mt-6 pt-6 border-t border-indigo-500/20">
                     <div className="flex justify-between text-xs font-bold mb-2 text-indigo-300">
                       <span>Topic Mastery</span>
                       <span>72%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full w-[72%] bg-indigo-500"></div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Career Milestone */}
        <div className="mt-20 p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="p-5 bg-white/20 backdrop-blur-xl rounded-3xl">
              <Target className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Final Milestone</h2>
              <p className="text-indigo-100 mb-6 text-lg">Achieve "Senior AI Practitioner" status and unlock your career portfolio.</p>
              <Button variant="outline" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none px-8 font-bold">View Portfolio Perks</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
