/**
 * Enhanced input validation utilities
 */

import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
  userId: z.string().min(1, 'User ID is required').max(100, 'User ID too long'),
  groupId: z.string().min(1, 'Group ID is required').max(100, 'Group ID too long'),
  tripId: z.string().min(1, 'Trip ID is required').max(100, 'Trip ID too long'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Name can only contain letters and spaces'),
  amount: z.number()
    .min(0, 'Amount must be positive')
    .max(1000000000, 'Amount too large'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  content: z.string()
    .min(1, 'Content is required')
    .max(2000, 'Content must be less than 2000 characters'),
};

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers
}

// XSS protection
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// SQL injection protection (for Firestore queries)
export function sanitizeQuery(input: string): string {
  return input
    .replace(/[;'"]/g, '') // Remove potential SQL injection characters
    .trim();
}

// Rate limiting for specific operations
export const operationLimits = {
  createGroup: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  createTrip: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  addExpense: { limit: 50, windowMs: 60 * 60 * 1000 }, // 50 per hour
  sendMessage: { limit: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  searchUsers: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
};

// Validation middleware
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, error: 'Invalid input' };
  }
}
