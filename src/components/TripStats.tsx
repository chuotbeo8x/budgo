'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip, TripMember, Expense, Advance } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/currency';
import { getCategoryName } from '@/lib/constants';

interface TripStatsProps {
  trip: Trip;
  members: TripMember[];
  expenses: Expense[];
  advances: Advance[];
}

export default function TripStats({ trip, members, expenses, advances }: TripStatsProps) {
  // Calculate basic stats
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdvances = advances.reduce((sum, advance) => sum + advance.amount, 0);
  const netAmount = totalExpenses - totalAdvances;

  // Calculate per member stats
  const memberStats = members.map(member => {
    // Expenses paid by this member
    const paidExpenses = expenses.filter(expense => expense.paidBy === member.id);
    const totalPaid = paidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Advances paid by this member
    const paidAdvances = advances.filter(advance => advance.paidBy === member.id);
    const totalAdvancePaid = paidAdvances.reduce((sum, advance) => sum + advance.amount, 0);
    
    // Advances received by this member
    const receivedAdvances = advances.filter(advance => advance.paidTo === member.id);
    const totalAdvanceReceived = receivedAdvances.reduce((sum, advance) => sum + advance.amount, 0);
    
    // For now, we'll use a simplified calculation
    // In a real app, you'd need to calculate the actual split amounts
    const netBalance = totalPaid - totalAdvancePaid + totalAdvanceReceived;

    return {
      member,
      totalPaid,
      totalOwed: 0, // This would need proper split calculation
      totalAdvance: totalAdvanceReceived - totalAdvancePaid,
      netBalance,
      expenseCount: paidExpenses.length,
      advanceCount: paidAdvances.length + receivedAdvances.length
    };
  });

  // Calculate expense categories
  const expenseCategories = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Khác';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate daily spending
  const dailySpending = expenses.reduce((acc, expense) => {
    const date = new Date(expense.createdAt).toDateString();
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const averageDailySpending = Object.values(dailySpending).reduce((sum, amount) => sum + amount, 0) / Object.keys(dailySpending).length || 0;

  return (
    <div className="grid gap-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi phí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, trip.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng tạm ứng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalAdvances, trip.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Số giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses.length + advances.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} chi phí, {advances.length} tạm ứng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chi phí TB/ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageDailySpending, trip.currency)}
            </div>
          </CardContent>
        </Card>
      </div>


      

      {/* Trip Duration Stats */}
      {trip.startDate && trip.endDate && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                </div>
                <p className="text-sm text-muted-foreground">Thời gian chuyến đi</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(totalExpenses / members.length, trip.currency)}
                </div>
                <p className="text-sm text-muted-foreground">Chi phí TB/người</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(totalExpenses / Math.max(1, Object.keys(dailySpending).length), trip.currency)}
                </div>
                <p className="text-sm text-muted-foreground">Chi phí TB/ngày</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


