/**
 * Toast Configuration - Aligned with Design System
 * 
 * From design-system.ts toasts:
 * - Variants: success, error, warning, info, default
 * - Durations: quick (2s), short (3s), normal (5s), long (8s)
 * - Positions: top-right (desktop), top-center (mobile)
 * - Features: pauseOnHover, swipeToDismiss, maxToasts: 5
 */

export const toastConfig = {
  // Duration presets (in milliseconds)
  duration: {
    quick: 2000,
    short: 3000,
    normal: 5000,
    long: 8000,
    infinite: Infinity,
  },

  // Toast variants with custom styling
  variants: {
    success: {
      duration: 3000,
      className: 'bg-success-600 text-white border-success-600',
      icon: '✓',
    },
    error: {
      duration: 5000,
      className: 'bg-error-600 text-white border-error-600',
      icon: '✕',
    },
    warning: {
      duration: 4000,
      className: 'bg-warning-600 text-white border-warning-600',
      icon: '⚠',
    },
    info: {
      duration: 3000,
      className: 'bg-primary-600 text-white border-primary-600',
      icon: 'ℹ',
    },
    default: {
      duration: 3000,
      className: 'bg-white text-gray-900 border-gray-200',
    },
  },

  // Position
  position: {
    desktop: 'top-right' as const,
    mobile: 'top-center' as const,
  },

  // Features
  features: {
    pauseOnHover: true,
    swipeToDismiss: true,
    maxToasts: 5,
  },
} as const;

/**
 * Helper function to show success toast
 */
export function showSuccessToast(message: string, description?: string) {
  const { toast } = require('sonner');
  return toast.success(message, {
    description,
    duration: toastConfig.variants.success.duration,
  });
}

/**
 * Helper function to show error toast
 */
export function showErrorToast(message: string, description?: string) {
  const { toast } = require('sonner');
  return toast.error(message, {
    description,
    duration: toastConfig.variants.error.duration,
  });
}

/**
 * Helper function to show warning toast
 */
export function showWarningToast(message: string, description?: string) {
  const { toast } = require('sonner');
  return toast.warning(message, {
    description,
    duration: toastConfig.variants.warning.duration,
  });
}

/**
 * Helper function to show info toast
 */
export function showInfoToast(message: string, description?: string) {
  const { toast } = require('sonner');
  return toast.info(message, {
    description,
    duration: toastConfig.variants.info.duration,
  });
}

/**
 * Helper function to show loading toast
 */
export function showLoadingToast(message: string) {
  const { toast } = require('sonner');
  return toast.loading(message, {
    duration: Infinity,
  });
}

/**
 * Helper function to dismiss a toast
 */
export function dismissToast(toastId: string | number) {
  const { toast } = require('sonner');
  toast.dismiss(toastId);
}

