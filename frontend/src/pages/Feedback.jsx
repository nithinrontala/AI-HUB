import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, MessageCircle, Heart, Star, Send, Sparkles, ThumbsUp } from 'lucide-react';

export default function Feedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleFinish = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-indigo-500/10 to-transparent pointer-events-none"></div>

       <div className="max-w-xl w-full z-10 text-center">
          {!submitted ? (
            <div className="glass-panel p-10 rounded-[3rem] border-slate-800 animate-slide-up">
               <div className="mb-8 inline-flex p-5 bg-pink-500/10 rounded-3xl border border-pink-500/20">
                 <Heart className="h-10 w-10 text-pink-400 fill-pink-400" />
               </div>
               
               <h1 className="text-4xl font-bold mb-4">Continuous Improvement</h1>
               <p className="text-slate-400 mb-10 text-lg">Your feedback trains our AI to serve you better. How was your experience today?</p>
               
               <div className="flex justify-center gap-4 mb-10">
                 {[1, 2, 3, 4, 5].map(i => (
                   <button 
                    key={i} 
                    onClick={() => setRating(i)}
                    className={`h-14 w-14 rounded-2xl border transition-all flex items-center justify-center ${
                      rating >= i ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-500/30' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'
                    }`}
                   >
                     <Star className={`h-6 w-6 ${rating >= i ? 'fill-white' : ''}`} />
                   </button>
                 ))}
               </div>

               <div className="relative mb-10">
                 <textarea 
                  placeholder="What can we do to improve your path?"
                  className="w-full h-32 bg-slate-900 border-slate-800 rounded-2xl p-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600 resize-none"
                 ></textarea>
                 <div className="absolute bottom-3 right-3">
                   <div className="flex items-center gap-2 px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                     <Sparkles className="h-3 w-3 text-indigo-400" />
                     <span className="text-[10px] font-bold text-indigo-400">AI SENTIMENT ANALYZER ACTIVE</span>
                   </div>
                 </div>
               </div>

               <Button onClick={handleFinish} className="w-full h-14 text-lg font-bold" disabled={rating === 0}>
                 Submit Feedback
                 <Send className="ml-2 h-5 w-5" />
               </Button>
            </div>
          ) : (
            <div className="animate-bounce-in">
               <div className="mb-8 inline-flex p-6 bg-green-500/20 rounded-full border border-green-500/30">
                 <ThumbsUp className="h-16 w-16 text-green-400" />
               </div>
               <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Thank You!</h1>
               <p className="text-slate-400 text-xl">Your feedback has been ingested into our neural network. Returning to dashboard...</p>
            </div>
          )}
       </div>
    </div>
  );
}
