'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExpenses, getAdvances } from '@/lib/actions/expenses';
import { getTripMembers } from '@/lib/actions/trips';
import { Trip, Expense, Advance, TripMember } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface ExportPageProps {
  trip: Trip;
  backUrl: string;
  backLabel: string;
  canExport?: boolean;
}

export default function ExportPage({ 
  trip, 
  backUrl, 
  backLabel, 
  canExport = true
}: ExportPageProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (trip?.id && user) {
      loadData();
    }
  }, [trip?.id, user]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [expensesData, advancesData, membersData] = await Promise.all([
        getExpenses(trip.id),
        getAdvances(trip.id),
        getTripMembers(trip.id)
      ]);
      setExpenses(expensesData);
      setAdvances(advancesData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const calculateSettlements = () => {
    const settlements = members.map(member => ({
      memberId: member.id,
      memberName: member.name,
      totalExpenses: 0,
      totalAdvances: 0,
      balance: 0
    }));

    // Calculate expenses for each member
    expenses.forEach(expense => {
      // Only split among members who were in the trip when expense was created
      const eligibleMembers = members.filter(member => {
        // If memberIdsAtCreation is not set (legacy expenses), include all members
        if (!expense.memberIdsAtCreation) {
          return true;
        }
        // Only include members who were in the trip when expense was created
        return expense.memberIdsAtCreation.includes(member.id);
      });

      if (expense.splitMethod === 'equal') {
        const amountPerPerson = expense.amount / eligibleMembers.length;
        eligibleMembers.forEach(member => {
          const settlement = settlements.find(s => s.memberId === member.id);
          if (settlement) {
            settlement.totalExpenses += amountPerPerson;
          }
        });
      } else if (expense.splitMethod === 'weight' && expense.weightMap) {
        // Filter weightMap to only include eligible members
        const eligibleWeightMap = expense.weightMap.filter(weightEntry => 
          eligibleMembers.some(member => member.id === weightEntry.memberId)
        );
        
        const totalWeight = eligibleWeightMap.reduce((sum, entry) => sum + entry.weight, 0);
        if (totalWeight > 0) {
          eligibleWeightMap.forEach(weightEntry => {
            const settlement = settlements.find(s => s.memberId === weightEntry.memberId);
            if (settlement) {
              const memberAmount = (expense.amount * weightEntry.weight) / totalWeight;
              settlement.totalExpenses += memberAmount;
            }
          });
        }
      }
    });

    // Calculate advances for each member
    advances.forEach(advance => {
      const paidBySettlement = settlements.find(s => s.memberId === advance.paidBy);
      if (paidBySettlement) {
        paidBySettlement.totalAdvances += advance.amount;
      }
      
      const paidToSettlement = settlements.find(s => s.memberId === advance.paidTo);
      if (paidToSettlement) {
        paidToSettlement.totalAdvances -= advance.amount;
      }
    });

    // Calculate final balance
    settlements.forEach(settlement => {
      settlement.balance = settlement.totalAdvances - settlement.totalExpenses;
    });

    return settlements;
  };

  const exportToCSV = () => {
    if (!canExport) return;
    
    setExporting(true);
    try {
      const settlements = calculateSettlements();
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalAdvances = advances.reduce((sum, advance) => sum + advance.amount, 0);
      
      // Create CSV content
      let csvContent = `Báo cáo chuyến đi: ${trip.name}\n`;
      csvContent += `Ngày xuất: ${formatDate(new Date())}\n`;
      csvContent += `Tổng chi phí: ${formatCurrency(totalExpenses, trip.currency)}\n`;
      csvContent += `Tổng tạm ứng: ${formatCurrency(totalAdvances, trip.currency)}\n\n`;
      
      // Expenses section
      csvContent += `=== CHI PHÍ ===\n`;
      csvContent += `Mô tả,Người chi,Danh mục,Số tiền,Cách chia,Ngày tạo\n`;
      expenses.forEach(expense => {
        const paidByMember = members.find(m => m.id === expense.paidBy);
        const splitMethod = expense.splitMethod === 'equal' ? 'Chia đều' : 'Theo trọng số';
        csvContent += `"${expense.description || ''}","${paidByMember?.name || ''}","${expense.category || ''}","${formatCurrency(expense.amount, trip.currency)}","${splitMethod}","${formatDate(expense.createdAt)}"\n`;
      });
      
      csvContent += `\n=== TẠM ỨNG ===\n`;
      csvContent += `Mô tả,Người chi,Người nhận,Số tiền,Ngày tạo\n`;
      advances.forEach(advance => {
        const paidByMember = members.find(m => m.id === advance.paidBy);
        const paidToMember = members.find(m => m.id === advance.paidTo);
        csvContent += `"${advance.description || ''}","${paidByMember?.name || ''}","${paidToMember?.name || ''}","${formatCurrency(advance.amount, trip.currency)}","${formatDate(advance.createdAt)}"\n`;
      });
      
      csvContent += `\n=== THANH TOÁN ===\n`;
      csvContent += `Thành viên,Tổng chi phí,Tổng tạm ứng,Số dư,Trạng thái\n`;
      settlements.forEach(settlement => {
        const status = settlement.balance > 0.01 ? 'Sẽ nhận tiền' : 
                      settlement.balance < -0.01 ? 'Cần trả tiền' : 'Đã cân bằng';
        csvContent += `"${settlement.memberName}","${formatCurrency(settlement.totalExpenses, trip.currency)}","${formatCurrency(settlement.totalAdvances, trip.currency)}","${formatCurrency(settlement.balance, trip.currency)}","${status}"\n`;
      });
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `baocao-chuyendi-${trip.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Xuất báo cáo thành công!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Có lỗi xảy ra khi xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdvances = advances.reduce((sum, advance) => sum + advance.amount, 0);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={backUrl}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Xuất báo cáo
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Xuất báo cáo chi tiết cho chuyến đi "{trip.name}"
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tổng chi phí</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalExpenses, trip.currency)}</p>
                </div>
                <DollarSign className="w-6 h-6 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng tạm ứng</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAdvances, trip.currency)}</p>
                </div>
                <CreditCard className="w-6 h-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Số thành viên</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <Users className="w-6 h-6 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Tổng giao dịch</p>
                  <p className="text-2xl font-bold">{expenses.length + advances.length}</p>
                </div>
                <FileText className="w-6 h-6 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Xuất CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Xuất báo cáo chi tiết dưới dạng file CSV, bao gồm tất cả chi phí, tạm ứng và bảng thanh toán.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Danh sách chi phí chi tiết
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Danh sách tạm ứng
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Bảng thanh toán cuối kỳ
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Thống kê tổng quan
                </div>
              </div>
              <Button 
                onClick={exportToCSV}
                disabled={!canExport || exporting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Xuất file CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Báo cáo tóm tắt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin chuyến đi</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Tên:</strong> {trip.name}</p>
                    <p><strong>Địa điểm:</strong> {trip.destination}</p>
                    <p><strong>Tiền tệ:</strong> {trip.currency}</p>
                    <p><strong>Ngày tạo:</strong> {formatDate(trip.createdAt)}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Thống kê</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Chi phí:</strong> {expenses.length} khoản</p>
                    <p><strong>Tạm ứng:</strong> {advances.length} khoản</p>
                    <p><strong>Thành viên:</strong> {members.length} người</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-gray-600" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 && advances.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chưa có hoạt động nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...expenses, ...advances]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((item, index) => {
                    const isExpense = 'splitMethod' in item;
                    const member = members.find(m => m.id === item.paidBy);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {isExpense ? (
                            <DollarSign className="w-5 h-5 text-green-600" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {isExpense ? 'Chi phí' : 'Tạm ứng'}: {item.description || 'Không có mô tả'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member?.name || 'Không xác định'} • {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.amount, trip.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
