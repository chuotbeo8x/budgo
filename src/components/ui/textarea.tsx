import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Textarea Component - Aligned with Design System
 * 
 * Same styling as Input for consistency
 * - fontSize: 0.875rem (14px)
 * - padding: 0.75rem (12px)
 * - borderRadius: 0.375rem (6px)
 * - Min height: 80px
 */

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error}
        className={cn(
          // Base styles
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2",
          "text-sm md:text-sm", // 16px on mobile, 14px on desktop
          "shadow-sm transition-colors duration-200",
          "outline-none resize-y",
          
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
          
          // Dark mode
          "dark:bg-input/30 dark:border-input",
          
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
export type { TextareaProps }

