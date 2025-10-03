// User types
export interface User {
  id: string;
  googleUid: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
  birthday?: Date; // Optional birthday field
  createdAt: Date;
}

// Group types
export type GroupType = 'public' | 'close' | 'secret';

export interface Group {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  type: GroupType;
  ownerId: string;
  slug: string;
  createdAt: Date;
  memberCount?: number; // Added for display purposes
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
  leftAt?: Date;
}

// Trip types
export type Currency = 'VND' | 'USD';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  currency: Currency;
  ownerId: string;
  groupId?: string; // null for personal trips
  status: 'active' | 'closed';
  createdAt: Date;
  closedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  destination?: string;
  coverUrl?: string;
  costPerPersonPlanned?: number;
  category?: string;
  slug: string;
  paymentStatus?: Record<string, boolean>; // memberId -> isPaid mapping
  paymentStatusUpdatedAt?: Date;
  paymentStatusUpdatedBy?: string;
  memberCount?: number; // Added for display purposes
  statsCache: {
    totalAdvance: number;
    totalExpense: number;
    computedAt: Date;
  };
}

// Trip type helpers
export type TripType = 'personal' | 'group';

export const getTripType = (trip: Trip): TripType => {
  return trip.groupId ? 'group' : 'personal';
};

export const getTripTypeLabel = (trip: Trip): string => {
  return trip.groupId ? 'Chuyến đi nhóm' : 'Chuyến đi cá nhân';
};

export const getTripTypeIcon = (trip: Trip): string => {
  return trip.groupId ? '👥' : '👤';
};

export interface TripMember {
  id: string;
  tripId: string;
  userId?: string; // nếu là thành viên thật
  ghostName?: string; // nếu là thành viên ảo
  role: 'creator' | 'member';
  joinedAt: Date;
  leftAt?: Date;
  // Additional fields for UI/UX (not in spec but needed for functionality)
  name?: string; // display name (derived from userId or ghostName)
  avatar?: string; // user avatar from Google or other sources
  weight?: number; // for weighted splitting (derived from user profile)
  optionalEmail?: string; // for ghost members
  paymentStatus?: 'paid' | 'unpaid';
  paymentStatusUpdatedAt?: Date;
  paymentStatusUpdatedBy?: string;
}

// Expense types
export type SplitMethod = 'equal' | 'weight';

export interface WeightEntry {
  memberId: string;
  weight: number;
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  paidBy: string; // tripMemberId
  splitMethod: SplitMethod; // 'equal' | 'weight'
  weightMap?: WeightEntry[]; // for weighted splits
  exclusions?: string[]; // member IDs to exclude
  memberIdsAtCreation?: string[]; // tripMemberIds who were in the trip when expense was created
  category?: string;
  description?: string;
  createdAt: Date;
  createdBy: string; // userId
}

// Advance types
export interface Advance {
  id: string;
  tripId: string;
  amount: number;
  description?: string;
  paidBy: string; // tripMemberId who paid the advance
  paidTo: string; // tripMemberId who received the advance
  createdAt: Date;
  createdBy: string; // userId
  isRefund?: boolean; // true if this is a refund
}

// Settlement types
export interface SettlementTransaction {
  id: string;
  tripId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  computedAt: Date;
  rounded: boolean;
}

export interface SettlementSummary {
  id: string;
  tripId: string;
  computedAt: Date;
  computedBy: string;
  totalExpense: number;
  totalAdvance: number;
  netBalance: number;
  memberBalances: { [memberId: string]: number };
  transactions: Array<{
    from: string;
    to: string;
    amount: number;
    fromName: string;
    toName: string;
  }>;
}

// Join Request types
export interface JoinRequest {
  id: string;
  groupId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  message?: string;
}


// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'group_request' | 'trip_invite' | 'expense_added' | 'trip_closed' | 'group_joined' | 'group_left' | 'trip_created' | 'trip_updated' | 'expense_updated' | 'expense_deleted' | 'member_added' | 'member_removed' | 'group_updated' | 'trip_deleted' | 'settlement_ready' | 'admin_broadcast';
  title: string;
  message: string;
  data: {
    groupId?: string;
    tripId?: string;
    inviteId?: string;
    requestId?: string;
    isBroadcast?: boolean;
    sentBy?: string;
    [key: string]: string | number | boolean | undefined;
  };
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Group Post types
export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likesCount: number;
  commentsCount: number;
  // UI fields (not stored in DB)
  authorName?: string;
  authorAvatar?: string;
  isLiked?: boolean;
}

export interface GroupComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  // UI fields (not stored in DB)
  authorName?: string;
  authorAvatar?: string;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

// Group Activity types (non-post events shown in feed)
export type GroupActivityType =
  | 'trip_created'
  | 'member_joined'
  | 'member_left'
  | 'expense_added'
  | 'expense_updated'
  | 'advance_added'
  | 'settlement_ready';

export interface GroupActivity {
  id: string;
  groupId: string;
  type: GroupActivityType;
  createdAt: Date;
  actorId?: string;
  // Optional rich data for rendering
  payload?: {
    tripId?: string;
    tripName?: string;
    amount?: number;
    currency?: Currency;
    memberName?: string;
    expenseDescription?: string;
  };
  // UI fields
  actorName?: string;
  actorAvatar?: string;
}

// Audit Log types
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  at: Date;
}