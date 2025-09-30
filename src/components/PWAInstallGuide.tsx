'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Chrome, 
  Safari, 
  Edge, 
  Firefox,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PWAInstallGuideProps {
  className?: string;
}

export default function PWAInstallGuide({ className = '' }: PWAInstallGuideProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const browserIcons = {
    chrome: Chrome,
    safari: Safari,
    edge: Edge,
    firefox: Firefox,
  };

  const installSteps = [
    {
      id: 'mobile-chrome',
      title: 'Trên điện thoại (Chrome)',
      icon: Smartphone,
      steps: [
        'Mở Budgo trong trình duyệt Chrome',
        'Nhấn vào menu (3 chấm) ở góc trên bên phải',
        'Chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính"',
        'Nhấn "Cài đặt" để xác nhận',
        'Ứng dụng sẽ xuất hiện trên màn hình chính của bạn'
      ]
    },
    {
      id: 'desktop-chrome',
      title: 'Trên máy tính (Chrome/Edge)',
      icon: Monitor,
      steps: [
        'Mở Budgo trong trình duyệt Chrome hoặc Edge',
        'Nhấn vào biểu tượng cài đặt ở thanh địa chỉ',
        'Chọn "Cài đặt Budgo"',
        'Nhấn "Cài đặt" để xác nhận',
        'Ứng dụng sẽ được cài đặt như một ứng dụng desktop'
      ]
    },
    {
      id: 'mobile-safari',
      title: 'Trên iPhone (Safari)',
      icon: Smartphone,
      steps: [
        'Mở Budgo trong Safari',
        'Nhấn vào nút "Chia sẻ" (hình vuông với mũi tên)',
        'Cuộn xuống và chọn "Thêm vào màn hình chính"',
        'Nhấn "Thêm" để xác nhận',
        'Ứng dụng sẽ xuất hiện trên màn hình chính'
      ]
    },
    {
      id: 'desktop-safari',
      title: 'Trên Mac (Safari)',
      icon: Monitor,
      steps: [
        'Mở Budgo trong Safari',
        'Vào menu "Tệp" > "Thêm vào Dock"',
        'Hoặc kéo tab Budgo ra khỏi thanh tab để tạo cửa sổ riêng',
        'Ứng dụng sẽ được thêm vào Dock'
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Hướng dẫn cài đặt PWA
        </CardTitle>
        <CardDescription>
          Cài đặt Budgo như một ứng dụng trên thiết bị của bạn để có trải nghiệm tốt hơn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {installSteps.map((section) => {
          const IconComponent = section.icon;
          const isExpanded = expandedSection === section.id;
          
          return (
            <div key={section.id} className="border rounded-lg">
              <Button
                variant="ghost"
                onClick={() => toggleSection(section.id)}
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t">
                  <ol className="space-y-2 mt-3">
                    {section.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Lợi ích của PWA:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Truy cập nhanh từ màn hình chính
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Hoạt động offline
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Thông báo đẩy
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Trải nghiệm như ứng dụng gốc
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
