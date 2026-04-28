import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../lib/hooks';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'];

export const Dashboard: React.FC = () => {
  const { banks, transactions } = useFinance();

  const totalBalance = banks.reduce((acc, bank) => acc + bank.balance, 0);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const monthlyExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Group transactions by category for Pie Chart
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  // Last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = format(d, 'MMM dd');
    const dayIncome = transactions
      .filter(t => t.type === 'income' && format(new Date(t.date), 'MMM dd') === dateStr)
      .reduce((acc, t) => acc + t.amount, 0);
    const dayExpense = transactions
      .filter(t => t.type === 'expense' && format(new Date(t.date), 'MMM dd') === dateStr)
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: dateStr, income: dayIncome, expense: dayExpense };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500">Welcome back to Sole.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-zinc-900 rounded-2xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Balance</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalBalance)}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Monthly Income</p>
              <h3 className="text-2xl font-bold text-emerald-600">+{formatCurrency(monthlyIncome)}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <TrendingDown className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Monthly Expense</p>
              <h3 className="text-2xl font-bold text-rose-600">-{formatCurrency(monthlyExpense)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-[2.5rem]">
          <h3 className="text-lg font-bold mb-8">Activity (Last 7 Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="p-8 bg-white border border-zinc-200 rounded-[2.5rem]">
          <h3 className="text-lg font-bold mb-8">Expenses by Category</h3>
          <div className="h-80 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-400 flex flex-col items-center gap-2">
                <PieChart className="w-12 h-12 opacity-20" />
                <p>No expense data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-8 bg-white border border-zinc-200 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <button className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">View All</button>
        </div>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold">{t.description}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">{t.category} • {format(new Date(t.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <p className={cn(
                "font-bold text-lg",
                t.type === 'income' ? "text-emerald-600" : "text-zinc-900"
              )}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-12 text-zinc-400">
               <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
               <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
