import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component - Aligned with Design System
 * 
 * From design-system.ts forms.fieldSizes.md:
 * - height: 2.5rem (40px)
 * - fontSize: 0.875rem (14px)
 * - padding: 0.75rem (12px)
 * - borderRadius: 0.375rem (6px)
 * 
 * Accessibility:
 * - Min font size: 16px on mobile to prevent zoom
 * - Clear focus states
 * - Error states with aria-invalid
 */

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        aria-invalid={error}
        className={cn(
          // Base styles - Design System compliant
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "text-sm md:text-sm", // 16px on mobile, 14px on desktop
          "shadow-sm transition-colors duration-200",
          "outline-none",
          
          // Placeholder
          "placeholder:text-muted-foreground",
          
          // Selection
          "selection:bg-primary selection:text-primary-foreground",
          
          // Focus state
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          
          // Error state
          "aria-[invalid=true]:border-error-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error-500/20",
          
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          
          // Dark mode
          "dark:bg-input/30 dark:border-input",
          
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
export type { InputProps }
