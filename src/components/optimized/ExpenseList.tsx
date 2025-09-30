'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Expense } from '@/lib/types';
import ExpenseItem from './ExpenseItem';
import { Skeleton } from '@/components/ui/skeleton';

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  canEdit: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  userNames: Record<string, string>;
}

const ExpenseList = memo<ExpenseListProps>(({ 
  expenses, 
  loading, 
  canEdit, 
  onEdit, 
  onDelete, 
  userNames 
}) => {
  const handleEdit = useCallback((expense: Expense) => {
    onEdit(expense);
  }, [onEdit]);

  const handleDelete = useCallback((expenseId: string) => {
    onDelete(expenseId);
  }, [onDelete]);

  // Memoize the total amount calculation
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Memoize the expense count
  const expenseCount = useMemo(() => {
    return expenses.length;
  }, [expenses]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No expenses yet</p>
        <p className="text-sm">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Expenses ({expenseCount})
        </h3>
        <div className="text-sm text-muted-foreground">
          Total: {totalAmount.toLocaleString()} VND
        </div>
      </div>
      
      <div className="space-y-3">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            canEdit={canEdit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            userNames={userNames}
          />
        ))}
      </div>
    </div>
  );
});

ExpenseList.displayName = 'ExpenseList';

export default ExpenseList;
