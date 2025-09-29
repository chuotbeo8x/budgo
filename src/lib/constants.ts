// Expense categories configuration
export const EXPENSE_CATEGORIES = {
  food: {
    slug: 'food',
    name: 'Ăn uống',
    icon: 'Utensils'
  },
  transport: {
    slug: 'transport', 
    name: 'Di chuyển',
    icon: 'Car'
  },
  accommodation: {
    slug: 'accommodation',
    name: 'Lưu trú', 
    icon: 'Home'
  },
  entertainment: {
    slug: 'entertainment',
    name: 'Giải trí',
    icon: 'Gamepad2'
  },
  shopping: {
    slug: 'shopping',
    name: 'Mua sắm',
    icon: 'ShoppingCart'
  },
  fuel: {
    slug: 'fuel',
    name: 'Nhiên liệu',
    icon: 'Fuel'
  },
  toll: {
    slug: 'toll',
    name: 'Phí cầu đường',
    icon: 'Road'
  },
  parking: {
    slug: 'parking',
    name: 'Đỗ xe',
    icon: 'ParkingCircle'
  },
  other: {
    slug: 'other',
    name: 'Khác',
    icon: 'Tag'
  }
} as const;

// Legacy category mapping for old data
export const LEGACY_CATEGORY_MAP = {
  'an-uong': 'food',
  'an_uong': 'food',
  'an uong': 'food'
} as const;

// Helper functions
export const getCategoryName = (slug: string): string => {
  // Check legacy mapping first
  const legacySlug = LEGACY_CATEGORY_MAP[slug as keyof typeof LEGACY_CATEGORY_MAP];
  const finalSlug = legacySlug || slug;
  
  return EXPENSE_CATEGORIES[finalSlug as keyof typeof EXPENSE_CATEGORIES]?.name || 
         slug.charAt(0).toUpperCase() + slug.slice(1);
};

export const getCategoryIcon = (slug: string): string => {
  const legacySlug = LEGACY_CATEGORY_MAP[slug as keyof typeof LEGACY_CATEGORY_MAP];
  const finalSlug = legacySlug || slug;
  
  return EXPENSE_CATEGORIES[finalSlug as keyof typeof EXPENSE_CATEGORIES]?.icon || 'Tag';
};

export const getCategoryOptions = () => {
  return Object.values(EXPENSE_CATEGORIES).map(category => ({
    value: category.slug,
    label: category.name
  }));
};




