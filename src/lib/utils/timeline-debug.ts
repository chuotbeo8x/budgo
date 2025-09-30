/**
 * Debug utilities for timeline time display
 */

// Debug function to check time formatting
export function debugTimeFormatting(createdAt: any) {
  console.log('🔍 Debug time formatting for:', createdAt);
  
  try {
    // Check type
    console.log('Type:', typeof createdAt);
    console.log('Is Date:', createdAt instanceof Date);
    console.log('Has toDate:', !!createdAt?.toDate);
    
    // Parse date
    let parsedDate: Date;
    if (createdAt instanceof Date) {
      parsedDate = createdAt;
      console.log('✅ Already a Date object');
    } else if (createdAt?.toDate) {
      parsedDate = createdAt.toDate();
      console.log('✅ Firestore Timestamp converted');
    } else if (typeof createdAt === 'string') {
      parsedDate = new Date(createdAt);
      console.log('✅ String converted to Date');
    } else {
      parsedDate = new Date();
      console.log('⚠️ Fallback to current date');
    }
    
    console.log('Parsed date:', parsedDate.toISOString());
    console.log('Hours:', parsedDate.getHours());
    console.log('Minutes:', parsedDate.getMinutes());
    console.log('Is midnight:', parsedDate.getHours() === 0 && parsedDate.getMinutes() === 0);
    
    // Test formatting
    const timeStr = parsedDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
    
    console.log('Formatted time:', timeStr);
    
    return {
      success: true,
      parsedDate,
      timeStr,
      isMidnight: parsedDate.getHours() === 0 && parsedDate.getMinutes() === 0
    };
  } catch (error) {
    console.error('❌ Error in time formatting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Debug function to check timeline data
export function debugTimelineData(items: any[]) {
  console.log('🔍 Debug timeline data for', items.length, 'items');
  
  items.forEach((item, index) => {
    console.log(`\n--- Item ${index + 1} ---`);
    console.log('ID:', item.id);
    console.log('Type:', item.type);
    console.log('Description:', item.description);
    console.log('Amount:', item.amount);
    console.log('CreatedAt:', item.createdAt);
    console.log('CreatedAt type:', typeof item.createdAt);
    
    const debugResult = debugTimeFormatting(item.createdAt);
    console.log('Debug result:', debugResult);
  });
}

// Debug function to check date grouping
export function debugDateGrouping(items: any[]) {
  console.log('🔍 Debug date grouping for', items.length, 'items');
  
  const groupedItems = items.reduce((groups, item) => {
    const dateKey = new Date(item.createdAt).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {} as { [key: string]: any[] });
  
  console.log('Grouped items:', groupedItems);
  
  Object.keys(groupedItems).forEach(dateKey => {
    console.log(`\n--- Date: ${dateKey} ---`);
    console.log('Items count:', groupedItems[dateKey].length);
    groupedItems[dateKey].forEach((item, index) => {
      console.log(`  Item ${index + 1}:`, {
        id: item.id,
        description: item.description,
        createdAt: item.createdAt,
        time: debugTimeFormatting(item.createdAt).timeStr
      });
    });
  });
  
  return groupedItems;
}

// Debug function to check time sorting
export function debugTimeSorting(items: any[]) {
  console.log('🔍 Debug time sorting for', items.length, 'items');
  
  const sortedItems = items.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    console.log(`Comparing ${a.id} (${aTime}) with ${b.id} (${bTime})`);
    return bTime - aTime;
  });
  
  console.log('Sorted items:');
  sortedItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.description} - ${new Date(item.createdAt).toISOString()}`);
  });
  
  return sortedItems;
}

// Debug function to check time display in timeline
export function debugTimelineTimeDisplay(items: any[]) {
  console.log('🔍 Debug timeline time display for', items.length, 'items');
  
  items.forEach((item, index) => {
    console.log(`\n--- Item ${index + 1} ---`);
    console.log('ID:', item.id);
    console.log('Description:', item.description);
    console.log('CreatedAt:', item.createdAt);
    
    // Test parseCreatedAt
    const parseCreatedAt = (createdAt: any): Date => {
      if (createdAt instanceof Date) {
        return createdAt;
      }
      if (createdAt?.toDate) {
        return createdAt.toDate();
      }
      if (typeof createdAt === 'string') {
        return new Date(createdAt);
      }
      return new Date();
    };
    
    // Test formatTime
    const formatTime = (createdAt: any): string => {
      try {
        const date = parseCreatedAt(createdAt);
        
        // Check if it's a date-only string from database
        if (typeof createdAt === 'string' && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return '--:--';
        }
        
        // Check if the time is 00:00 (likely old data with date-only input)
        const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;
        
        if (isMidnight) {
          return '--:--';
        }
        
        const timeStr = date.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Ho_Chi_Minh'
        });
        
        return timeStr;
      } catch (error) {
        console.error('Error formatting time:', error);
        return '--:--';
      }
    };
    
    const parsedDate = parseCreatedAt(item.createdAt);
    const formattedTime = formatTime(item.createdAt);
    
    console.log('Parsed date:', parsedDate.toISOString());
    console.log('Formatted time:', formattedTime);
    console.log('Is midnight:', parsedDate.getHours() === 0 && parsedDate.getMinutes() === 0);
    console.log('Is date-only string:', typeof item.createdAt === 'string' && item.createdAt.match(/^\d{4}-\d{2}-\d{2}$/));
  });
}

// Export all debug functions
export default {
  debugTimeFormatting,
  debugTimelineData,
  debugDateGrouping,
  debugTimeSorting,
  debugTimelineTimeDisplay,
};
