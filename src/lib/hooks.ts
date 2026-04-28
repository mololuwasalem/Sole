import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Bank {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'other';
  balance: number;
  currency: string;
  userId: string;
}

export interface Transaction {
  id: string;
  userId: string;
  bankId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: any; 
  createdAt: any;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

export function useFinance() {
  const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const banksQuery = query(collection(db, 'banks'), where('userId', '==', user.uid));
    const transQuery = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const budgetsQuery = query(collection(db, 'budgets'), where('userId', '==', user.uid));

    const unsubBanks = onSnapshot(banksQuery, (snap) => {
      setBanks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bank)));
    });

    const unsubTrans = onSnapshot(transQuery, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    const unsubBudgets = onSnapshot(budgetsQuery, (snap) => {
      setBudgets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
    });

    setLoading(false);

    return () => {
      unsubBanks();
      unsubTrans();
      unsubBudgets();
    };
  }, [user]);

  return { banks, transactions, budgets, loading };
}
