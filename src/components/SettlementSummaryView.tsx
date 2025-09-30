'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface Settlement {
  memberId: string;
  balance: number;
}

interface SettlementSummaryViewProps {
  settlements: Settlement[];
  currency: string;
  paymentStatus: Record<string, boolean>;
}

export default function SettlementSummaryView({ 
  settlements, 
  currency, 
  paymentStatus 
}: SettlementSummaryViewProps) {
  
  console.log('🎯 SettlementSummaryView - Payment status:', paymentStatus);
  console.log('🎯 SettlementSummaryView - Settlements:', settlements);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900">
                  Thành viên
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-900">
                  Số tiền
                </th>
                <th className="py-3 px-6 text-center text-sm font-medium text-gray-900">
                  Trạng thái
                </th>
              </tr>
            </thead>
            
            <tbody>
              {settlements.map((settlement) => {
                const isPositive = settlement.balance > 0;
                const isZero = settlement.balance === 0;
                const isPaid = paymentStatus[settlement.memberId] || false;

                return (
                  <tr key={settlement.memberId} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {settlement.memberId.includes('ghost_') 
                              ? settlement.memberId.split('_').slice(2).join(' ')
                              : 'Bạn'
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className={`text-sm font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isZero 
                          ? '0' 
                          : `${isPositive ? '+' : ''}${formatCurrency(Math.abs(settlement.balance), currency)}`
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {isPositive ? 'Sẽ nhận' : 'Sẽ trả'}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        {isZero ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Đã cân bằng</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 min-w-[128px] justify-center ${
                            isPaid
                              ? 'text-green-600'
                              : isPositive
                                ? 'text-amber-600'
                                : 'text-red-600'
                          }`}>
                            {isPaid ? (
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
    </div>
  );
}
