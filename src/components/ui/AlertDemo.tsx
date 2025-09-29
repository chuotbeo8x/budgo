import React from 'react';
import { AlertMessage, TripStatusAlerts } from './AlertMessage';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export const AlertDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Alert Components Demo</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Alert Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertMessage
            type="info"
            title="Thông tin"
            message="Đây là thông báo thông tin"
          />
          
          <AlertMessage
            type="warning"
            title="Cảnh báo"
            message="Đây là thông báo cảnh báo"
          />
          
          <AlertMessage
            type="danger"
            title="Lỗi"
            message="Đây là thông báo lỗi"
          />
          
          <AlertMessage
            type="success"
            title="Thành công"
            message="Đây là thông báo thành công"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip Status Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TripStatusAlerts.closed />
          
          <TripStatusAlerts.archived />
          
          <TripStatusAlerts.upcoming(5) />
          
          <TripStatusAlerts.overdue />
          
          <TripStatusAlerts.noMembers />
          
          <TripStatusAlerts.noExpenses />
          
          <TripStatusAlerts.paymentPending(3) />
          
          <TripStatusAlerts.allPaid />
          
          <TripStatusAlerts.warningForClosing />
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertDemo;
