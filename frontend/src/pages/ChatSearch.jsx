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
  const [view, setView] = useState('chat'); // 'chat' or 'search'
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' or 'keyword'
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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
    
    if (view === 'search') {
      handleSearch();
      return;
    }

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

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    
    setIsSearching(true);
    setView('search');
    
    try {
      const data = await api.get(`/courses/search/?q=${encodeURIComponent(query)}&mode=${searchMode}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
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
             <div className="flex bg-slate-800/50 p-1 rounded-xl">
               <button 
                onClick={() => setView('chat')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 Chat
               </button>
               <button 
                onClick={() => setView('search')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 Search
               </button>
             </div>
          </div>
          
          {view === 'search' && (
            <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-700/50">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Semantic</span>
              <button 
                onClick={() => setSearchMode(searchMode === 'semantic' ? 'keyword' : 'semantic')}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${searchMode === 'semantic' ? 'bg-indigo-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${searchMode === 'semantic' ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {view === 'chat' ? (
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
          ) : (
            <div className="max-w-5xl mx-auto space-y-8">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  <p className="text-slate-400 animate-pulse">Scanning knowledge base semantically...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {searchResults.map((course, idx) => (
                    <div 
                      key={course.id || idx}
                      className="group bg-slate-900/40 rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                          {course.tags?.[0] || 'AI Course'}
                        </span>
                        {course.similarity && (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black">
                            <Sparkles className="h-3 w-3" />
                            {Math.round(course.similarity * 100)}% RELEVANCE
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{course.title}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-6 flex-1">{course.description}</p>
                      <div className="flex items-center justify-between">
                         <div className="flex gap-2">
                           {course.tags?.slice(0, 2).map(tag => (
                             <span key={tag} className="text-[10px] text-slate-500">#{tag}</span>
                           ))}
                         </div>
                         <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-xl px-4"
                          onClick={() => navigate(`/course/${course.id}`)}
                         >
                           View Details
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 space-y-4">
                   <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto border border-slate-800">
                     <Search className="h-8 w-8 text-slate-600" />
                   </div>
                   <h2 className="text-xl font-bold">Search for Courses</h2>
                   <p className="text-slate-500 max-w-sm mx-auto">Try "Deep Learning for Vision" or "Introduction to LLMs" to see semantic search in action.</p>
                </div>
              )}
            </div>
          )}
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
                placeholder={view === 'chat' ? "Ask anything..." : "Search courses semantically..."}
                className="pr-12 h-14 rounded-2xl bg-slate-900 border-slate-800 focus:border-indigo-500 disabled:opacity-50 shadow-2xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isTyping || isSearching}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
              >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : (view === 'chat' ? <Send className="h-5 w-5" /> : <Search className="h-5 w-5" />)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
