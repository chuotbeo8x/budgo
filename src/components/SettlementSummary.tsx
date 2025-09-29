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
  loading = false
}: SettlementSummaryProps) {
  const [internalPaymentStatus, setInternalPaymentStatus] = useState<Record<string, boolean>>({});
  
  // Use external payment status if provided, otherwise use internal state
  const paymentStatus = externalPaymentStatus || paymentStatuses || internalPaymentStatus;
  const paymentStatusCallback = onPaymentStatusChange || onPaymentStatusUpdate;

  const debtors = settlements.filter(s => s.balance < -0.01);
  const creditors = settlements.filter(s => s.balance > 0.01);

  const togglePaymentStatus = (memberId: string) => {
    const newStatus = !paymentStatus[memberId];
    
    if (paymentStatusCallback) {
      paymentStatusCallback(memberId, newStatus);
    } else {
      setInternalPaymentStatus(prev => ({
        ...prev,
        [memberId]: newStatus
      }));
    }
  };

  if (settlements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calculator className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>Chưa có dữ liệu quyết toán</p>
        <p className="text-sm">Thêm chi phí và tạm ứng để xem quyết toán</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
            
            {/* Info Note */}
            <AlertMessage
              type="info"
              title="Lưu ý về tính toán thanh toán"
              message="Chi phí chỉ được chia cho những thành viên có trong chuyến đi khi chi phí được tạo. Thành viên mới thêm vào sau sẽ không bị chia tiền cho các chi phí trước đó."
              icon={<AlertCircle className="w-4 h-4" />}
            />
            
            {/* Settlement List (mobile-first) */}
            <div className="block md:hidden">
              <div className="space-y-2">
                {settlements.map((settlement) => {
                  const isPositive = settlement.balance > 0;
                  const isNegative = settlement.balance < 0;
                  const isZero = Math.abs(settlement.balance) < 0.01;
                  return (
                    <div key={settlement.memberId} className="border border-gray-200 rounded-lg p-3 bg-white">
                      {/* Row: Avatar + Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white font-semibold text-xs">
                            {settlement.memberName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{settlement.memberName}</p>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                            <span>Tổng chi: {formatCurrency(settlement.totalExpenses, currency)}</span>
                            <span>Tạm ứng: {formatCurrency(settlement.totalAdvances, currency)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Row: Amount + Status (same row) */}
                      <div className="mt-2 flex items-center justify-between gap-3">
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
                                disabled={updating}
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
                                  ? 'text-green-600'
                                  : isPositive
                                    ? 'text-amber-600'
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
            <div className="hidden md:block overflow-x-auto">
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
                                  ? 'text-green-600'
                                  : isPositive
                                    ? 'text-amber-600'
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
            
            {/* Settlement Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Những người cần trả tiền:</h4>
                <div className="space-y-2">
                  {debtors.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
                      Không có ai cần trả tiền
                    </div>
                  ) : (
                    debtors.map(settlement => {
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
                    })
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Những người sẽ nhận tiền:</h4>
                <div className="space-y-2">
                  {creditors.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
                      Không có ai cần nhận tiền
                    </div>
                  ) : (
                    creditors.map(settlement => {
                      const isReceived = paymentStatus[settlement.memberId];
                      const isRefund = settlement.totalAdvances > settlement.totalExpenses;
                      return (
                        <div key={settlement.memberId} className={`flex justify-between items-center p-2 rounded ${
                          isReceived ? 'bg-gray-100' : 'bg-amber-50'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isReceived ? 'line-through text-gray-500' : ''}`}>
                              {settlement.memberName}
                            </span>
                            {!isReceived && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Chưa nhận</span>
                            )}
                            {isRefund && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                Hoàn trả tạm ứng
                              </span>
                            )}
                          </div>
                          <span className={`font-bold ${isReceived ? 'line-through text-gray-500' : 'text-amber-700'}`}>
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
