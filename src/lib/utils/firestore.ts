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
    return data.map(cleanFirestoreData).filter(item => item !== null);
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        const cleanedValue = cleanFirestoreData(value);
        // Only add if the cleaned value is not null
        if (cleanedValue !== null) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    
    // Return null if the object becomes empty after cleaning
    if (Object.keys(cleaned).length === 0) {
      return null;
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





