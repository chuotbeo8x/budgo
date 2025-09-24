'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSlug } from '@/lib/utils/slug';

export default function TestSlugPage() {
  const [input, setInput] = useState('Đi chơi với bạn bè');
  const [result, setResult] = useState('');

  const handleInputChange = (value: string) => {
    setInput(value);
    setResult(createSlug(value));
  };

  const testCases = [
    'Đi chơi với bạn bè',
    'Chuyến đi Đà Lạt',
    'Nhóm du lịch Hà Nội',
    'Công việc tại TP.HCM',
    'Ăn uống cùng đồng nghiệp',
    'Học tập tại trường đại học',
    'Thể thao và giải trí',
    'Mua sắm cuối tuần',
    'Gặp gỡ gia đình',
    'Nghỉ dưỡng biển đẹp'
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Vietnamese Slug Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="input">Nhập văn bản tiếng Việt:</Label>
              <Input
                id="input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Nhập văn bản tiếng Việt..."
                className="mt-2"
              />
            </div>
            <div>
              <Label>Kết quả slug:</Label>
              <div className="mt-2 p-3 bg-gray-100 rounded-lg font-mono text-lg">
                {result || 'Chưa có kết quả'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testCases.map((testCase, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{testCase}</div>
                  <div className="text-sm text-gray-500">→ {createSlug(testCase)}</div>
                </div>
                <button
                  onClick={() => handleInputChange(testCase)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Test
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


