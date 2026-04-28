import React, { useState } from 'react';
import { Wallet, Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { signInWithGoogle, signUpWithEmail, loginWithEmail } from '../lib/firebase';
import { cn } from '../lib/utils';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        setSuccess('Account created! Please check your email for a verification link before signing in.');
        setIsSignUp(false);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-zinc-200">
            <span className="text-white font-bold text-4xl">S</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Sole</h1>
            <p className="text-zinc-500 font-medium italic">Master your money with AI precision.</p>
          </div>
        </div>

        <div className="p-8 bg-white border border-zinc-200 rounded-[3rem] shadow-xl shadow-zinc-200 space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-50" />

          <div className="text-center space-y-2 relative">
            <h2 className="text-xl font-bold">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
            <p className="text-sm text-zinc-400">
              {isSignUp ? 'Sign up to start tracking your finances.' : 'Sign in to sync your data.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                required
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-bold px-2">{error}</p>
            )}

            {success && (
              <p className="text-xs text-emerald-500 font-bold px-2">{success}</p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 text-xs font-bold text-zinc-300 uppercase tracking-[0.2em] py-2">
            <div className="h-[1px] flex-1 bg-zinc-100" />
            OR
            <div className="h-[1px] flex-1 bg-zinc-100" />
          </div>

          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 py-4 rounded-2xl font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all group px-6"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5 group-hover:scale-110 transition-transform" 
              referrerPolicy="no-referrer" 
            />
            Continue with Google
          </button>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>
        </div>

        <div className="text-center space-y-4 pb-8">
          <p className="text-xs text-zinc-400">
            By signing in you agree to our Terms of Service.
          </p>
          <div className="flex items-center justify-center gap-2 opacity-50">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Made by</span>
            <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter">Paybridge</span>
          </div>
        </div>
      </div>
    </div>
  );
};
