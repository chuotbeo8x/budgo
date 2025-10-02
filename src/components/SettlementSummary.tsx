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
import { AlertMessage } from '@/components/ui/AlertMessage';
import { useState } from 'react';
import { updateMemberPaymentStatus } from '@/lib/actions/trips';
import { toast } from 'sonner';

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
  // Legacy props for backward compatibility
  paymentStatuses?: Record<string, boolean>;
  onPaymentStatusUpdate?: (memberId: string, status: boolean) => void;
  updating?: boolean;
  loading?: boolean;
  // New props for trip-based payment status
  tripId?: string;
  userId?: string;
}

export default function SettlementSummary({ 
  settlements, 
  currency, 
  showDetails = false,
  showToggle = true,
  isOwner = false,
  paymentStatus: externalPaymentStatus,
  onPaymentStatusChange,
  // Legacy props
  paymentStatuses,
  onPaymentStatusUpdate,
  updating = false,
  loading = false,
  // New props
  tripId,
  userId
}: SettlementSummaryProps) {
  const [internalPaymentStatus, setInternalPaymentStatus] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Use external payment status if provided, otherwise use internal state
  const paymentStatus = externalPaymentStatus || paymentStatuses || internalPaymentStatus;
  const paymentStatusCallback = onPaymentStatusChange || onPaymentStatusUpdate;

  // Debug logging
  console.log('SettlementSummary - Payment status:', paymentStatus);
  console.log('SettlementSummary - Settlements:', settlements.map(s => ({ memberId: s.memberId, balance: s.balance })));

  const debtors = settlements.filter(s => s.balance < -0.01);
  const creditors = settlements.filter(s => s.balance > 0.01);

  const togglePaymentStatus = async (memberId: string) => {
    const newStatus = !paymentStatus[memberId];
    
    // If we have tripId and userId, use the new trip-based approach
    if (tripId && userId) {
      setIsUpdating(true);
      
      try {
        // Optimistic update
        setInternalPaymentStatus(prev => ({
          ...prev,
          [memberId]: newStatus
        }));
        
        // Call server action
        await updateMemberPaymentStatus(tripId, memberId, newStatus, userId);
        
        // Call parent callback if provided (parent will handle toast notification)
        if (paymentStatusCallback) {
          paymentStatusCallback(memberId, newStatus);
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
        
        // Revert optimistic update
        setInternalPaymentStatus(prev => ({
          ...prev,
          [memberId]: !newStatus
        }));
        
        // Show error toast (this is the only toast we keep in this component)
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
      } finally {
        setIsUpdating(false);
      }
    } else if (paymentStatusCallback) {
      // Fallback to legacy approach
      paymentStatusCallback(memberId, newStatus);
    } else {
      // Internal state only
      setInternalPaymentStatus(prev => ({
        ...prev,
        [memberId]: newStatus
      }));
    }
  };

  if (settlements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Calculator className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-600 font-medium">Chưa có dữ liệu quyết toán</p>
            <p className="text-sm text-gray-500 mt-1">Thêm chi phí và tạm ứng để xem quyết toán</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1 text-sm">Lưu ý về tính toán thanh toán</h4>
            <p className="text-xs text-blue-800">
              Chi phí chỉ được chia cho những thành viên có trong chuyến đi khi chi phí được tạo. 
              Thành viên mới thêm vào sau sẽ không bị chia tiền cho các chi phí trước đó.
            </p>
          </div>
        </div>
      </div>
            
      {/* Settlement List (mobile-first) */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {settlements.map((settlement) => {
            const isPositive = settlement.balance > 0;
            const isNegative = settlement.balance < 0;
            const isZero = Math.abs(settlement.balance) < 0.01;
            return (
              <div key={settlement.memberId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Row: Avatar + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {settlement.memberName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate text-sm">{settlement.memberName}</p>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-red-500" />
                        Tổng chi: {formatCurrency(settlement.totalExpenses, currency)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-blue-500" />
                        Tạm ứng: {formatCurrency(settlement.totalAdvances, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row: Amount + Status */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className={`text-base font-bold ${
                    isZero ? 'text-gray-600' : isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(settlement.balance, currency)}
                  </div>
                  {isZero ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Đã cân bằng</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end w-full max-w-[200px]">
                      {isOwner ? (
                        <Button
                          variant={paymentStatus[settlement.memberId] ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => togglePaymentStatus(settlement.memberId)}
                          disabled={updating || isUpdating}
                          className={`flex items-center gap-2 w-full justify-start min-w-[140px] ${
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
                        <div className={`flex items-center gap-2 w-full justify-start min-w-[140px] ${
                          paymentStatus[settlement.memberId]
                            ? 'text-gray-500'
                            : isPositive
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}>
                          {paymentStatus[settlement.memberId] ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">{isPositive ? 'Đã nhận' : 'Đã trả'}</span>
                            </>
                          ) : isPositive ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Chưa nhận</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Chưa trả</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
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
                  <tr key={settlement.memberId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {settlement.memberName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{settlement.memberName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-red-500" />
                        <span className="text-base font-semibold text-red-600">
                          {formatCurrency(settlement.totalExpenses, currency)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        <span className="text-base font-semibold text-blue-600">
                          {formatCurrency(settlement.totalAdvances, currency)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-gray-500" />
                        <span className={`text-base font-bold ${
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
                        ) : (isOwner && showToggle) ? (
                          <Button
                            variant={paymentStatus[settlement.memberId] ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              console.log('Button clicked for settlement:', {
                                settlementMemberId: settlement.memberId,
                                paymentStatusValue: paymentStatus[settlement.memberId],
                                allPaymentStatus: paymentStatus
                              });
                              togglePaymentStatus(settlement.memberId);
                            }}
                            disabled={updating || isUpdating}
                            className={`flex items-center gap-2 min-w-[128px] justify-start ${
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
                          <div className={`flex items-center gap-2 min-w-[128px] justify-start ${
                            paymentStatus[settlement.memberId]
                              ? 'text-gray-500'
                              : isPositive
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}>
                            {paymentStatus[settlement.memberId] ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{isPositive ? 'Đã nhận' : 'Đã trả'}</span>
                              </>
                            ) : isPositive ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Chưa nhận</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Chưa trả</span>
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
      </div>
            
      {/* Settlement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Debtors Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Những người cần trả tiền
          </h4>
          <div className="space-y-2">
            {debtors.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Không có ai cần trả tiền</span>
                </div>
              </div>
            ) : (
              debtors.map(settlement => {
                const isPaid = paymentStatus[settlement.memberId];
                return (
                  <div key={settlement.memberId} className={`flex justify-between items-center p-3 rounded-lg border ${
                    isPaid ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <span className={`font-medium text-sm ${isPaid ? 'line-through text-gray-500' : 'text-red-800'}`}>
                      {settlement.memberName}
                    </span>
                    <span className={`font-bold text-sm ${isPaid ? 'line-through text-gray-500' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(settlement.balance), currency)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Creditors Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Những người sẽ nhận tiền
          </h4>
          <div className="space-y-2">
            {creditors.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Không có ai cần nhận tiền</span>
                </div>
              </div>
            ) : (
              creditors.map(settlement => {
                const isReceived = paymentStatus[settlement.memberId];
                const isRefund = settlement.totalAdvances > settlement.totalExpenses;
                return (
                  <div key={settlement.memberId} className={`flex justify-between items-center p-3 rounded-lg border ${
                    isReceived ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`font-medium text-sm ${isReceived ? 'line-through text-gray-500' : 'text-yellow-800'}`}>
                        {settlement.memberName}
                      </span>
                      {!isReceived && isRefund && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap cursor-help"
                          title="Hoàn trả tạm ứng"
                        >
                          🔄
                        </span>
                      )}
                      {!isReceived && !isRefund && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
                          ⏳
                        </span>
                      )}
                    </div>
                    <span className={`font-bold text-sm ${isReceived ? 'line-through text-gray-500' : 'text-yellow-700'} flex-shrink-0`}>
                      {formatCurrency(settlement.balance, currency)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
            
    </div>
  );
}
