/**
 * Design System - Central configuration for consistent styling
 * This file defines all design tokens used throughout the application
 */

// Color System
export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Main primary
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Gray Scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
} as const;

// Spacing System (Tailwind-based)
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const;

// Typography System
export const typography = {
  // Font Sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Layout Breakpoints (Tailwind defaults - Mobile First)
export const breakpoints = {
  sm: '640px',    // Small devices (landscape phones, 640px and up)
  md: '768px',    // Medium devices (tablets, 768px and up)
  lg: '1024px',   // Large devices (desktops, 1024px and up)
  xl: '1280px',   // Extra large devices (large desktops, 1280px and up)
  '2xl': '1536px', // 2X large devices (larger desktops, 1536px and up)
} as const;

// Device Categories
export const devices = {
  mobile: {
    portrait: '320px - 480px',
    landscape: '481px - 767px',
  },
  tablet: {
    portrait: '768px - 1023px',
    landscape: '1024px - 1279px',
  },
  desktop: {
    small: '1280px - 1535px',
    large: '1536px+',
  },
} as const;

// Touch Targets (WCAG 2.1 AAA)
export const touchTargets = {
  minimum: '44px',      // WCAG 2.1 minimum
  recommended: '48px',  // Recommended size
  comfortable: '56px',  // Comfortable for mobile
} as const;

// Responsive Spacing
export const responsiveSpacing = {
  mobile: {
    container: '1rem',    // 16px
    section: '1.5rem',    // 24px
    element: '0.75rem',   // 12px
  },
  tablet: {
    container: '1.5rem',  // 24px
    section: '2rem',      // 32px
    element: '1rem',      // 16px
  },
  desktop: {
    container: '2rem',    // 32px
    section: '3rem',      // 48px
    element: '1.5rem',    // 24px
  },
} as const;

// Background System - Simplified Single Color Approach
export const backgrounds = {
  // Main Background - Used everywhere
  main: 'bg-main', // bg-gray-50
  
  // Alternative backgrounds for specific needs
  white: 'bg-main-white', // bg-white
  gradient: 'bg-main-gradient', // bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
  
  // Legacy support - will be deprecated
  page: {
    primary: 'bg-main',
    dashboard: 'bg-main',
    loading: 'bg-main',
  },
  
  card: {
    primary: 'bg-main-white',
    secondary: 'bg-main',
  },
} as const;

// Component Variants
export const componentVariants = {
  // Button sizes with consistent spacing
  button: {
    xs: {
      height: '1.75rem',    // 28px
      paddingX: '0.5rem',   // 8px
      fontSize: '0.75rem',  // 12px
    },
    sm: {
      height: '2rem',       // 32px
      paddingX: '0.75rem',  // 12px
      fontSize: '0.875rem', // 14px
    },
    md: {
      height: '2.5rem',     // 40px
      paddingX: '1rem',     // 16px
      fontSize: '0.875rem', // 14px
    },
    lg: {
      height: '2.75rem',    // 44px
      paddingX: '1.5rem',   // 24px
      fontSize: '1rem',     // 16px
    },
  },
  
  // Card variants
  card: {
    padding: '1rem',        // 16px
    borderRadius: '0.5rem', // 8px
    shadow: shadows.sm,
  },
  
  // Input variants
  input: {
    height: '2.5rem',       // 40px
    paddingX: '0.75rem',    // 12px
    fontSize: '0.875rem',   // 14px
    borderRadius: '0.375rem', // 6px
  },
  
  // Toolbar variants
  toolbar: {
    height: '3.5rem',       // 56px
    paddingX: '1rem',       // 16px
    paddingY: '0.5rem',     // 8px
    gap: '0.75rem',         // 12px
    borderRadius: '0.5rem', // 8px
  },
  
  // Tooltip variants
  tooltip: {
    paddingX: '0.75rem',    // 12px
    paddingY: '0.5rem',     // 8px
    fontSize: '0.75rem',    // 12px
    borderRadius: '0.375rem', // 6px
    maxWidth: '20rem',      // 320px
  },
  
  // List variants
  list: {
    item: {
      paddingX: '1rem',     // 16px
      paddingY: '0.75rem',  // 12px
      gap: '0.75rem',       // 12px
      borderRadius: '0.375rem', // 6px
    },
    divider: {
      height: '1px',
      marginY: '0.5rem',    // 8px
    },
  },
  
  // Loading variants
  loading: {
    spinner: {
      sm: '1rem',           // 16px
      md: '1.5rem',         // 24px
      lg: '2.5rem',         // 40px
      xl: '4rem',           // 64px
    },
    skeleton: {
      height: {
        sm: '1rem',         // 16px
        md: '1.5rem',       // 24px
        lg: '2.5rem',       // 40px
      },
      borderRadius: '0.25rem', // 4px
    },
  },
  
  // Divider variants
  divider: {
    horizontal: {
      height: '1px',
      marginY: '1rem',      // 16px
    },
    vertical: {
      width: '1px',
      marginX: '1rem',      // 16px
    },
  },
  
  // Date & Time Picker variants
  datePicker: {
    height: '2.5rem',       // 40px
    paddingX: '0.75rem',    // 12px
    fontSize: '0.875rem',   // 14px
    borderRadius: '0.375rem', // 6px
    calendarWidth: '20rem', // 320px
    cellSize: '2.25rem',    // 36px
  },
  
  timePicker: {
    height: '2.5rem',       // 40px
    paddingX: '0.75rem',    // 12px
    fontSize: '0.875rem',   // 14px
    borderRadius: '0.375rem', // 6px
    dropdownWidth: '12rem', // 192px
  },
  
  // Navigation variants
  navigation: {
    height: '4rem',         // 64px
    paddingX: '1rem',       // 16px
    gap: '1.5rem',          // 24px
    link: {
      paddingX: '1rem',     // 16px
      paddingY: '0.5rem',   // 8px
      fontSize: '0.875rem', // 14px
      borderRadius: '0.375rem', // 6px
    },
    mobile: {
      height: '3.5rem',     // 56px
    },
  },
  
  // Tabs variants
  tabs: {
    container: {
      gap: '0.25rem',       // 4px
      borderRadius: '0.5rem', // 8px
      padding: '0.25rem',   // 4px
    },
    tab: {
      paddingX: '1rem',     // 16px
      paddingY: '0.5rem',   // 8px
      fontSize: '0.875rem', // 14px
      borderRadius: '0.375rem', // 6px
      minWidth: '5rem',     // 80px
    },
    underline: {
      height: '2px',
      borderRadius: '1px',
    },
  },
} as const;

// Page Layout Standards
export const pageLayout = {
  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Standard page padding
  padding: {
    mobile: '1rem',    // 16px
    desktop: '2rem',   // 32px
  },
  
  // Section spacing
  sectionSpacing: {
    mobile: '1.5rem',  // 24px
    desktop: '2rem',   // 32px
  },
} as const;

// Icon Sizes
export const iconSizes = {
  xs: '0.75rem',    // 12px
  sm: '1rem',       // 16px
  md: '1.25rem',    // 20px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
} as const;

// Animation Durations
export const animations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// Grid System
export const grid = {
  columns: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  },
  gap: {
    none: '0',
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
  },
} as const;

