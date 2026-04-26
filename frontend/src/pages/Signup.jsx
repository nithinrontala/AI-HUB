import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, BrainCircuit } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      setSuccess(true);
      // Redirect or show success message
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 animate-slide-up">
        <div className="flex justify-center flex-col items-center">
          <div className="p-3 bg-pink-500/20 rounded-2xl border border-pink-500/30 backdrop-blur-xl mb-4">
            <BrainCircuit className="h-10 w-10 text-pink-400" />
          </div>
          <h2 className="text-center text-4xl font-bold tracking-tight text-white mb-2">
            Create an Account
          </h2>
          <p className="text-center text-sm text-slate-400">
            Start your personalized learning journey today
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass-panel py-8 px-4 sm:rounded-2xl sm:px-10">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm animate-slide-up">
                Account created successfully! You can now{' '}
                <Link to="/login" className="font-bold underline">log in</Link>.
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <Input 
                  name="name"
                  type="text" 
                  placeholder="John Doe" 
                  icon={User} 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                <Input 
                  name="email"
                  type="email" 
                  placeholder="you@example.com" 
                  icon={Mail} 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <Input 
                  name="password"
                  type="password" 
                  placeholder="Create a strong password" 
                  icon={Lock} 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Button type="submit" isLoading={isLoading} className="mt-2 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 border-none">
                  Create Account
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-pink-400 hover:text-pink-300 transition-colors">
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
