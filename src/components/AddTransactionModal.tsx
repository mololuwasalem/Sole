import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { categorizeTransaction } from '../lib/aiService';
import { Bank } from '../lib/hooks';
import { cn } from '../lib/utils';

interface Props {
  banks: Bank[];
  onClose: () => void;
}

export const AddTransactionModal: React.FC<Props> = ({ banks, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Shopping',
    type: 'expense' as 'income' | 'expense',
    bankId: banks[0]?.id || '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAiCategorize = async () => {
    if (!formData.description) return;
    setAiLoading(true);
    const category = await categorizeTransaction(formData.description);
    setFormData(prev => ({ ...prev, category }));
    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.bankId) return;

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      const transactionData = {
        userId: user.uid,
        bankId: formData.bankId,
        amount: amount,
        type: formData.type,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'transactions'), transactionData);
      
      // Update bank balance
      const balanceChange = formData.type === 'income' ? amount : -amount;
      await updateDoc(doc(db, 'banks', formData.bankId), {
        balance: increment(balanceChange)
      });

      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">New Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-zinc-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                formData.type === 'expense' ? "bg-white shadow-sm text-rose-600" : "text-zinc-500"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                formData.type === 'income' ? "bg-white shadow-sm text-emerald-600" : "text-zinc-500"
              )}
            >
              Income
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Account</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <select
                  required
                  value={formData.bankId}
                  onChange={e => setFormData(prev => ({ ...prev, bankId: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all appearance-none"
                >
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.name} (${bank.balance})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Amount</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Date</label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Description</label>
              <div className="relative mt-1">
                <input
                  required
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all pr-24"
                />
                <button
                  type="button"
                  onClick={handleAiCategorize}
                  disabled={aiLoading || !formData.description}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {aiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              >
                {['Shopping', 'Food', 'Transport', 'Housing', 'Entertainment', 'Utilities', 'Healthcare', 'Income', 'Others'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || banks.length === 0}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
            Add Transaction
          </button>
          
          {banks.length === 0 && (
            <p className="text-center text-xs text-rose-500 font-medium">Please add a bank account first</p>
          )}
        </form>
      </div>
    </div>
  );
};