// Flex System
export const flex = {
  direction: {
    row: 'flex-row',
    col: 'flex-col',
    rowReverse: 'flex-row-reverse',
    colReverse: 'flex-col-reverse',
  },
  align: {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  },
  justify: {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  },
} as const;

// Aspect Ratios
export const aspectRatios = {
  square: '1:1',      // 1:1
  video: '16:9',      // 16:9 (YouTube, video players)
  portrait: '3:4',    // 3:4 (Portrait photos)
  landscape: '4:3',   // 4:3 (Landscape photos)
  ultrawide: '21:9',  // 21:9 (Cinema)
  golden: '1.618:1',  // Golden ratio
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Logo Guidelines
export const logo = {
  // Logo Sizes (height in pixels)
  sizes: {
    xs: '24px',   // 24px - Favicon, small icons
    sm: '32px',   // 32px - Mobile header, compact views
    md: '40px',   // 40px - Desktop header (default)
    lg: '48px',   // 48px - Hero sections, landing pages
    xl: '64px',   // 64px - Large promotional areas
  },

  // Minimum sizes (never go below these)
  minSizes: {
    digital: '24px',   // Minimum for digital/screen use
    print: '15mm',     // Minimum for print (approx 57px)
  },

  // Clear space (minimum space around logo)
  clearSpace: {
    minimum: '0.5x',   // 0.5x of logo height
    recommended: '1x', // 1x of logo height (preferred)
  },

  // Logo variants
  variants: {
    primary: {
      name: 'Primary Logo',
      usage: 'Main logo for light backgrounds',
      colors: ['Blue #2563eb', 'Gray #111827'],
    },
    white: {
      name: 'White Logo',
      usage: 'For dark backgrounds and photos',
      colors: ['White #ffffff'],
    },
    dark: {
      name: 'Dark Logo',
      usage: 'Alternative for light backgrounds',
      colors: ['Gray #111827'],
    },
    monochrome: {
      name: 'Monochrome',
      usage: 'Single color applications',
      colors: ['Any single color'],
    },
  },

  // Logo placement rules
  placement: {
    header: {
      position: 'top-left',
      size: 'md',
      margin: '1rem',
    },
    footer: {
      position: 'center',
      size: 'sm',
      margin: '2rem',
    },
    favicon: {
      size: 'xs',
      format: ['ico', 'png', 'svg'],
    },
  },

  // Do's and Don'ts
  rules: {
    dos: [
      'Use approved logo variants only',
      'Maintain minimum clear space',
      'Use on appropriate backgrounds',
      'Keep proportions intact',
      'Use high-resolution files',
    ],
    donts: [
      'Distort or stretch the logo',
      'Change logo colors',
      'Add effects (shadows, gradients)',
      'Rotate the logo',
      'Place on busy backgrounds',
      'Use low-resolution files',
    ],
  },

  // File formats
  formats: {
    digital: ['SVG', 'PNG'],
    print: ['AI', 'EPS', 'PDF'],
    social: ['PNG', 'JPG'],
  },
} as const;

// Icon System Guidelines
export const icons = {
  // Icon library: Lucide React
  library: 'Lucide React',
  website: 'https://lucide.dev',

  // Icon sizes (matches iconSizes constant)
  sizes: {
    xs: '0.75rem',    // 12px - Very small, inline with text
    sm: '1rem',       // 16px - Small, buttons, inputs
    md: '1.25rem',    // 20px - Default size (most common)
    lg: '1.5rem',     // 24px - Large, section headers
    xl: '2rem',       // 32px - Extra large, hero sections
    '2xl': '2.5rem',  // 40px - Feature highlights
  },

  // Stroke width
  strokeWidth: {
    thin: 1,
    default: 2,       // Standard stroke width
    thick: 3,
  },

  // Icon colors (semantic)
  colors: {
    default: '#374151',    // gray-700
    primary: '#2563eb',    // blue-600
    secondary: '#4b5563',  // gray-600
    success: '#16a34a',    // green-600
    warning: '#d97706',    // yellow-600
    error: '#dc2626',      // red-600
    muted: '#9ca3af',      // gray-400
    white: '#ffffff',
  },

  // Usage contexts
  contexts: {
    inline: {
      size: 'xs',
      usage: 'Icons inline with text (same line height)',
    },
    button: {
      size: 'sm',
      usage: 'Icons inside buttons',
      spacing: '0.5rem',  // Gap between icon and text
    },
    input: {
      size: 'sm',
      usage: 'Icons in form inputs',
      position: 'left or right',
    },
    standalone: {
      size: 'md',
      usage: 'Default standalone icons',
    },
    header: {
      size: 'lg',
      usage: 'Icons in section headers/titles',
    },
    feature: {
      size: 'xl',
      usage: 'Feature highlight icons',
      container: 'Often in circular/rounded containers',
    },
    hero: {
      size: '2xl',
      usage: 'Large promotional icons',
    },
  },

  // Icon containers
  containers: {
    circle: {
      borderRadius: '9999px',
      sizes: {
        sm: '2rem',    // 32px
        md: '2.5rem',  // 40px
        lg: '3rem',    // 48px
      },
      usage: 'Feature cards, avatar replacements',
    },
    rounded: {
      borderRadius: '0.5rem',  // 8px
      sizes: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      usage: 'Modern UI, cards',
    },
    square: {
      borderRadius: '0',
      sizes: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      usage: 'Minimal, technical interfaces',
    },
  },

  // Best practices
  bestPractices: {
    dos: [
      'Use consistent stroke width (2px default)',
      'Align icons to text baseline when inline',
      'Use semantic colors (success, error, etc.)',
      'Maintain consistent sizes within same context',
      'Use appropriate icon for the action/concept',
      'Ensure adequate touch targets (min 44x44px)',
    ],
    donts: [
      'Mix different icon sets',
      'Use inconsistent sizes in same section',
      'Use decorative icons without purpose',
      'Override stroke width unnecessarily',
      'Use too many colors',
      'Place icons too close to each other',
    ],
  },

  // Accessibility
  accessibility: {
    decorative: {
      ariaHidden: true,
      usage: 'Icons that are purely decorative',
    },
    interactive: {
      ariaLabel: 'required',
      usage: 'Icons that perform actions (buttons)',
      example: '<button aria-label="Close">...</button>',
    },
    informative: {
      role: 'img',
      ariaLabel: 'required',
      usage: 'Icons that convey information',
    },
  },

  // Icon categories
  categories: {
    navigation: ['Home', 'Menu', 'ChevronDown', 'ArrowLeft', 'X'],
    actions: ['Plus', 'Edit', 'Trash2', 'Save', 'Download', 'Share2'],
    status: ['CheckCircle', 'XCircle', 'AlertCircle', 'Info', 'Loader2'],
    user: ['User', 'Users', 'UserPlus', 'Mail', 'Bell'],
    file: ['File', 'FileText', 'Folder', 'Image', 'Download'],
    media: ['Eye', 'Heart', 'Star', 'ThumbsUp', 'MessageSquare'],
    commerce: ['ShoppingCart', 'CreditCard', 'DollarSign', 'Receipt'],
    date: ['Calendar', 'Clock'],
    communication: ['Phone', 'Video', 'Mic', 'Mail', 'MessageSquare'],
    
    // Travel & Location (Expanded for travel app)
    travel: {
      transportation: [
        'Plane', 'PlaneTakeoff', 'PlaneLanding',
        'Train', 'TrainFront', 'Bus', 'BusFront',
        'Car', 'CarFront', 'CarTaxiFront',
        'Bike', 'Ship', 'Sailboat', 'Rocket', 'Footprints'
      ],
      accommodation: ['Hotel', 'Building', 'Building2', 'Tent', 'Home'],
      nature: ['Mountain', 'MountainSnow', 'Palmtree', 'Trees', 'TreePine', 'Waves', 'Sunset', 'Sunrise', 'Sun', 'Moon'],
      weather: ['Cloud', 'CloudRain', 'CloudSnow', 'CloudFog', 'Cloudy'],
      items: ['Luggage', 'Backpack', 'Camera', 'Ticket'],
      places: ['Landmark', 'UtensilsCrossed', 'Coffee', 'Wine'],
      navigation: ['MapPin', 'Map', 'Navigation', 'Navigation2', 'Compass', 'Route', 'Milestone', 'Signpost'],
    },
    
    misc: ['Globe', 'Lock', 'Shield', 'Link', 'Search', 'Filter', 'Settings'],
  },
} as const;

// Responsive Design Guidelines
export const responsive = {
  // Mobile-First Approach
  approach: 'mobile-first',
  philosophy: 'Design for mobile first, then enhance for larger screens',

  // Viewport Sizes
  viewports: {
    mobile: {
      min: '320px',
      max: '767px',
      optimal: '375px',  // iPhone standard
    },
    tablet: {
      min: '768px',
      max: '1023px',
      optimal: '768px',  // iPad portrait
    },
    desktop: {
      min: '1024px',
      optimal: '1440px', // Common desktop
    },
  },

  // Layout Strategies
  layout: {
    mobile: {
      columns: 1,
      gap: '1rem',
      padding: '1rem',
      maxWidth: '100%',
    },
    tablet: {
      columns: 2,
      gap: '1.5rem',
      padding: '1.5rem',
      maxWidth: '768px',
    },
    desktop: {
      columns: 3,
      gap: '2rem',
      padding: '2rem',
      maxWidth: '1280px',
    },
  },

  // Typography Scale (Responsive)
  typographyScale: {
    mobile: {
      h1: '2rem',      // 32px
      h2: '1.5rem',    // 24px
      h3: '1.25rem',   // 20px
      body: '1rem',    // 16px
    },
    tablet: {
      h1: '2.5rem',    // 40px
      h2: '2rem',      // 32px
      h3: '1.5rem',    // 24px
      body: '1rem',    // 16px
    },
    desktop: {
      h1: '3rem',      // 48px
      h2: '2.25rem',   // 36px
      h3: '1.875rem',  // 30px
      body: '1rem',    // 16px
    },
  },

  // Interactive Element Sizes
  interactions: {
    mobile: {
      buttonHeight: '48px',      // Touch-friendly
      inputHeight: '48px',
      minTapTarget: '44px',
      iconSize: '24px',
    },
    desktop: {
      buttonHeight: '40px',
      inputHeight: '40px',
      minClickTarget: '32px',
      iconSize: '20px',
    },
  },

  // Performance Guidelines
  performance: {
    images: {
      mobile: {
        maxWidth: '768px',
        quality: 'medium',
        format: ['webp', 'jpg'],
      },
      desktop: {
        maxWidth: '1920px',
        quality: 'high',
        format: ['webp', 'jpg'],
      },
    },
    lazyLoad: true,
    prefetchCritical: true,
  },

  // Accessibility
  accessibility: {
    minFontSize: '16px',          // Prevent zoom on iOS
    minTouchTarget: '44px',       // WCAG 2.1 AAA
    maxLineLength: '75ch',        // Optimal reading
    minContrast: '4.5:1',         // WCAG AA
    focusVisible: true,
  },

  // Best Practices
  bestPractices: {
    dos: [
      'Design mobile-first, enhance progressively',
      'Use relative units (rem, em, %) over fixed pixels',
      'Test on real devices, not just browser resize',
      'Ensure touch targets are min 44x44px',
      'Use system fonts for better performance',
      'Implement proper loading states',
      'Optimize images for each breakpoint',
      'Use CSS Grid and Flexbox for layouts',
      'Test with slow 3G connection',
      'Support both portrait and landscape',
    ],
    donts: [
      'Assume desktop-first design',
      'Use fixed pixel widths for containers',
      'Ignore touch gestures on mobile',
      'Use small touch targets (< 44px)',
      'Load desktop images on mobile',
      'Forget about slow connections',
      'Use hover-only interactions',
      'Ignore landscape orientation',
      'Skip performance testing',
      'Use non-responsive components',
    ],
  },

  // Component Behavior
  components: {
    navigation: {
      mobile: 'Bottom bar or hamburger menu',
      desktop: 'Top horizontal navigation',
    },
    modal: {
      mobile: 'Full screen or bottom sheet',
      desktop: 'Centered with backdrop',
    },
    table: {
      mobile: 'Card view or horizontal scroll',
      desktop: 'Full table layout',
    },
    form: {
      mobile: 'Stacked fields, full width',
      desktop: 'Multi-column layout possible',
    },
  },
} as const;

// Form System Guidelines
export const forms = {
  // Form Components Available
  components: {
    text: ['Input', 'Textarea', 'SearchInput'],
    selection: ['Select', 'Combobox', 'MultiSelect', 'RadioGroup'],
    toggle: ['Checkbox', 'Switch'],
    numeric: ['Slider', 'RangeSlider'],
    datetime: ['DatePicker', 'DateRangePicker', 'TimePicker'],
    special: ['FileUpload', 'ImageUpload', 'PasswordInput', 'OTPInput', 'PhoneInput', 'ColorPicker'],
  },

  // Field Sizing
  fieldSizes: {
    sm: {
      height: '2rem',       // 32px
      fontSize: '0.875rem', // 14px
      padding: '0.5rem',    // 8px
    },
    md: {
      height: '2.5rem',     // 40px (default)
      fontSize: '0.875rem', // 14px
      padding: '0.75rem',   // 12px
    },
    lg: {
      height: '3rem',       // 48px
      fontSize: '1rem',     // 16px
      padding: '1rem',      // 16px
    },
  },

  // Input States
  states: {
    default: {
      border: 'border-gray-300',
      background: 'bg-white',
      text: 'text-gray-900',
    },
    hover: {
      border: 'border-gray-400',
      background: 'bg-gray-50',
    },
    focus: {
      border: 'border-blue-500',
      ring: 'ring-2 ring-blue-500',
      background: 'bg-white',
    },
    error: {
      border: 'border-red-500',
      ring: 'ring-2 ring-red-500',
      text: 'text-red-600',
    },
    disabled: {
      border: 'border-gray-200',
      background: 'bg-gray-50',
      text: 'text-gray-400',
      cursor: 'cursor-not-allowed',
    },
    success: {
      border: 'border-green-500',
      ring: 'ring-2 ring-green-500',
    },
  },

  // Validation
  validation: {
    required: {
      indicator: '*',
      color: 'text-red-500',
      position: 'after-label',
    },
    error: {
      color: 'text-red-600',
      icon: 'AlertCircle',
      position: 'below-field',
    },
    success: {
      color: 'text-green-600',
      icon: 'CheckCircle',
      position: 'below-field',
    },
    hint: {
      color: 'text-gray-500',
      fontSize: '0.75rem',
      position: 'below-field',
    },
  },

  // Label Guidelines
  labels: {
    fontSize: '0.875rem',     // 14px
    fontWeight: '500',         // medium
    color: 'text-gray-700',
    spacing: '0.5rem',         // 8px gap below label
    required: {
      indicator: '*',
      color: 'text-red-500',
    },
  },

  // Layout Patterns
  layouts: {
    vertical: {
      spacing: '0.5rem',      // 8px between label and input
      alignment: 'flex-start',
    },
    horizontal: {
      labelWidth: '33%',      // 1/3 for label
      inputWidth: '67%',      // 2/3 for input
      alignment: 'items-start',
      gap: '1rem',
    },
    inline: {
      direction: 'row',
      gap: '0.75rem',
      alignment: 'items-center',
    },
  },

  // Form Spacing
  spacing: {
    field: '1rem',            // 16px between fields
    group: '1.5rem',          // 24px between groups
    section: '2rem',          // 32px between sections
  },

  // Best Practices
  bestPractices: {
    dos: [
      'Use clear, descriptive labels',
      'Provide helpful placeholder text',
      'Show validation errors inline',
      'Use appropriate input types',
      'Enable autocomplete when appropriate',
      'Group related fields together',
      'Provide clear error messages',
      'Use required indicators (*)',
      'Support keyboard navigation',
      'Ensure min 44px touch targets on mobile',
    ],
    donts: [
      'Use placeholder as label',
      'Show all errors at once',
      'Use vague error messages',
      'Disable paste for password fields',
      'Use tiny touch targets',
      'Hide password requirements',
      'Use confusing input types',
      'Forget mobile keyboard types',
      'Skip loading states',
      'Ignore accessibility',
    ],
  },

  // Accessibility
  accessibility: {
    labels: 'Always provide labels (visible or aria-label)',
    errors: 'Use aria-invalid and aria-describedby',
    required: 'Use aria-required attribute',
    hints: 'Link with aria-describedby',
    autocomplete: 'Use appropriate autocomplete attributes',
    keyboard: 'Full keyboard navigation support',
  },
} as const;

// Toast System Guidelines
export const toasts = {
  // Toast Variants
  variants: {
    default: {
      background: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-950',
      usage: 'General notifications',
    },
    success: {
      background: 'bg-green-500',
      border: 'border-green-500',
      text: 'text-white',
      icon: 'CheckCircle',
      usage: 'Success confirmations',
      duration: 3000,
    },
    error: {
      background: 'bg-red-500',
      border: 'border-red-500',
      text: 'text-white',
      icon: 'XCircle',
      usage: 'Error messages',
      duration: 5000,
      priority: 'high',
    },
    warning: {
      background: 'bg-yellow-500',
      border: 'border-yellow-500',
      text: 'text-white',
      icon: 'AlertCircle',
      usage: 'Warnings and cautions',
      duration: 4000,
    },
    info: {
      background: 'bg-blue-500',
      border: 'border-blue-500',
      text: 'text-white',
      icon: 'Info',
      usage: 'Informational messages',
      duration: 3000,
    },
  },

  // Toast Positions
  positions: {
    'top-left': 'Top left corner',
    'top-center': 'Top center (full width mobile)',
    'top-right': 'Top right corner (default)',
    'bottom-left': 'Bottom left corner',
    'bottom-center': 'Bottom center',
    'bottom-right': 'Bottom right corner',
  },

  // Toast Sizes
  sizes: {
    sm: {
      padding: '0.75rem',   // 12px
      fontSize: '0.75rem',  // 12px
      iconSize: '1rem',     // 16px
    },
    md: {
      padding: '1rem',      // 16px (default)
      fontSize: '0.875rem', // 14px
      iconSize: '1.25rem',  // 20px
    },
    lg: {
      padding: '1.25rem',   // 20px
      fontSize: '1rem',     // 16px
      iconSize: '1.5rem',   // 24px
    },
  },

  // Durations (in milliseconds)
  durations: {
    quick: 2000,
    short: 3000,
    normal: 5000,
    long: 8000,
    infinite: 0,
  },

  // Priority System
  priority: {
    low: {
      order: 1,
      usage: 'Background updates, non-critical info',
    },
    normal: {
      order: 2,
      usage: 'Standard notifications (default)',
    },
    high: {
      order: 3,
      usage: 'Errors, critical warnings',
    },
  },

  // Features
  features: {
    pauseOnHover: {
      enabled: true,
      description: 'Pause auto-dismiss when hovering',
    },
    showProgress: {
      enabled: false,
      description: 'Show countdown progress bar',
    },
    maxToasts: {
      default: 5,
      description: 'Maximum concurrent toasts',
    },
    swipeToDismiss: {
      enabled: true,
      description: 'Swipe to dismiss on mobile',
      directions: ['right'],
    },
    stackable: {
      enabled: true,
      description: 'Stack multiple toasts',
    },
  },

  // Mobile Optimization
  mobile: {
    position: 'Top with full width',
    maxWidth: '100%',
    padding: '1rem',
    transition: 'Slide from top',
    touchDismiss: true,
  },

  // Desktop Behavior
  desktop: {
    position: 'Top-right corner',
    maxWidth: '24rem', // 384px
    padding: '0',
    transition: 'Slide from right',
  },

  // Accessibility
  accessibility: {
    role: 'alert',
    ariaLive: {
      low: 'polite',
      normal: 'polite',
      high: 'assertive',
    },
    ariaAtomic: true,
    keyboard: {
      escape: 'Close focused toast',
      tab: 'Navigate between action buttons',
    },
    screenReader: 'Announces toast content automatically',
  },

  // Best Practices
  bestPractices: {
    dos: [
      'Use appropriate variant for message type',
      'Keep messages concise and actionable',
      'Use title for summary, description for details',
      'Provide action buttons when needed',
      'Set appropriate duration based on content length',
      'Use high priority for errors',
      'Include success feedback for user actions',
      'Limit concurrent toasts (max 3-5)',
    ],
    donts: [
      'Show too many toasts at once',
      'Use for critical system errors (use modal)',
      'Auto-dismiss error messages too quickly',
      'Use vague messages',
      'Overuse toast notifications',
      'Block user interaction',
      'Use for form validation errors',
      'Show permanent toasts (use banner instead)',
    ],
  },

  // Usage Guidelines
  usage: {
    success: {
      when: 'Action completed successfully',
      examples: ['Saved', 'Deleted', 'Created', 'Updated'],
      duration: 3000,
    },
    error: {
      when: 'Action failed or error occurred',
      examples: ['Failed to save', 'Network error', 'Invalid data'],
      duration: 5000,
      allowActions: true,
    },
    warning: {
      when: 'User should be cautious',
      examples: ['Low storage', 'Unsaved changes', 'About to expire'],
      duration: 4000,
    },
    info: {
      when: 'General information',
      examples: ['New feature available', 'Tips', 'Updates'],
      duration: 3000,
    },
    loading: {
      when: 'Async operation in progress',
      examples: ['Uploading...', 'Processing...', 'Saving...'],
      duration: 0,
      dismissManually: true,
    },
  },
} as const;
