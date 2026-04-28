import React from 'react';
import { Home, PieChart, CreditCard, LogOut, PlusCircle, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-xl",
      active 
        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode, activeTab: string, setActiveTab: (tab: string) => void }> = ({ children, activeTab, setActiveTab }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Sole</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={Home} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={CreditCard} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
          <NavItem icon={PieChart} label="Budgets" active={activeTab === 'budgets'} onClick={() => setActiveTab('budgets')} />
          <NavItem icon={Settings} label="Accounts" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <img 
              id="user-avatar"
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              alt="User" 
              className="w-10 h-10 rounded-full border border-zinc-200"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.displayName}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center w-full gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          
          <div className="pt-4 border-t border-zinc-100">
             <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] text-center group-hover:text-zinc-400 transition-colors">
               Made by Paybridge
             </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {children}
      </main>
    </div>
  );
};
