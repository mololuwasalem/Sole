import React, { useState } from 'react';
import { Search, Filter, Plus, ArrowUpRight, ArrowDownRight, Tag, Calendar, Banknote } from 'lucide-react';
import { useFinance } from '../lib/hooks';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

export const TransactionView: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => {
  const { transactions, banks } = useFinance();
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(filter.toLowerCase()) || 
                          t.category.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Transactions</h1>
          <p className="text-zinc-500">History of all your financial movements.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Record
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            placeholder="Search transactions..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
          />
        </div>
        <div className="flex bg-white border border-zinc-200 p-1 rounded-2xl shrink-0">
          {(['all', 'income', 'expense'] as const).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-xl transition-all capitalize",
                typeFilter === type ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50/50 border-bottom border-zinc-200">
              <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Transaction</th>
              <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredTransactions.map(t => (
              <tr key={t.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">{t.description}</p>
                      <p className="text-xs text-zinc-400">{banks.find(b => b.id === t.bankId)?.name || 'Unknown Account'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full w-fit">
                    <Tag className="w-3 h-3 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-500">{t.category}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900">{format(new Date(t.date), 'MMM dd, yyyy')}</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">Verified</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={cn(
                    "font-bold text-lg tabular-nums",
                    t.type === 'income' ? "text-emerald-600" : "text-zinc-900"
                  )}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Search className="w-12 h-12 mb-4 opacity-10" />
            <p className="font-bold">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
