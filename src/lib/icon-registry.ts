/**
 * Icon Registry - Standardized icon usage across the app
 * 
 * Based on design-system.ts icons guidelines:
 * - Library: Lucide React
 * - Sizes: xs (12px), sm (16px), md (20px), lg (24px), xl (32px)
 * - Stroke width: default = 2
 * - Colors: semantic (primary, success, warning, error)
 */

import {
  // Navigation
  Home,
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  X,
  
  // Actions
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,
  MoreVertical,
  MoreHorizontal,
  
  // Status
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  Check,
  
  // User
  User,
  Users,
  UserPlus,
  Mail,
  Bell,
  BellOff,
  
  // File
  File,
  FileText,
  Folder,
  Image,
  
  // Media
  Eye,
  EyeOff,
  Heart,
  Star,
  ThumbsUp,
  MessageSquare,
  
  // Commerce
  ShoppingCart,
  CreditCard,
  DollarSign,
  Receipt,
  
  // Date & Time
  Calendar,
  Clock,
  
  // Travel & Location
  MapPin,
  Map,
  Navigation,
  Compass,
  Globe,
  Plane,
  Train,
  Car,
  Ship,
  Hotel,
  Mountain,
  Palmtree,
  Luggage,
  Camera,
  Sunset,
  Sunrise,
  
  // Settings
  Settings,
  Lock,
  Unlock,
  Shield,
  Search,
  Filter,
  
  // UI
  Sun,
  Moon,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// Icon sizes from design system
export const iconSizes = {
  xs: 'w-3 h-3',      // 12px
  sm: 'w-4 h-4',      // 16px
  md: 'w-5 h-5',      // 20px (default)
  lg: 'w-6 h-6',      // 24px
  xl: 'w-8 h-8',      // 32px
  '2xl': 'w-10 h-10', // 40px
} as const;

// Icon colors from design system
export const iconColors = {
  default: 'text-gray-700',
  primary: 'text-primary-600',
  secondary: 'text-gray-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
  error: 'text-error-600',
  muted: 'text-gray-400',
  white: 'text-white',
} as const;

// Organized icon groups
export const icons = {
  // Navigation
  navigation: {
    Home,
    Menu,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    X,
  },
  
  // Actions
  actions: {
    Plus,
    Edit,
    Trash: Trash2,
    Save,
    Download,
    Upload,
    Share: Share2,
    Copy,
    ExternalLink,
    MoreVertical,
    MoreHorizontal,
  },
  
  // Status
  status: {
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Loader: Loader2,
    Check,
  },
  
  // User
  user: {
    User,
    Users,
    UserPlus,
    Mail,
    Bell,
    BellOff,
  },
  
  // File
  file: {
    File,
    FileText,
    Folder,
    Image,
  },
  
  // Media
  media: {
    Eye,
    EyeOff,
    Heart,
    Star,
    ThumbsUp,
    MessageSquare,
  },
  
  // Commerce
  commerce: {
    ShoppingCart,
    CreditCard,
    DollarSign,
    Receipt,
  },
  
  // Date & Time
  datetime: {
    Calendar,
    Clock,
  },
  
  // Travel & Location
  travel: {
    MapPin,
    Map,
    Navigation,
    Compass,
    Globe,
    Plane,
    Train,
    Car,
    Ship,
    Hotel,
    Mountain,
    Palmtree,
    Luggage,
    Camera,
    Sunset,
    Sunrise,
  },
  
  // Settings
  settings: {
    Settings,
    Lock,
    Unlock,
    Shield,
    Search,
    Filter,
  },
  
  // UI
  ui: {
    Sun,
    Moon,
    Maximize: Maximize2,
    Minimize: Minimize2,
  },
} as const;

// Helper function to get icon class names
export function getIconClassName(
  size: keyof typeof iconSizes = 'md',
  color: keyof typeof iconColors = 'default'
): string {
  return `${iconSizes[size]} ${iconColors[color]}`;
}

// Export individual icons for convenience
export {
  // Most commonly used
  Home,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2 as Trash,
  Settings,
  User,
  Bell,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  Loader2 as Loader,
};

