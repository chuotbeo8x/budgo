'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense } from '@/lib/types';
import { getExpenses } from '@/lib/actions/expenses';

interface UseExpensesOptions {
  tripId: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseExpensesReturn {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  totalAmount: number;
  expenseCount: number;
  refresh: () => Promise<void>;
  addExpense: (expense: Expense) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  removeExpense: (expenseId: string) => void;
}

export function useExpenses({
  tripId,
  limit = 100,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseExpensesOptions): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getExpenses(tripId, limit);
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [tripId, limit]);

  // Initial fetch
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchExpenses, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchExpenses]);

  // Optimistic updates
  const addExpense = useCallback((expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  }, []);

  const updateExpense = useCallback((expenseId: string, updates: Partial<Expense>) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, ...updates }
          : expense
      )
    );
  }, []);

  const removeExpense = useCallback((expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  }, []);

  // Memoized calculations
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const expenseCount = useMemo(() => {
    return expenses.length;
  }, [expenses]);

  return {
    expenses,
    loading,
    error,
    totalAmount,
    expenseCount,
    refresh: fetchExpenses,
    addExpense,
    updateExpense,
    removeExpense,
  };
}
