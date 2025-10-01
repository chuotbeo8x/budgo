import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Component - Aligned with Design System
 * 
 * Sizes from design-system.ts componentVariants.button:
 * - xs: 28px (1.75rem)
 * - sm: 32px (2rem)
 * - md: 40px (2.5rem) - default
 * - lg: 44px (2.75rem) - WCAG touch target compliant
 * 
 * Touch targets: min 44px on mobile (WCAG 2.1 AAA)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary/50",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-ring/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/30 dark:hover:bg-accent/50",
        link: 
          "text-primary underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
        success:
          "bg-success-600 text-white shadow-sm hover:bg-success-700 focus-visible:ring-success-500/50",
        warning:
          "bg-warning-600 text-white shadow-sm hover:bg-warning-700 focus-visible:ring-warning-500/50",
      },
      size: {
        xs: "h-7 text-xs px-2 rounded-md gap-1.5 [&_svg]:size-3",
        sm: "h-8 text-sm px-3 rounded-md gap-1.5 [&_svg]:size-4",
        default: "h-10 text-sm px-4 rounded-lg gap-2 [&_svg]:size-4",
        lg: "h-11 text-base px-6 rounded-lg gap-2 [&_svg]:size-5 min-h-[44px]", // WCAG compliant
        icon: "size-9 rounded-md [&_svg]:size-4",
        "icon-sm": "size-8 rounded-md [&_svg]:size-4",
        "icon-lg": "size-11 rounded-lg min-h-[44px] [&_svg]:size-5", // WCAG compliant
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps 
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg 
              className="animate-spin" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
export type { ButtonProps }
