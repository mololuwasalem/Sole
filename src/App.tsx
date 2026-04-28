/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TransactionView } from './components/TransactionView';
import { BankManager } from './components/BankManager';
import { Budgets } from './components/Budgets';
import { AddTransactionModal } from './components/AddTransactionModal';
import { useFinance } from './lib/hooks';

function AppContent() {
  const { user } = useAuth();
  const { banks, loading } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (!user) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'transactions' && <TransactionView onAddClick={() => setIsAddModalOpen(true)} />}
      {activeTab === 'accounts' && <BankManager />}
      {activeTab === 'budgets' && <Budgets />}

      {isAddModalOpen && (
        <AddTransactionModal 
          banks={banks} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
