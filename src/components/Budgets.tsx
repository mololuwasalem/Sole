import React, { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp, AlertCircle, CheckCircle2, PieChart } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../lib/hooks';
import { formatCurrency, cn } from '../lib/utils';

export const Budgets: React.FC = () => {
  const { user } = useAuth();
  const { transactions, budgets } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    limit: '',
    period: 'monthly' as const
  });

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'budgets'), {
        userId: user.uid,
        category: formData.category,
        limit: parseFloat(formData.limit),
        period: formData.period,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ category: 'Food', limit: '', period: 'monthly' });
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const getSpentForCategory = (category: string) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpentInBudgets = budgets.reduce((acc, b) => acc + getSpentForCategory(b.category), 0);
  const overallPercent = totalBudget > 0 ? Math.round((totalSpentInBudgets / totalBudget) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Budgets</h1>
          <p className="text-zinc-500">Track your spending targets by category.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Set Budget
        </button>
      </header>

      {/* Summary Section */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl shadow-zinc-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <PieChart className="w-24 h-24" />
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Total Budgeted</p>
            <h3 className="text-4xl font-bold mb-4 tracking-tighter">{formatCurrency(totalBudget)}</h3>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{budgets.length} active targets</span>
            </div>
          </div>
          
          <div className="col-span-2 p-8 bg-white border border-zinc-200 rounded-[2.5rem] flex flex-col justify-center shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">Overall Utilization</p>
              <span className={cn(
                "text-2xl font-bold tabular-nums",
                overallPercent > 90 ? "text-rose-600" : "text-emerald-600"
              )}>{overallPercent}%</span>
            </div>
            <div className="h-6 bg-zinc-100 rounded-2xl overflow-hidden p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overallPercent, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-xl shadow-lg",
                  overallPercent > 90 ? "bg-rose-500" : overallPercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
            </div>
            <p className="mt-4 text-sm text-zinc-400 font-medium">
              You've spent <span className="text-zinc-900 font-bold">{formatCurrency(totalSpentInBudgets)}</span> out of your {formatCurrency(totalBudget)} total monthly budget.
            </p>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="p-8 bg-zinc-100 rounded-[2.5rem] border border-zinc-200 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              >
                {['Shopping', 'Food', 'Transport', 'Housing', 'Entertainment', 'Utilities', 'Healthcare', 'Others'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Limit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                <input 
                  required
                  type="number"
                  placeholder="0.00"
                  value={formData.limit}
                  onChange={e => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Period</label>
              <select 
                value={formData.period}
                onChange={e => setFormData(prev => ({ ...prev, period: e.target.value as any }))}
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex gap-2 h-[50px]">
              <button type="submit" className="flex-1 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">Save</button>
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-50 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {budgets.map(budget => {
          const spent = getSpentForCategory(budget.category);
          const percent = Math.min(Math.round((spent / budget.limit) * 100), 100);
          const isOver = spent > budget.limit;
          const isWarning = percent > 85 && !isOver;

          return (
            <div key={budget.id} className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm space-y-8 group hover:shadow-xl hover:border-zinc-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-4 rounded-[1.5rem] transition-colors shadow-sm",
                    isOver ? "bg-rose-50 text-rose-600" : isWarning ? "bg-amber-50 text-amber-600" : "bg-zinc-900 text-white"
                  )}>
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{budget.category}</h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">{budget.period} limit: {formatCurrency(budget.limit)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteDoc(doc(db, 'budgets', budget.id))}
                  className="p-3 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">Spent so far</p>
                    <p className={cn(
                      "text-3xl font-extrabold tracking-tighter tabular-nums",
                      isOver ? "text-rose-600" : "text-zinc-900"
                    )}>{formatCurrency(spent)}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm",
                      isOver ? "bg-rose-600 text-white" : isWarning ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {isOver ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isOver ? "Over Budget" : isWarning ? "Warning" : "On Track"}
                    </span>
                  </div>
                </div>

                <div className="h-5 bg-zinc-100 rounded-full overflow-hidden p-1 shadow-inner relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className={cn(
                      "h-full rounded-full shadow-md",
                      isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-zinc-900"
                    )}
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
                   <div className="flex items-center gap-2">
                     {isOver ? (
                       <div className="flex items-center gap-2 text-rose-600 font-bold">
                         <TrendingUp className="w-5 h-5" />
                         <span className="text-sm">Over by {formatCurrency(spent - budget.limit)}</span>
                       </div>
                     ) : (
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-zinc-900">{formatCurrency(budget.limit - spent)} remaining</span>
                         <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Available Balance</span>
                       </div>
                     )}
                   </div>
                   <div className="text-right">
                     <p className="text-2xl font-black tracking-tighter text-zinc-900">{percent}%</p>
                   </div>
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && !isAdding && (
          <div className="col-span-full py-32 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-zinc-400 gap-6">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-zinc-100">
               <Target className="w-10 h-10 opacity-20" />
             </div>
             <div className="text-center space-y-2">
               <p className="font-bold text-xl text-zinc-900">Reach your goals faster</p>
               <p className="text-sm max-w-xs mx-auto">Set category limits to track where your money goes and save more effectively.</p>
             </div>
             <button onClick={() => setIsAdding(true)} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-zinc-100 hover:bg-zinc-800 transition-all">
               Set your first budget
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
