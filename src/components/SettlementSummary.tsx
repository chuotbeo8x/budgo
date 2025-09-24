'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { 
  UserCheck, 
  DollarSign, 
  CreditCard, 
  Calculator, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface Settlement {
  memberId: string;
  memberName: string;
  totalExpenses: number;
  totalAdvances: number;
  balance: number;
}

interface SettlementSummaryProps {
  settlements: Settlement[];
  currency: string;
  showDetails?: boolean;
  showToggle?: boolean;
  isOwner?: boolean;
  paymentStatus?: Record<string, boolean>;
  onPaymentStatusChange?: (memberId: string, status: boolean) => void;
  updating?: boolean;
  loading?: boolean;
}

export default function SettlementSummary({ 
  settlements, 
  currency, 
  showDetails = false,
  showToggle = true,
  isOwner = false,
  paymentStatus: externalPaymentStatus,
  onPaymentStatusChange,
  updating = false,
  loading = false
}: SettlementSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [internalPaymentStatus, setInternalPaymentStatus] = useState<Record<string, boolean>>({});
  
  // Use external payment status if provided, otherwise use internal state
  const paymentStatus = externalPaymentStatus || internalPaymentStatus;

  const debtors = settlements.filter(s => s.balance < -0.01);
  const creditors = settlements.filter(s => s.balance > 0.01);

  const togglePaymentStatus = (memberId: string) => {
    const newStatus = !paymentStatus[memberId];
    
    if (onPaymentStatusChange) {
      // Use external callback if provided
      onPaymentStatusChange(memberId, newStatus);
    } else {
      // Use internal state if no external callback
      setInternalPaymentStatus(prev => ({
        ...prev,
        [memberId]: newStatus
      }));
    }
  };

  if (settlements.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-600" />
            Tóm tắt thanh toán
          </CardTitle>
          {showToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-6">
            
            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Lưu ý về tính toán thanh toán:</p>
                  <p>Chi phí chỉ được chia cho những thành viên có trong chuyến đi khi chi phí được tạo. Thành viên mới thêm vào sau sẽ không bị chia tiền cho các chi phí trước đó.</p>
                </div>
              </div>
            </div>
            
            {/* Settlement Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Thành viên</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Tổng chi phí</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Tổng tạm ứng</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Số dư</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((settlement) => {
                    const isPositive = settlement.balance > 0;
                    const isNegative = settlement.balance < 0;
                    const isZero = Math.abs(settlement.balance) < 0.01;
                    
                    return (
                      <tr key={settlement.memberId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {settlement.memberName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{settlement.memberName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-red-500" />
                            <span className="text-lg font-semibold text-red-600">
                              {formatCurrency(settlement.totalExpenses, currency)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            <span className="text-lg font-semibold text-blue-600">
                              {formatCurrency(settlement.totalAdvances, currency)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            <span className={`text-lg font-bold ${
                              isPositive ? 'text-green-600' : 
                              isNegative ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {formatCurrency(settlement.balance, currency)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            {isZero ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Đã cân bằng</span>
                              </div>
                            ) : isOwner ? (
                              <Button
                                variant={paymentStatus[settlement.memberId] ? "default" : "outline"}
                                size="sm"
                                onClick={() => togglePaymentStatus(settlement.memberId)}
                                disabled={updating}
                                className={`flex items-center gap-2 ${
                                  paymentStatus[settlement.memberId] 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : isPositive 
                                      ? 'border-green-600 text-green-600 hover:bg-green-50'
                                      : 'border-red-600 text-red-600 hover:bg-red-50'
                                }`}
                              >
                                {paymentStatus[settlement.memberId] ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{isPositive ? 'Đã nhận' : 'Đã trả'}</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{isPositive ? 'Chưa nhận' : 'Chưa trả'}</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className={`flex items-center gap-2 ${
                                paymentStatus[settlement.memberId] ? 'text-green-600' : 
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {paymentStatus[settlement.memberId] ? (
                                  <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{isPositive ? 'Đã nhận' : 'Đã trả'}</span>
                                  </>
                                ) : isPositive ? (
                                  <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Sẽ nhận tiền</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Cần trả tiền</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Settlement Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Những người cần trả tiền:</h4>
                <div className="space-y-2">
                  {debtors.map(settlement => {
                    const isPaid = paymentStatus[settlement.memberId];
                    return (
                      <div key={settlement.memberId} className={`flex justify-between items-center p-2 rounded ${
                        isPaid ? 'bg-gray-100' : 'bg-red-50'
                      }`}>
                        <span className={`font-medium ${isPaid ? 'line-through text-gray-500' : ''}`}>
                          {settlement.memberName}
                        </span>
                        <span className={`font-bold ${isPaid ? 'line-through text-gray-500' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(settlement.balance), currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Những người sẽ nhận tiền:</h4>
                <div className="space-y-2">
                  {creditors.map(settlement => {
                    const isReceived = paymentStatus[settlement.memberId];
                    const isRefund = settlement.totalAdvances > settlement.totalExpenses;
                    return (
                      <div key={settlement.memberId} className={`flex justify-between items-center p-2 rounded ${
                        isReceived ? 'bg-gray-100' : 'bg-green-50'
                      }`}>
                        <div className="flex flex-col">
                          <span className={`font-medium ${isReceived ? 'line-through text-gray-500' : ''}`}>
                            {settlement.memberName}
                          </span>
                          {isRefund && (
                            <span className="text-xs text-blue-600 font-medium">
                              (Hoàn trả tạm ứng)
                            </span>
                          )}
                        </div>
                        <span className={`font-bold ${isReceived ? 'line-through text-gray-500' : 'text-green-600'}`}>
                          {formatCurrency(settlement.balance, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
          </div>
        </CardContent>
      )}
      
      {!isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Những người cần trả tiền:</h4>
                <div className="space-y-2">
                  {debtors.map(settlement => {
                    const isPaid = paymentStatus[settlement.memberId];
                    return (
                      <div key={settlement.memberId} className={`flex justify-between items-center p-2 rounded ${
                        isPaid ? 'bg-gray-100' : 'bg-red-50'
                      }`}>
                        <span className={`font-medium ${isPaid ? 'line-through text-gray-500' : ''}`}>
                          {settlement.memberName}
                        </span>
                        <span className={`font-bold ${isPaid ? 'line-through text-gray-500' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(settlement.balance), currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Những người sẽ nhận tiền:</h4>
                <div className="space-y-2">
                  {creditors.map(settlement => {
                    const isReceived = paymentStatus[settlement.memberId];
                    return (
                      <div key={settlement.memberId} className={`flex justify-between items-center p-2 rounded ${
                        isReceived ? 'bg-gray-100' : 'bg-green-50'
                      }`}>
                        <span className={`font-medium ${isReceived ? 'line-through text-gray-500' : ''}`}>
                          {settlement.memberName}
                        </span>
                        <span className={`font-bold ${isReceived ? 'line-through text-gray-500' : 'text-green-600'}`}>
                          {formatCurrency(settlement.balance, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
      
    </Card>
  );
}
