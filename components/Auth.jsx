import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon, Loader2, ShieldCheck, Hotel } from 'lucide-react';

const API_BASE = 'http://localhost:3002';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('GUEST');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : { name, email, password, role: userType };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      // data = { id, name, email, role, token }
      localStorage.setItem('token', data.token);
      onLogin(data);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserType = (type) => {
    setUserType(type);
    setError('');
    // Optional: Reset form or keep values
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-aetheria-navy relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=99')] bg-cover bg-center opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-aetheria-navy via-aetheria-navy/80 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
            
            {/* User Type Toggles */}
            <div className="flex mb-6 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 mx-auto max-w-[300px]">
                <button
                    onClick={() => toggleUserType('GUEST')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                        userType === 'GUEST' 
                        ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Hotel className="w-3 h-3" /> Guest
                </button>
                <button
                    onClick={() => toggleUserType('ADMIN')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                        userType === 'ADMIN' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <ShieldCheck className="w-3 h-3" /> Admin
                </button>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-aetheria-gold/20 rounded-2xl shadow-2xl p-8">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 border ${userType === 'ADMIN' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-aetheria-gold/10 border-aetheria-gold/30'}`}>
                        {userType === 'ADMIN' ? (
                             <ShieldCheck className={`w-6 h-6 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`} />
                        ) : (
                             <Sparkles className="w-6 h-6 text-aetheria-gold" />
                        )}
                    </div>
                    <h2 className="text-3xl font-serif text-white font-bold mb-2">
                        {userType === 'ADMIN' ? 'Staff Portal' : 'Aetheria Heights'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isLogin 
                            ? (userType === 'ADMIN' ? "Enter your credentials to manage operations." : "Welcome back to your sanctuary.") 
                            : (userType === 'ADMIN' ? "Register a new staff account." : "Begin your journey with us.")}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                    placeholder={userType === 'ADMIN' ? "Staff Name" : "John Doe"}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20 text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full font-bold py-3 rounded-lg hover:bg-white hover:text-aetheria-navy transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 mt-4 ${userType === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-aetheria-gold text-aetheria-navy'}`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? (userType === 'ADMIN' ? "Access Dashboard" : "Sign In") : (userType === 'ADMIN' ? "Register Staff" : "Create Account")} <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className={`ml-2 font-bold transition-colors ${userType === 'ADMIN' ? 'text-blue-400 hover:text-white' : 'text-aetheria-gold hover:text-white'}`}
                        >
                            {isLogin ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    </div>
  );
};

export default Auth;

