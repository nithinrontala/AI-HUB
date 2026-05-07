import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BrainCircuit, Send, Sparkles, MessageSquare, Search, Lightbulb, History, Trash2, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function ChatSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Learning Assistant. How can I help you progress in your learning journey today?" }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;
    
    const userMessage = query.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsTyping(true);
    
    try {
      const data = await api.post('/chatbot/', { message: userMessage });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting to the brain right now. Please try again later." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.post('/chatbot/reset');
      setMessages([{ role: 'assistant', content: "Chat history cleared. How can I help you now?" }]);
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar - Recent History */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
           <span className="font-bold text-sm tracking-widest uppercase text-slate-500">History</span>
            <Trash2 
              className="h-4 w-4 text-slate-600 hover:text-red-400 cursor-pointer transition-colors" 
              onClick={handleClearChat}
              title="Clear Chat History"
            />
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {['ReLU vs Sigmoid', 'Backprop Intuition', 'Setup PyTorch Environment', 'Learning Roadmap 2024'].map((item, i) => (
            <div key={i} className="p-3 rounded-xl hover:bg-white/5 cursor-pointer flex items-center gap-3 group">
              <MessageSquare className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" />
              <span className="text-sm text-slate-400 group-hover:text-slate-200 truncate">{item}</span>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-800">
           <Button variant="outline" className="w-full border-slate-700" onClick={() => navigate('/learning-path')}>
             <History className="h-4 w-4 mr-2" />
             Full Roadmap
           </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg">
               <BrainCircuit className="h-5 w-5 text-indigo-400" />
             </div>
             <h1 className="font-bold">AI Assistant</h1>
          </div>
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[80%] p-4 rounded-2xl flex gap-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'glass-panel border-slate-800'}`}>
                  {msg.role === 'assistant' && (
                    <div className="mt-1 h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="max-w-[80%] p-4 rounded-2xl flex gap-4 glass-panel border-slate-800">
                  <div className="mt-1 h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Assistant is thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
               {['Explain Neural Networks', 'Recommend ML courses', 'Help with PyTorch', 'What is Gradient Descent?'].map(suggestion => (
                 <button 
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    // Optionally auto-trigger send
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-all flex items-center gap-2"
                 >
                   <Lightbulb className="h-3 w-3" />
                   {suggestion}
                 </button>
               ))}
            </div>
            
            <form onSubmit={handleSend} className="relative">
              <Input 
                placeholder="Ask anything..." 
                className="pr-12 h-14 rounded-2xl bg-slate-900 border-slate-800 focus:border-indigo-500 disabled:opacity-50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isTyping}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
