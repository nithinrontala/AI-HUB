import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Play, CheckCircle2, Lock, MessageSquare, ChevronDown, List, Award, TrendingUp } from 'lucide-react';

export default function CourseDetail() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(0);

  const modules = [
    {
      title: 'Introduction to Neural Architecture',
      lessons: [
        { title: 'The Biological Inspiration', duration: '12:45', completed: true },
        { title: 'Perceptrons and Linear Separability', duration: '15:20', completed: true },
        { title: 'Activation Functions Deep Dive', duration: '22:10', active: true }
      ]
    },
    {
      title: 'Backpropagation and Optimization',
      lessons: [
        { title: 'The Chain Rule Visualized', duration: '18:30', locked: false },
        { title: 'Gradient Descent Variants', duration: '25:15', locked: false },
        { title: 'Vanishing Gradient Problem', duration: '20:00', locked: false }
      ]
    },
    {
      title: 'Convolutional Neural Networks',
      lessons: [
        { title: 'Spatial Invariance', duration: '14:20', locked: true },
        { title: 'Kernel Operations', duration: '19:40', locked: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar - Course Content */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/30 overflow-y-auto hidden lg:block">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">35% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full">
            <div className="h-full w-[35%] bg-indigo-500 rounded-full"></div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {modules.map((module, mIdx) => (
            <div key={mIdx} className="space-y-2">
              <button 
                onClick={() => setActiveModule(mIdx === activeModule ? -1 : mIdx)}
                className="w-full flex items-center justify-between p-2 text-sm font-semibold text-slate-300 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <List className="h-4 w-4 text-slate-500" />
                  Module {mIdx + 1}: {module.title}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${activeModule === mIdx ? 'rotate-180' : ''}`} />
              </button>
              
              {activeModule === mIdx && (
                <div className="space-y-1 pl-4">
                  {module.lessons.map((lesson, lIdx) => (
                    <div 
                      key={lIdx} 
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${lesson.active ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-2">
                        {lesson.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                         lesson.locked ? <Lock className="h-3.5 w-3.5 text-slate-600" /> :
                         <Play className={`h-3.5 w-3.5 ${lesson.active ? 'text-indigo-400' : 'text-slate-500'}`} />}
                        <span className="truncate w-40">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] opacity-60">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center px-6">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/recommendations')} className="text-slate-400 hover:text-white">
               <ChevronDown className="h-6 w-6 rotate-90" />
             </button>
             <h2 className="font-semibold text-sm truncate max-w-md">Activation Functions Deep Dive</h2>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => navigate('/chat')} className="border-slate-700">
               <MessageSquare className="h-4 w-4 mr-2" />
               Ask AI
             </Button>
             <Button size="sm">Next Lesson</Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {/* Video Placeholder */}
          <div className="aspect-video w-full max-w-5xl mx-auto rounded-3xl bg-slate-900 border border-white/5 shadow-2xl relative flex items-center justify-center overflow-hidden mb-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent"></div>
            <div className="p-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 cursor-pointer hover:scale-110 transition-transform">
              <Play className="h-10 w-10 fill-white" />
            </div>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">Activation Functions Deep Dive</h1>
                <p className="text-slate-400 leading-relaxed">
                  In this lesson, we explore how activation functions introduce non-linearity into neural networks, enabling them to learn complex patterns. We'll compare ReLU, Sigmoid, and Tanh, and discuss why ReLU has become the industry standard for deep architectures.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="glass-panel p-4 rounded-2xl flex-1 flex items-center gap-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Earned Points</div>
                    <div className="text-xl font-bold">+150 XP</div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex-1 flex items-center gap-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Current Streak</div>
                    <div className="text-xl font-bold">5 Days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 bg-indigo-500/5">
                <h4 className="flex items-center gap-2 font-bold mb-4 text-indigo-400">
                  <BrainCircuit className="h-5 w-5" />
                  Hybrid Recommendation
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Since you're learning about non-linearity, you might be interested in our interactive "Vanishing Gradient" lab next.
                </p>
                <Button variant="outline" className="w-full text-xs border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                  Save to Path
                </Button>
              </div>
              
              <div className="p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold">Resources</h4>
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-sm p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                     <span className="text-slate-400">Lecture Slides (PDF)</span>
                     <ChevronDown className="h-4 w-4 rotate-[-90deg] text-slate-600" />
                   </div>
                   <div className="flex items-center justify-between text-sm p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                     <span className="text-slate-400">PyTorch Implementation</span>
                     <ChevronDown className="h-4 w-4 rotate-[-90deg] text-slate-600" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
