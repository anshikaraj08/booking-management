import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon, Loader2, ShieldCheck, Hotel, HelpCircle, KeyRound } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('GUEST');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'question', 'reset'
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Signup Security Question State
  const [signupSecurityQuestion, setSignupSecurityQuestion] = useState('');
  const [signupSecurityAnswer, setSignupSecurityAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || (!isLogin && (!name || !signupSecurityQuestion || !signupSecurityAnswer))) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : { name, email, password, role: userType, securityQuestion: signupSecurityQuestion, securityAnswer: signupSecurityAnswer };

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

  const handleForgotPasswordEmail = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to retrieve security question');
        setIsLoading(false);
        return;
      }

      setSecurityQuestion(data.securityQuestion);
      setForgotPasswordStep('question');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySecurityAnswer = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!securityAnswer) {
      setError("Please enter your security answer.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityAnswer }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Incorrect security answer');
        setIsLoading(false);
        return;
      }

      // Answer is correct, move to reset password step
      setForgotPasswordStep('reset');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityAnswer, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      // Password reset successful, go back to login
      setShowForgotPassword(false);
      setForgotPasswordStep('email');
      setEmail('');
      setPassword('');
      setSecurityQuestion('');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      alert('Password reset successfully! Please login with your new password.');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
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
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 border ${showForgotPassword ? 'bg-yellow-500/10 border-yellow-500/30' : (userType === 'ADMIN' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-aetheria-gold/10 border-aetheria-gold/30')}`}>
                        {showForgotPassword ? (
                            <KeyRound className={`w-6 h-6 text-yellow-400`} />
                        ) : userType === 'ADMIN' ? (
                             <ShieldCheck className={`w-6 h-6 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`} />
                        ) : (
                             <Sparkles className="w-6 h-6 text-aetheria-gold" />
                        )}
                    </div>
                    <h2 className="text-3xl font-serif text-white font-bold mb-2">
                        {showForgotPassword 
                            ? (forgotPasswordStep === 'reset' ? 'Reset Password' : forgotPasswordStep === 'question' ? 'Verify Identity' : 'Forgot Password')
                            : (userType === 'ADMIN' ? 'Staff Portal' : 'Aetheria Heights')
                        }
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {showForgotPassword 
                            ? (forgotPasswordStep === 'reset' ? 'Enter your new password' : forgotPasswordStep === 'question' ? 'Answer your security question to continue' : 'Enter your email to recover your password')
                            : (isLogin 
                                ? (userType === 'ADMIN' ? "Enter your credentials to manage operations." : "Welcome back to your sanctuary.") 
                                : (userType === 'ADMIN' ? "Register a new staff account." : "Begin your journey with us."))
                        }
                    </p>
                </div>

                {/* Forgot Password Flow */}
                {showForgotPassword ? (
                    <>
                        {forgotPasswordStep === 'email' && (
                            <form onSubmit={handleForgotPasswordEmail} className="space-y-4">
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
                                        <>Continue <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>

                                <button 
                                    type="button"
                                    onClick={resetForgotPasswordFlow}
                                    className="w-full text-gray-400 text-sm hover:text-white transition-colors"
                                >
                                    ← Back to Login
                                </button>
                            </form>
                        )}

                        {forgotPasswordStep === 'question' && (
                            <form onSubmit={handleVerifySecurityAnswer} className="space-y-4">
                                <div className="space-y-1">
                                    <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Security Question</label>
                                    <div className="bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white">
                                        {securityQuestion}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Your Answer</label>
                                    <div className="relative group">
                                        <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            type="text" 
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                            placeholder="Enter your answer"
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
                                        <>Verify Answer <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        )}

                        {forgotPasswordStep === 'reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-1">
                                    <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Confirm New Password</label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                            placeholder="Confirm new password"
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
                                        <>Reset Password <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </>
                ) : (
                    /* Normal Login/Signup Form */
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

                        {!isLogin && (
                            <>
                                <div className="space-y-1">
                                    <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Security Question</label>
                                    <div className="relative group">
                                        <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            type="text" 
                                            value={signupSecurityQuestion}
                                            onChange={(e) => setSignupSecurityQuestion(e.target.value)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                            placeholder="e.g., What was the name of your first pet?"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className={`text-xs uppercase tracking-wider font-bold ml-1 ${userType === 'ADMIN' ? 'text-blue-400' : 'text-aetheria-gold'}`}>Security Answer</label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input 
                                            type="text" 
                                            value={signupSecurityAnswer}
                                            onChange={(e) => setSignupSecurityAnswer(e.target.value)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all ${userType === 'ADMIN' ? 'focus:border-blue-500/50' : 'focus:border-aetheria-gold/50'}`}
                                            placeholder="Your answer (for password recovery)"
                                        />
                                    </div>
                                    <p className="text-gray-500 text-xs ml-1 mt-1">Remember this answer - you'll need it to reset your password</p>
                                </div>
                            </>
                        )}

                        {isLogin && (
                            <div className="text-right">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowForgotPassword(true);
                                        setForgotPasswordStep('email');
                                        setError('');
                                    }}
                                    className={`text-xs transition-colors ${userType === 'ADMIN' ? 'text-blue-400 hover:text-blue-300' : 'text-aetheria-gold hover:text-yellow-400'}`}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

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
                )}

                {/* Footer */}
                {!showForgotPassword && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    resetForgotPasswordFlow();
                                }}
                                className={`ml-2 font-bold transition-colors ${userType === 'ADMIN' ? 'text-blue-400 hover:text-white' : 'text-aetheria-gold hover:text-white'}`}
                            >
                                {isLogin ? "Sign Up" : "Sign In"}
                            </button>
                        </p>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default Auth;

