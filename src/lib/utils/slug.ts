/**
 * Vietnamese text to slug converter
 * Converts Vietnamese text to URL-friendly slug while preserving Vietnamese characters
 */

// Vietnamese character mapping
const vietnameseMap: { [key: string]: string } = {
  // a
  'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
  'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
  
  // e
  'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
  'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
  
  // i
  'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
  'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
  
  // o
  'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
  'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
  
  // u
  'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
  'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
  
  // y
  'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
  
  // d
  'đ': 'd', 'Đ': 'D',
};

/**
 * Convert Vietnamese text to slug
 * @param text - Input text
 * @param maxLength - Maximum length of slug (default: 100)
 * @returns URL-friendly slug
 */
export function createSlug(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  let slug = text
    .toLowerCase()
    .trim();
  
  // Replace Vietnamese characters
  for (const [vietnamese, latin] of Object.entries(vietnameseMap)) {
    slug = slug.replace(new RegExp(vietnamese, 'g'), latin);
  }
  
  // Remove special characters except spaces and hyphens
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  
  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');
  
  // Replace multiple hyphens with single hyphen
  slug = slug.replace(/-+/g, '-');
  
  // Remove leading/trailing hyphens
  slug = slug.replace(/^-|-$/g, '');
  
  // Truncate to max length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing hyphen if it exists after truncation
    if (slug.endsWith('-')) {
      slug = slug.slice(0, -1);
    }
  }
  
  return slug;
}

/**
 * Generate slug from trip name
 * @param name - Trip name
 * @returns URL-friendly slug
 */
export function generateTripSlug(name: string): string {
  return createSlug(name, 100);
}

/**
 * Generate slug from group name
 * @param name - Group name
 * @returns URL-friendly slug
 */
export function generateGroupSlug(name: string): string {
  return createSlug(name, 50);
}

/**
 * Generate slug from username
 * @param username - Username
 * @returns URL-friendly slug
 */
export function generateUsernameSlug(username: string): string {
  return createSlug(username, 30);
}



