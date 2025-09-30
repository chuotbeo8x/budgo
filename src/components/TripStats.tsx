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
  // Safety checks
  const safeExpenses = expenses || [];
  const safeAdvances = advances || [];
  const safeMembers = members || [];
  
  // Calculate basic stats
  const totalExpenses = safeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdvances = safeAdvances.reduce((sum, advance) => sum + advance.amount, 0);
  const netAmount = totalExpenses - totalAdvances;

  // Calculate per member stats
  const memberStats = safeMembers.map(member => {
    // Expenses paid by this member
    const paidExpenses = safeExpenses.filter(expense => expense.paidBy === member.id);
    const totalPaid = paidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Advances paid by this member
    const paidAdvances = safeAdvances.filter(advance => advance.paidBy === member.id);
    const totalAdvancePaid = paidAdvances.reduce((sum, advance) => sum + advance.amount, 0);
    
    // Advances received by this member
    const receivedAdvances = safeAdvances.filter(advance => advance.paidTo === member.id);
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
    <div className="grid gap-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(totalExpenses, trip.currency)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Tổng chi phí</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(totalAdvances, trip.currency)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Tổng tạm ứng</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {expenses.length + advances.length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Số giao dịch</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {expenses.length} chi phí, {advances.length} tạm ứng
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(averageDailySpending, trip.currency)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Chi phí TB/ngày</p>
            </div>
          </CardContent>
        </Card>
      </div>


      

      {/* Trip Duration Stats */}
      {trip.startDate && trip.endDate && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Thống kê thời gian</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                </div>
                <p className="text-xs text-gray-600 mt-1">Thời gian chuyến đi</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-indigo-600">
                  {formatCurrency(totalExpenses / members.length, trip.currency)}
                </div>
                <p className="text-xs text-gray-600 mt-1">Chi phí TB/người</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-teal-600">
                  {formatCurrency(totalExpenses / Math.max(1, Object.keys(dailySpending).length), trip.currency)}
                </div>
                <p className="text-xs text-gray-600 mt-1">Chi phí TB/ngày</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


