/**
 * Convert Firestore Timestamp or Date to JavaScript Date
 */
export function toDate(timestamp: unknown): Date {
  if (!timestamp) {
    console.warn('toDate: timestamp is null/undefined, returning epoch date');
    return new Date(0);
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore Timestamp object
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // If it's a number (milliseconds)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // If it's a string
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // If it's an object with toDate method (Firestore Timestamp)
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's an empty object or invalid object
  if (typeof timestamp === 'object' && Object.keys(timestamp).length === 0) {
    console.warn('toDate: empty object detected, returning epoch date');
    return new Date(0);
  }
  
  console.warn('toDate: unknown timestamp format:', timestamp);
  // Fallback
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





