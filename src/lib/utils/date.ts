/**
 * Convert Firestore Timestamp or Date to JavaScript Date
 */
export function toDate(timestamp: unknown): Date {
  if (!timestamp) {
    return new Date(0);
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's an empty object or invalid object (common Firestore issue)
  if (typeof timestamp === 'object' && Object.keys(timestamp).length === 0) {
    return new Date(0);
  }
  
  // If it's an object with toDate method (Firestore Timestamp)
  if (timestamp && typeof timestamp === 'object' && typeof (timestamp as any).toDate === 'function') {
    try {
      return (timestamp as any).toDate();
    } catch (error) {
      return new Date(0);
    }
  }
  
  // If it's a Firestore Timestamp object with seconds property
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && typeof (timestamp as any).seconds === 'number') {
    return new Date((timestamp as any).seconds * 1000);
  }
  
  // If it's a number (milliseconds)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // If it's a string
  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  // Fallback to current date instead of epoch
  return new Date();
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: unknown): string {
  if (!date) return '-';
  const jsDate = toDate(date);
  if (!jsDate || Number.isNaN(jsDate.getTime()) || jsDate.getTime() === 0) return '-';
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0');
  const day = String(jsDate.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * Format date and time to Vietnamese locale
 */
export function formatDateTime(date: unknown): string {
  if (!date) return '-';
  const jsDate = toDate(date);
  if (!jsDate || Number.isNaN(jsDate.getTime()) || jsDate.getTime() === 0) return '-';
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0');
  const day = String(jsDate.getDate()).padStart(2, '0');
  const hours = String(jsDate.getHours()).padStart(2, '0');
  const minutes = String(jsDate.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Safely convert Firestore timestamp to Date, returning null for invalid dates
 */
export function safeToDate(timestamp: unknown): Date | null {
  if (!timestamp) return null;
  
  try {
    const date = toDate(timestamp);
    if (date && !isNaN(date.getTime()) && date.getTime() > 0) {
      return date;
    }
    return null;
  } catch (error) {
    return null;
  }
}





