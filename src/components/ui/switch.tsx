"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * Switch Component - Aligned with Design System
 * 
 * Modern toggle switch for settings and preferences
 * Touch-friendly: min 44px tap target
 */

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Design System: Outline style
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      "border-2 transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // States
      "data-[state=checked]:bg-primary-300 data-[state=checked]:border-primary-300",
      "data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-300",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full shadow-md transition-all duration-200",
        "data-[state=checked]:translate-x-5 data-[state=checked]:bg-gray-400",
        "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-gray-400"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

