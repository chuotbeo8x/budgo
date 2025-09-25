'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp, Clock, MapPin } from 'lucide-react';

interface GroupStatsProps {
  memberCount: number;
  tripCount: number;
  totalExpense: number;
  currency: string;
  averageExpensePerPerson: number;
  mostActiveMonth: string;
  topDestination: string;
}

export default function GroupStats({ 
  memberCount, 
  tripCount, 
  totalExpense, 
  currency,
  averageExpensePerPerson,
  mostActiveMonth,
  topDestination
}: GroupStatsProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD',
    }).format(amount);
  };

  const stats = [
    {
      title: 'Thành viên',
      value: memberCount,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Tổng số thành viên'
    },
    {
      title: 'Chuyến đi',
      value: tripCount,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Số chuyến đi đã tạo'
    },
    {
      title: 'Tổng chi phí',
      value: formatCurrency(totalExpense, currency),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Tổng chi phí tất cả chuyến đi'
    },
    {
      title: 'Chi phí TB/người',
      value: formatCurrency(averageExpensePerPerson, currency),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Chi phí trung bình mỗi người'
    }
  ];

  const insights = [
    {
      icon: Clock,
      title: 'Tháng hoạt động nhiều nhất',
      value: mostActiveMonth || 'Chưa có dữ liệu',
      color: 'text-indigo-600'
    },
    {
      icon: MapPin,
      title: 'Điểm đến yêu thích',
      value: topDestination || 'Chưa có dữ liệu',
      color: 'text-pink-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Thống kê chi tiết
          </CardTitle>
          <CardDescription>
            Các thông tin thú vị về nhóm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-white`}>
                    <Icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {insight.title}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {insight.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



