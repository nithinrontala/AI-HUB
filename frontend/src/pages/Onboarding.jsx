import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Sparkles, Target, Zap, Rocket, ChevronRight } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState([]);

  const topics = [
    { id: 'ml', name: 'Machine Learning', icon: BrainCircuit },
    { id: 'nlp', name: 'Natural Language Processing', icon: Sparkles },
    { id: 'cv', name: 'Computer Vision', icon: Target },
    { id: 'da', name: 'Data Analysis', icon: Zap },
    { id: 'rl', name: 'Reinforcement Learning', icon: Rocket },
  ];

  const toggleInterest = (id) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarded', 'true');
      navigate('/recommendations');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-2xl w-full z-10">
        <div className="mb-12 flex justify-center">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="animate-slide-up">
            <h1 className="text-4xl font-bold mb-4 text-center">What brings you to AI Hub?</h1>
            <p className="text-slate-400 text-center mb-10 text-lg">Help us customize your learning path.</p>
            
            <div className="grid grid-cols-1 gap-4">
              {['Career Transition', 'Upskilling for Work', 'Personal Interest', 'Academic Research'].map(goal => (
                <button 
                  key={goal}
                  onClick={handleNext}
                  className="glass-panel p-5 rounded-2xl border-slate-800 hover:border-indigo-500/50 hover:bg-white/5 transition-all text-left flex justify-between items-center group"
                >
                  <span className="text-lg font-medium">{goal}</span>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h1 className="text-4xl font-bold mb-4 text-center">Select your interests</h1>
            <p className="text-slate-400 text-center mb-10 text-lg">Pick at least 3 to get better recommendations.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {topics.map(topic => {
                const Icon = topic.icon;
                const isSelected = interests.includes(topic.id);
                return (
                  <button 
                    key={topic.id}
                    onClick={() => toggleInterest(topic.id)}
                    className={`glass-panel p-6 rounded-2xl border-slate-800 transition-all flex flex-col items-center gap-3 ${isSelected ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50' : 'hover:border-slate-700'}`}
                  >
                    <Icon className={`h-8 w-8 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{topic.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-10">
              <Button onClick={handleNext} className="w-full h-14 text-lg">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up text-center">
            <div className="mb-6 inline-flex p-4 bg-indigo-500/20 rounded-full border border-indigo-500/30">
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Generating your path...</h1>
            <p className="text-slate-400 mb-10 text-lg">Our AI is analyzing your preferences to create a custom curriculum.</p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-progress"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-mono uppercase tracking-widest">
                <span>Analyzing Goals</span>
                <span>85%</span>
              </div>
            </div>
            
            <div className="mt-12">
              <Button onClick={handleNext} className="px-8">
                View Recommendations
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
