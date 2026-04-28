import React, { useState } from 'react';
import { Landmark, Plus, Trash2, CreditCard } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../lib/hooks';
import { formatCurrency, cn } from '../lib/utils';

export const BankManager: React.FC = () => {
  const { user } = useAuth();
  const { banks } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as const,
    balance: '',
    currency: 'USD'
  });

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'banks'), {
        userId: user.uid,
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        currency: formData.currency,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ name: '', type: 'checking', balance: '', currency: 'USD' });
    } catch (error) {
      console.error('Error adding bank:', error);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (confirm('Delete this account and all its history?')) {
      await deleteDoc(doc(db, 'banks', id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Accounts</h1>
          <p className="text-zinc-500">Manage your linked bank accounts.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </header>

      {isAdding && (
        <div className="p-8 bg-zinc-100 rounded-[2rem] border border-zinc-200 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddBank} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Account Name</label>
              <input 
                required
                placeholder="e.g. Chase Priority"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Balance</label>
              <input 
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.balance}
                onChange={e => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-zinc-900 text-white rounded-xl font-bold py-3 hover:bg-zinc-800 transition-all">Save</button>
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold py-3 hover:bg-zinc-50 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banks.map(bank => (
          <div key={bank.id} className="group relative p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all">
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-zinc-900 rounded-2xl">
                <Landmark className="w-8 h-8 text-white" />
              </div>
              <button 
                onClick={() => handleDeleteBank(bank.id)}
                className="p-2 text-zinc-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-1">{bank.type}</p>
            <h3 className="text-xl font-bold mb-4">{bank.name}</h3>
            <p className="text-3xl font-bold tabular-nums tracking-tighter">
              {formatCurrency(bank.balance, bank.currency)}
            </p>
            
            <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                •••• 4242
              </div>
              <span className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
        ))}

        {banks.length === 0 && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 rounded-[2.5rem] hover:bg-zinc-50 hover:border-zinc-300 transition-all gap-4 text-zinc-400 group"
          >
            <div className="p-4 bg-zinc-50 rounded-full group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <p className="font-bold">Add your first account</p>
          </button>
        )}
      </div>
    </div>
  );
};
