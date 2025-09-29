import React from 'react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { AlertTriangle, Info, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';

export type AlertType = 'info' | 'warning' | 'danger' | 'success';

export interface AlertMessageProps {
  type: AlertType;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

const getAlertConfig = (type: AlertType) => {
  switch (type) {
    case 'info':
      return {
        variant: 'info' as const,
        defaultIcon: <Info className="h-4 w-4" />,
        defaultTitle: 'Thông tin'
      };
    case 'warning':
      return {
        variant: 'warning' as const,
        defaultIcon: <AlertTriangle className="h-4 w-4" />,
        defaultTitle: 'Cảnh báo'
      };
    case 'danger':
      return {
        variant: 'destructive' as const,
        defaultIcon: <XCircle className="h-4 w-4" />,
        defaultTitle: 'Lỗi'
      };
    case 'success':
      return {
        variant: 'success' as const,
        defaultIcon: <CheckCircle className="h-4 w-4" />,
        defaultTitle: 'Thành công'
      };
    default:
      return {
        variant: 'info' as const,
        defaultIcon: <Info className="h-4 w-4" />,
        defaultTitle: 'Thông tin'
      };
  }
};

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  icon,
  className
}) => {
  const config = getAlertConfig(type);
  
  return (
    <Alert variant={config.variant} className={className}>
      {icon || config.defaultIcon}
      <AlertTitle>
        {title || config.defaultTitle}
      </AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
};

// Predefined alert messages for common use cases
export const TripStatusAlerts = {
  closed: () => (
    <AlertMessage
      type="warning"
      title="Chuyến đi đã được lưu trữ"
      message="Không thể thực hiện thay đổi"
    />
  ),
  
  archived: () => (
    <AlertMessage
      type="info"
      title="Chuyến đi đã được lưu trữ"
      message="Chuyến đi này đã được lưu trữ và không thể chỉnh sửa"
    />
  ),
  
  upcoming: (daysUntilTrip: number) => (
    <AlertMessage
      type="info"
      title="Chuyến đi sắp tới"
      message={`Chuyến đi sẽ diễn ra trong ${daysUntilTrip} ngày`}
      icon={<Calendar className="h-4 w-4" />}
    />
  ),
  
  overdue: () => (
    <AlertMessage
      type="warning"
      title="Chuyến đi đã kết thúc"
      message="Chuyến đi này đã kết thúc, hãy hoàn tất quyết toán"
    />
  ),
  
  noMembers: () => (
    <AlertMessage
      type="warning"
      title="Chưa có thành viên"
      message="Chuyến đi này chưa có thành viên nào tham gia"
    />
  ),
  
  noExpenses: () => (
    <AlertMessage
      type="info"
      title="Chưa có chi phí"
      message="Chuyến đi này chưa có chi phí nào được ghi nhận"
    />
  ),
  
  paymentPending: (pendingCount: number) => (
    <AlertMessage
      type="warning"
      title="Thanh toán chưa hoàn tất"
      message={`Còn ${pendingCount} thành viên chưa thanh toán`}
    />
  ),
  
  allPaid: () => (
    <AlertMessage
      type="success"
      title="Thanh toán hoàn tất"
      message="Tất cả thành viên đã thanh toán"
      icon={<CheckCircle className="h-4 w-4" />}
    />
  ),
  
  warningForClosing: () => (
    <AlertMessage
      type="warning"
      title="Lưu ý quan trọng"
      message="Sau khi lưu trữ chuyến đi, bạn sẽ không thể thêm, sửa hoặc xóa chi phí và tạm ứng. Hành động này không thể hoàn tác."
    />
  )
};

export default AlertMessage;
