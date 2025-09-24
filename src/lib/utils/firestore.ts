/**
 * Remove undefined values from an object before saving to Firestore
 * Firestore doesn't allow undefined values
 */
export function cleanFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  // Preserve Date objects so Firestore can store them as Timestamps
  if (data instanceof Date) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData);
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned;
  }
  
  return data;
}

/**
 * Prepare data for Firestore (clean undefined values)
 */
export function prepareFirestoreData(data: any): any {
  const cleaned = cleanFirestoreData(data);
  
  // Let Firestore automatically convert Date objects to Timestamp
  return cleaned;
}





