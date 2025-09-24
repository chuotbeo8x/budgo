import { AlertCircle, X } from 'lucide-react';
import { Button } from './button';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ 
  title = "Có lỗi xảy ra", 
  message, 
  onDismiss,
  className = ""
}: ErrorAlertProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


