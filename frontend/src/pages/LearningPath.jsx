import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, CheckCircle2, Circle, ChevronRight, Star, Target, Zap, Clock, Loader2, Plus, Sparkles } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000";

export default function LearningPath() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetSkill, setTargetSkill] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/learning-paths/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch learning paths");
      const result = await response.json();
      setPaths(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPath = async (e) => {
    e.preventDefault();
    if (!targetSkill) return;

    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/learning-paths/generate?target_skill=${encodeURIComponent(targetSkill)}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to generate learning path");
      const newPath = await response.json();
      setPaths([newPath, ...paths]);
      setTargetSkill("");
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const activePath = paths[0]; // For now, show the most recent one

  return (
    <div className="bg-slate-950 text-white p-6 md:p-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
               <BrainCircuit className="h-8 w-8 text-indigo-400" />
             </div>
             <div>
               <h1 className="text-3xl font-bold">Learning Journeys</h1>
               <p className="text-slate-400">Personalized paths based on your goals</p>
             </div>
          </div>
          <Button onClick={() => navigate('/progress')} variant="outline" className="border-slate-800">
            View Analytics
          </Button>
        </header>

        {/* Generate Path Section */}
        <div className="glass-panel p-8 rounded-[2rem] border-slate-800 mb-12 bg-indigo-500/5">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            Generate New Learning Path
          </h2>
          <form onSubmit={generateNewPath} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="What skill do you want to master? (e.g. Computer Vision, NLP)" 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              disabled={generating}
            />
            <Button type="submit" disabled={generating || !targetSkill} className="sm:w-auto">
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Generate Path
            </Button>
          </form>
        </div>

        {activePath ? (
          <div className="space-y-0 relative">
            <h2 className="text-2xl font-bold mb-8 text-indigo-300">{activePath.title}</h2>
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-[75px] bottom-4 w-0.5 bg-slate-800"></div>

            {activePath.steps.map((step, i) => (
              <div key={i} className="relative pl-16 pb-12 group last:pb-0">
                {/* Node Icon */}
                <div className={`absolute left-0 top-0 h-14 w-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                  step.is_completed ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20' :
                  i === activePath.steps.findIndex(s => !s.is_completed) ? 'bg-indigo-500 border-indigo-500 shadow-xl shadow-indigo-500/30 scale-110' :
                  'bg-slate-900 border-slate-800 opacity-60'
                }`}>
                  {step.is_completed ? <CheckCircle2 className="h-6 w-6 text-green-500" /> :
                   i === activePath.steps.findIndex(s => !s.is_completed) ? <Zap className="h-6 w-6 text-white animate-pulse" /> :
                   <Circle className="h-6 w-6 text-slate-700" />}
                </div>

                <div className={`glass-panel p-6 rounded-3xl transition-all duration-300 ${
                  !step.is_completed && i === activePath.steps.findIndex(s => !s.is_completed) ? 'border-indigo-500/50 bg-indigo-500/5' : 'hover:border-slate-700'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                           step.is_completed ? 'text-green-500' : 
                           i === activePath.steps.findIndex(s => !s.is_completed) ? 'text-indigo-400' : 'text-slate-600'
                         }`}>
                           {step.is_completed ? 'Completed' : i === activePath.steps.findIndex(s => !s.is_completed) ? 'In Progress' : 'Upcoming'}
                         </span>
                       </div>
                       <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                       <div className="flex items-center gap-4 text-sm text-slate-500">
                         <div className="flex items-center gap-1">
                           <Clock className="h-4 w-4" />
                           Estimated 2 weeks
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex gap-2">
                        <Button onClick={() => navigate(`/course/${step.course_id}`)} variant={step.is_completed ? "outline" : "default"} className="md:w-auto">
                          {step.is_completed ? "Review" : "Start Learning"}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-[3rem] border border-slate-800 border-dashed">
            <Target className="h-16 w-16 text-slate-700 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">No Active Learning Path</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Generate a personalized journey by entering a skill you'd like to master above.</p>
          </div>
        )}

        {/* Career Milestone */}
        <div className="mt-20 p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="p-5 bg-white/20 backdrop-blur-xl rounded-3xl">
              <Award className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Ready for Certification?</h2>
              <p className="text-indigo-100 mb-6 text-lg">Complete all steps in your path to unlock the final capstone project and earn your badge.</p>
              <Button variant="outline" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none px-8 font-bold">View Credentials</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
