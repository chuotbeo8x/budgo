import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

/**
 * FormField Component - Aligned with Design System
 * 
 * From design-system.ts forms:
 * - Field spacing: 1rem (16px) between fields
 * - Label spacing: 0.5rem (8px) below label
 * - Error/hint text: 0.75rem (12px) font size
 */

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  success?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  success,
  children,
  className,
  id,
}: FormFieldProps) {
  const fieldId = id || React.useId();
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            id: fieldId,
            "aria-describedby": hint ? hintId : error ? errorId : undefined,
            "aria-invalid": error ? true : undefined,
            error: error ? true : undefined,
          } as any);
        }
        return child;
      })}

      {/* Hint text */}
      {hint && !error && !success && (
        <div id={hintId} className="flex items-start gap-1.5 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>{hint}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div id={errorId} className="flex items-start gap-1.5 text-xs text-error-600" role="alert">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && !error && (
        <div className="flex items-start gap-1.5 text-xs text-success-600">
          <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
    </div>
  );
}

/**
 * FormGroup - For grouping multiple related fields
 */
interface FormGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ title, description, children, className }: FormGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * FormSection - For major sections in long forms
 */
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

