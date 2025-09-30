'use client';

import React, { memo, useCallback } from 'react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/date';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExpenseItemProps {
  expense: Expense;
  canEdit: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  userNames: Record<string, string>;
}

const ExpenseItem = memo<ExpenseItemProps>(({ 
  expense, 
  canEdit, 
  onEdit, 
  onDelete, 
  userNames 
}) => {
  const handleEdit = useCallback(() => {
    onEdit(expense);
  }, [expense, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(expense.id);
  }, [expense.id, onDelete]);

  const paidByName = userNames[expense.paidBy] || 'Unknown';
  const formattedAmount = formatCurrency(expense.amount, expense.currency || 'VND');
  const formattedDate = formatDateTime(expense.createdAt);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {expense.description}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {expense.category || 'other'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                by {paidByName}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {formattedAmount}
            </div>
            <div className="text-xs text-muted-foreground">
              {formattedDate}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {expense.splitMethod === 'weight' ? 'Weighted split' : 'Equal split'}
          </div>
          
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ExpenseItem.displayName = 'ExpenseItem';

export default ExpenseItem;
