'use server';

import { adminDb } from '../firebase-admin-new';
import { CreateTripSchema, AddTripMemberSchema, AddExpenseSchema, AddAdvanceSchema, CloseTripSchema } from '../schemas';
import { Trip, TripMember, Expense, Advance } from '../types';
import { prepareFirestoreData } from '../utils/firestore';
import { toDate, safeToDate } from '../utils/date';
import { isGroupMember } from './groups';



// Get Group Members
export async function getGroupMembers(groupId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    // Get group members
    const groupMembersQuery = adminDb.collection('groupMembers')
      .where('groupId', '==', groupId);
    
    const groupMembersSnapshot = await groupMembersQuery.get();
    
    // Filter out members who have left (leftAt is not null/undefined/empty)
    const activeMembers = groupMembersSnapshot.docs.filter(doc => {
      const data = doc.data();
      const leftAt = data.leftAt;
      // Consider null, undefined, or empty object as "not left"
      return leftAt === null || leftAt === undefined || (typeof leftAt === 'object' && Object.keys(leftAt).length === 0);
    });
    
    if (activeMembers.length === 0) {
      return [];
    }

    const userIds = activeMembers.map(doc => doc.data().userId);
    
    // Get user details
    const usersQuery = adminDb.collection('users')
      .where('__name__', 'in', userIds);
    
    const usersSnapshot = await usersQuery.get();
    
    const members = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        avatar: userData.avatar
      };
    });

    return members;
  } catch (error) {
    console.error('Error getting group members:', error);
    throw new Error('Có lỗi xảy ra khi lấy danh sách thành viên nhóm');
  }
}

// Search Users
export async function searchUsers(query: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!query?.trim()) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();
    
    // Get all users and filter client-side for better fuzzy search
    const usersQuery = adminDb.collection('users').limit(100);
    const usersSnapshot = await usersQuery.get();
    
    const allUsers = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id,
        name: userData.name || '',
        email: userData.email || '',
        username: userData.username || '',
        avatar: userData.avatar
      };
    });

    // Filter users based on search term (fuzzy search)
    const filteredUsers = allUsers.filter(user => {
      const name = user.name.toLowerCase();
      const email = user.email.toLowerCase();
      const username = user.username.toLowerCase();
      
      // Check if search term appears anywhere in name, email, or username
      return name.includes(searchTerm) || 
             email.includes(searchTerm) || 
             username.includes(searchTerm);
    });

    // Sort by relevance (exact matches first, then prefix matches, then contains)
    const sortedUsers = filteredUsers.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const aEmail = a.email.toLowerCase();
      const aUsername = a.username.toLowerCase();
      const bName = b.name.toLowerCase();
      const bEmail = b.email.toLowerCase();
      const bUsername = b.username.toLowerCase();
      
      // Exact matches get highest priority
      const aExact = aName === searchTerm || aEmail === searchTerm || aUsername === searchTerm;
      const bExact = bName === searchTerm || bEmail === searchTerm || bUsername === searchTerm;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Prefix matches get second priority
      const aPrefix = aName.startsWith(searchTerm) || aEmail.startsWith(searchTerm) || aUsername.startsWith(searchTerm);
      const bPrefix = bName.startsWith(searchTerm) || bEmail.startsWith(searchTerm) || bUsername.startsWith(searchTerm);
      
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;
      
      // Then sort by name alphabetically
      return aName.localeCompare(bName);
    });

    return sortedUsers.slice(0, 10);
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Có lỗi xảy ra khi tìm kiếm users');
  }
}

// Create Trip
export async function createTrip(formDataOrObj: FormData | Record<string, unknown>) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const isFD = typeof (formDataOrObj as any)?.get === 'function';
    const fd = formDataOrObj as FormData;
    const obj = formDataOrObj as Record<string, unknown>;

    const userId = isFD ? (fd.get('userId') as string) : ((obj.userId as string) || (obj.ownerId as string));
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    const groupId = isFD ? ((fd.get('groupId') as string) || undefined) : ((obj.groupId as string) || undefined);
    
    // If creating trip in a group, validate group membership
    if (groupId) {
      const isMember = await isGroupMember(groupId, userId);
      if (!isMember) {
        throw new Error('Bạn không phải là thành viên của nhóm này');
      }
    }

    // Generate slug from trip name
    const tripName = isFD ? (fd.get('name') as string) : ((obj.name as string) || '');
    if (!tripName) {
      throw new Error('Tên chuyến đi không được để trống');
    }

    // Generate base slug from trip name
    let baseSlug = tripName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = 'trip-' + Date.now();
    }

    // Truncate to fit TripSlug max length (100 chars)
    if (baseSlug.length > 100) {
      baseSlug = baseSlug.substring(0, 100);
      // Remove trailing hyphen if it exists after truncation
      if (baseSlug.endsWith('-')) {
        baseSlug = baseSlug.slice(0, -1);
      }
    }

    // Check if slug is unique and generate unique version if needed
    let finalSlug = baseSlug;
    let counter = 1;
    while (await checkTripSlugExists(finalSlug, groupId)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate trip ID
    const tripId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const normalizeDateInput = (val: unknown): string | undefined => {
      if (!val) return undefined;
      if (val instanceof Date) return val.toISOString();
      if (typeof val === 'string') return val;
      return undefined;
    };

    const data = {
      name: tripName,
      description: isFD ? ((fd.get('description') as string) || undefined) : ((obj.description as string) || undefined),
      currency: (isFD ? (fd.get('currency') as string) : (obj.currency as string)) as 'VND' | 'USD' | 'EUR' | undefined,
      groupId: groupId,
      startDate: isFD ? ((fd.get('startDate') as string) || undefined) : normalizeDateInput(obj.startDate),
      endDate: isFD ? ((fd.get('endDate') as string) || undefined) : normalizeDateInput(obj.endDate),
      destination: isFD ? ((fd.get('destination') as string) || undefined) : ((obj.destination as string) || undefined),
      coverUrl: isFD ? ((fd.get('coverUrl') as string) || undefined) : ((obj.coverUrl as string) || undefined),
      costPerPersonPlanned: ((): number | undefined => {
        const raw = isFD ? (fd.get('costPerPersonPlanned') as string) : (obj.costPerPersonPlanned as any);
        if (raw === undefined || raw === null || raw === '') return undefined;
        const num = typeof raw === 'number' ? raw : parseFloat(String(raw));
        return Number.isFinite(num) ? num : undefined;
      })(),
      category: isFD ? ((fd.get('category') as string) || undefined) : ((obj.category as string) || undefined),
      slug: finalSlug,
    } as any;

    if (!data.currency) {
      data.currency = 'VND';
    }

    // Validate input
    const validatedData = CreateTripSchema.parse(data);

    // Create trip
    const tripData: Omit<Trip, 'id'> = {
      name: validatedData.name,
      description: validatedData.description,
      currency: validatedData.currency,
      ownerId: userId,
      groupId: validatedData.groupId,
      status: 'active',
      createdAt: new Date(),
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      destination: validatedData.destination,
      coverUrl: validatedData.coverUrl,
      costPerPersonPlanned: validatedData.costPerPersonPlanned,
      category: validatedData.category,
      slug: validatedData.slug,
      paymentStatus: 'unpaid',
      statsCache: {
        totalAdvance: 0,
        totalExpense: 0,
        computedAt: new Date(),
      },
    };

    // Clean data before saving to Firestore
    const cleanedTripData = prepareFirestoreData(tripData);
    await adminDb.collection('trips').doc(tripId).set(cleanedTripData);

    // Add owner as trip member
    const memberId = `${tripId}_${userId}`;
    const memberData: Omit<TripMember, 'id'> = {
      tripId,
      userId: userId,
      name: 'Bạn', // Will be replaced with actual user name
      weight: 1,
      role: 'creator',
      joinedAt: new Date(),
      leftAt: undefined, // Explicitly set to undefined for active members
    };

    const cleanedMemberData = prepareFirestoreData(memberData);
    await adminDb.collection('tripMembers').doc(memberId).set(cleanedMemberData);

    // Get group slug if groupId exists
    let groupSlug = undefined;
    if (validatedData.groupId) {
      try {
        const groupDoc = await adminDb.collection('groups').doc(validatedData.groupId).get();
        if (groupDoc.exists) {
          groupSlug = groupDoc.data()?.slug;
        }
      } catch (error) {
        console.error('Error getting group slug:', error);
      }
    }

    return { success: true, tripId, slug: validatedData.slug, groupId: validatedData.groupId, groupSlug };
  } catch (error) {
    console.error('Error creating trip:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi tạo chuyến đi');
  }
}

// Check if trip slug exists (within group scope or global for personal trips)
export async function checkTripSlugExists(slug: string, groupId?: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      return false;
    }

    // For personal trips, check global uniqueness
    if (!groupId) {
      const tripQuery = adminDb.collection('trips')
        .where('slug', '==', slug)
        .where('groupId', '==', null);
      const tripSnapshot = await tripQuery.get();
      return tripSnapshot.docs.length > 0;
    }

    // For group trips, check uniqueness within the group
    const tripQuery = adminDb.collection('trips')
      .where('slug', '==', slug)
      .where('groupId', '==', groupId);
    const tripSnapshot = await tripQuery.get();
    return tripSnapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking trip slug:', error);
    return false;
  }
}

// Get Trip by Slug
export async function getTripBySlug(slug: string, groupId?: string, userId?: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    let tripQuery;
    if (groupId) {
      // For group trips, search within the group
      tripQuery = adminDb.collection('trips')
        .where('slug', '==', slug)
        .where('groupId', '==', groupId);
    } else {
      // For personal trips, search for trips without groupId (both null and undefined)
      // We need to query all trips with the slug and filter in code
      tripQuery = adminDb.collection('trips')
        .where('slug', '==', slug);
    }

    const tripSnapshot = await tripQuery.get();
    
    // Filter results for personal trips
    let filteredDocs = tripSnapshot.docs;
    if (!groupId) {
      // For personal trips, filter out group trips
      filteredDocs = tripSnapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.groupId; // groupId is null, undefined, or falsy
      });
    }
    
    if (filteredDocs.length === 0) {
      return null;
    }

    const doc = filteredDocs[0];
    const tripData = doc.data();
    
    // Access control: If userId is provided, check if user has access
    if (userId) {
      // Always allow trip owner/creator to access
      if (tripData.ownerId === userId) {
        // Owner has access, continue
      } else {
        // For personal trips, only owner can access
        if (!tripData.groupId) {
          throw new Error('Bạn không có quyền truy cập chuyến đi này');
        }
        
        // For group trips, check if user is a trip member
        const member = await isTripMember(doc.id, userId);
        if (!member) {
          throw new Error('Bạn không có quyền truy cập chuyến đi này');
        }
      }
    }
    
    // Convert Firestore Timestamps to Date if needed
    const processedTripData = {
      ...tripData,
      id: doc.id,
      createdAt: tripData.createdAt?.toDate ? tripData.createdAt.toDate() : tripData.createdAt,
      closedAt: tripData.closedAt?.toDate ? tripData.closedAt.toDate() : tripData.closedAt,
      startDate: tripData.startDate?.toDate ? tripData.startDate.toDate() : tripData.startDate,
      endDate: tripData.endDate?.toDate ? tripData.endDate.toDate() : tripData.endDate,
      statsCache: {
        ...tripData.statsCache,
        computedAt: tripData.statsCache?.computedAt?.toDate ? tripData.statsCache.computedAt.toDate() : tripData.statsCache?.computedAt
      }
    };
    
    return processedTripData as Trip;
  } catch (error) {
    console.error('Error getting trip by slug:', error);
    if (error instanceof Error && error.message.includes('quyền truy cập')) {
      throw error; // Re-throw access control errors
    }
    throw new Error('Có lỗi xảy ra khi lấy thông tin chuyến đi');
  }
}

// Close Trip (lock writes)
export async function closeTrip(tripId: string, userId: string, rounding: boolean = false) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data() as Trip;
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể lưu trữ chuyến đi');
    }

    await tripRef.set({ 
      closedAt: new Date(),
      status: 'closed'
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error closing trip:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi lưu trữ chuyến đi');
  }
}

// Get Trip by ID
export async function getTripById(tripId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      return null;
    }

    const tripData = tripSnap.data();
    
    if (!tripData) {
      throw new Error('Trip data not found');
    }
    
    // Convert Firestore Timestamps to Date if needed
    const processedTripData = {
      ...tripData,
      createdAt: tripData.createdAt?.toDate ? tripData.createdAt.toDate() : tripData.createdAt,
      closedAt: tripData.closedAt?.toDate ? tripData.closedAt.toDate() : tripData.closedAt,
      startDate: tripData.startDate?.toDate ? tripData.startDate.toDate() : tripData.startDate,
      endDate: tripData.endDate?.toDate ? tripData.endDate.toDate() : tripData.endDate,
      statsCache: {
        ...tripData.statsCache,
        computedAt: tripData.statsCache?.computedAt?.toDate ? tripData.statsCache.computedAt.toDate() : tripData.statsCache?.computedAt
      }
    };
    
    return { id: tripSnap.id, ...processedTripData } as Trip;
  } catch (error) {
    console.error('Error getting trip:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin chuyến đi');
  }
}

// Get Group Trips
export async function getGroupTrips(groupId: string) {
  try {
    console.log('=== getGroupTrips START ===');
    console.log('Group ID:', groupId);
    console.log('Admin DB available:', !!adminDb);
    
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    console.log('Getting trips for group:', groupId);
    
    // Get trips where groupId matches
    const tripsQuery = adminDb.collection('trips')
      .where('groupId', '==', groupId);
    
    const tripsSnapshot = await tripsQuery.get();
    console.log('Found group trips:', tripsSnapshot.docs.length);
    
    const trips: Trip[] = [];
    
    // Process each trip
    for (const doc of tripsSnapshot.docs) {
      try {
        console.log('Processing trip:', doc.id);
        const tripData = doc.data();
        
        // Get member count for this trip
        const memberCountQuery = adminDb.collection('tripMembers')
          .where('tripId', '==', doc.id)
          .where('leftAt', '==', null);
        const memberCountSnapshot = await memberCountQuery.get();
        const memberCount = memberCountSnapshot.docs.length;
        
        // Get total expense for this trip
        const expensesQuery = adminDb.collection('expenses')
          .where('tripId', '==', doc.id);
        const expensesSnapshot = await expensesQuery.get();
        const totalExpense = expensesSnapshot.docs.reduce((sum, expenseDoc) => {
          return sum + (expenseDoc.data().amount || 0);
        }, 0);
        
        // Determine trip status
        let status: 'active' | 'completed' | 'upcoming' = 'active';
        const now = new Date();
        if (tripData.closedAt) {
          status = 'completed';
        } else if (tripData.startDate) {
          const startDate = tripData.startDate?.toDate ? tripData.startDate.toDate() : new Date(tripData.startDate);
          if (startDate > now) {
            status = 'upcoming';
          }
        }
        
        // Convert Firestore Timestamps to Date if needed
        const processedTripData = {
          ...tripData,
          createdAt: toDate(tripData.createdAt),
          closedAt: toDate(tripData.closedAt),
          startDate: toDate(tripData.startDate),
          endDate: toDate(tripData.endDate),
          memberCount: memberCount,
          totalExpense: totalExpense,
          status: status,
          statsCache: {
            ...tripData.statsCache,
            computedAt: toDate(tripData.statsCache?.computedAt)
          }
        };
        
        trips.push({ id: doc.id, ...processedTripData } as any);
      } catch (error) {
        console.error(`Error processing trip ${doc.id}:`, error);
      }
    }
    
    // Sort by creation date (newest first)
    trips.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
    
    console.log('=== getGroupTrips SUCCESS ===');
    console.log('Returning trips:', trips.length);
    return trips;
  } catch (error) {
    console.error('=== getGroupTrips ERROR ===');
    console.error('Error getting group trips:', error);
    throw new Error('Có lỗi xảy ra khi lấy danh sách chuyến đi của nhóm');
  }
}

// Get User Trips
export async function getUserTrips(userId: string) {
  try {
    console.log('=== getUserTrips START ===');
    console.log('User ID:', userId);
    console.log('Admin DB available:', !!adminDb);
    
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    console.log('Getting trips for user:', userId);
    
    // Get trips where user is owner
    console.log('Querying owner trips...');
    const ownerTripsQuery = adminDb.collection('trips')
      .where('ownerId', '==', userId);
    
    const ownerTripsSnapshot = await ownerTripsQuery.get();
    console.log('Found owner trips:', ownerTripsSnapshot.docs.length);
    
    // Get trips where user is member
    console.log('Querying member trips...');
    const memberTripsQuery = adminDb.collection('tripMembers')
      .where('userId', '==', userId)
      .where('leftAt', '==', null);
    
    const memberTripsSnapshot = await memberTripsQuery.get();
    console.log('Found active member trips:', memberTripsSnapshot.docs.length);
    
    // Get trip IDs from memberships
    const memberTripIds = memberTripsSnapshot.docs.map(doc => doc.data().tripId);
    console.log('Member trip IDs:', memberTripIds);
    
    // Get all trips
    const allTrips: Trip[] = [];
    
    // Add owner trips
    console.log('Processing owner trips...');
    for (const doc of ownerTripsSnapshot.docs) {
      try {
        const tripData = doc.data();
        console.log('Processing owner trip:', doc.id);
        
        // Get member count for this trip
        const memberCountQuery = adminDb.collection('tripMembers')
          .where('tripId', '==', doc.id)
          .where('leftAt', '==', null);
        const memberCountSnapshot = await memberCountQuery.get();
        const memberCount = memberCountSnapshot.docs.length;
        
        // Convert Firestore Timestamps to Date if needed
        const processedTripData = {
          ...tripData,
          createdAt: safeToDate(tripData.createdAt) || new Date(),
          closedAt: safeToDate(tripData.closedAt),
          startDate: safeToDate(tripData.startDate),
          endDate: safeToDate(tripData.endDate),
          memberCount: memberCount,
          statsCache: tripData.statsCache ? {
            ...tripData.statsCache,
            computedAt: safeToDate(tripData.statsCache.computedAt)
          } : null
        };
        
        allTrips.push({ id: doc.id, ...processedTripData } as Trip);
      } catch (error) {
        console.error(`Error processing owner trip ${doc.id}:`, error);
      }
    }
    
    // Add member trips (avoid duplicates)
    console.log('Processing member trips...');
    for (const tripId of memberTripIds) {
      if (!allTrips.find(trip => trip.id === tripId)) {
        try {
          console.log('Processing member trip:', tripId);
          const tripRef = adminDb.collection('trips').doc(tripId);
          const tripSnap = await tripRef.get();
          
          if (tripSnap.exists) {
            const tripData = tripSnap.data();
            
            // Get member count for this trip
            const memberCountQuery = adminDb.collection('tripMembers')
              .where('tripId', '==', tripId)
              .where('leftAt', '==', null);
            const memberCountSnapshot = await memberCountQuery.get();
            const memberCount = memberCountSnapshot.docs.length;
            
            if (!tripData) {
              console.error(`Trip data is null for trip ${tripSnap.id}`);
              continue;
            }
            
            // Convert Firestore Timestamps to Date if needed
            const processedTripData = {
              ...tripData,
              createdAt: safeToDate(tripData.createdAt) || new Date(),
              closedAt: safeToDate(tripData.closedAt),
              startDate: safeToDate(tripData.startDate),
              endDate: safeToDate(tripData.endDate),
              memberCount: memberCount,
              statsCache: tripData.statsCache ? {
                ...tripData.statsCache,
                computedAt: safeToDate(tripData.statsCache.computedAt)
              } : null
            };
            
            allTrips.push({ id: tripSnap.id, ...processedTripData } as Trip);
          }
        } catch (error) {
          console.error(`Error getting trip ${tripId}:`, error);
        }
      }
    }
    
    // Sort by creation date
    console.log('Sorting trips...');
    allTrips.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
    
    console.log('=== getUserTrips SUCCESS ===');
    console.log('Returning trips:', allTrips.length);
    return allTrips;
  } catch (error) {
    console.error('=== getUserTrips ERROR ===');
    console.error('Error getting user trips:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      adminDbAvailable: !!adminDb
    });
    throw new Error('Có lỗi xảy ra khi lấy danh sách chuyến đi');
  }
}

// Get Trip Members
export async function getTripMembers(tripId: string) {
  try {
    console.log('=== getTripMembers START ===');
    console.log('Trip ID:', tripId);
    console.log('Admin DB available:', !!adminDb);
    
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }
    
    console.log('Creating query for tripMembers collection...');
    const membersQuery = adminDb.collection('tripMembers')
      .where('tripId', '==', tripId);
    
    console.log('Executing query...');
    const membersSnapshot = await membersQuery.get();
    console.log('Query executed successfully. Found members:', membersSnapshot.docs.length);
    
    // Filter out members who have left the trip
    const activeMembers = membersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.leftAt; // leftAt is undefined or null for active members
    });
    
    console.log('Active members:', activeMembers.length);
    
    // Get all user IDs that need to be fetched
    const userIds = activeMembers
      .map(doc => doc.data().userId)
      .filter(userId => userId); // Only real users, not ghost members

    // Fetch user data in batch
    const userDataMap = new Map();
    if (userIds.length > 0) {
      try {
        const usersQuery = adminDb.collection('users').where('__name__', 'in', userIds);
        const usersSnapshot = await usersQuery.get();
        
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          userDataMap.set(doc.id, {
            name: userData.name,
            email: userData.email,
            username: userData.username,
            phone: userData.phone || ''
          });
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Continue without user data
      }
    }

    const result = activeMembers.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to Date if needed
      const processedData = {
        ...data,
        joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : data.joinedAt,
        leftAt: data.leftAt?.toDate ? data.leftAt.toDate() : data.leftAt,
        paymentStatusUpdatedAt: data.paymentStatusUpdatedAt?.toDate ? data.paymentStatusUpdatedAt.toDate() : data.paymentStatusUpdatedAt,
        weightUpdatedAt: data.weightUpdatedAt?.toDate ? data.weightUpdatedAt.toDate() : data.weightUpdatedAt
      } as any;
      
      // Derive name and contact info from user or ghost
      let displayName = processedData.name;
      let emailForDisplay = processedData.optionalEmail;
      let phoneForDisplay = (processedData as any).optionalPhone;
      if (!displayName) {
        if (processedData.userId) {
          // For user members, get name from fetched user data
          const userData = userDataMap.get(processedData.userId);
          displayName = userData?.name || 'Unknown User';
          // Backfill email/phone for user members if missing
          if (!emailForDisplay) emailForDisplay = userData?.email;
          if (!phoneForDisplay) phoneForDisplay = userData?.phone;
        } else if (processedData.ghostName) {
          displayName = processedData.ghostName;
        }
      }
      
      return {
        id: doc.id,
        ...processedData,
        name: displayName,
        optionalEmail: emailForDisplay,
        optionalPhone: phoneForDisplay
      };
    }) as TripMember[];
    
    // Sort by joinedAt in code
    result.sort((a, b) => {
      const aTime = a.joinedAt instanceof Date ? a.joinedAt.getTime() : new Date(a.joinedAt).getTime();
      const bTime = b.joinedAt instanceof Date ? b.joinedAt.getTime() : new Date(b.joinedAt).getTime();
      return aTime - bTime; // ascending order
    });
    
    console.log('=== getTripMembers SUCCESS ===');
    return result;
  } catch (error) {
    console.error('=== getTripMembers ERROR ===');
    console.error('Error getting trip members:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      tripId,
      adminDbAvailable: !!adminDb
    });
    throw new Error('Có lỗi xảy ra khi lấy danh sách thành viên');
  }
}

// Add Trip Member
export async function addTripMember(formData: FormData, userId?: string) {
  try {
    console.log('=== addTripMember START ===');
    console.log('FormData entries:', Array.from(formData.entries()));
    console.log('UserId from parameter:', userId);
    
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    const tripId = formData.get('tripId') as string;
    const method = formData.get('method') as 'search' | 'group' | 'ghost';
    
    console.log('Trip ID:', tripId);
    console.log('Method:', method);

    // Check if trip exists
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    let memberData: Omit<TripMember, 'id'>;
    let memberId: string;
    let checkExistingMember = false;
    let existingMemberQuery: any = null;

    if (method === 'ghost') {
      // Ghost member - ghostName with optional contact info
      const ghostName = formData.get('ghostName') as string;
      const ghostEmail = (formData.get('email') as string) || undefined;
      const ghostPhone = (formData.get('phone') as string) || undefined;
      if (!ghostName?.trim()) {
        throw new Error('Tên thành viên ảo không được để trống');
      }
      
      // Check if ghost member with same name already exists
      const existingGhostQuery = adminDb.collection('tripMembers')
        .where('tripId', '==', tripId)
        .where('ghostName', '==', ghostName.trim())
        .where('leftAt', '==', null);
      
      const existingGhostSnapshot = await existingGhostQuery.get();
      if (!existingGhostSnapshot.empty) {
        throw new Error(`Thành viên ảo "${ghostName.trim()}" đã có trong chuyến đi`);
      }
      
      memberId = `${tripId}_ghost_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      memberData = {
        tripId,
        ghostName: ghostName.trim(),
        role: 'member',
        joinedAt: new Date(),
        // Additional fields for UI
        name: ghostName.trim(),
        weight: 1,
        optionalEmail: ghostEmail,
      };
      
    } else if (method === 'search') {
      // Search user - need to find user by search query
      const searchQuery = formData.get('searchQuery') as string;
      const selectedUserId = formData.get('selectedUserId') as string;
      
      if (!searchQuery?.trim() && !selectedUserId) {
        throw new Error('Vui lòng nhập từ khóa tìm kiếm hoặc chọn user');
      }
      
      if (!selectedUserId) {
        throw new Error('Vui lòng chọn user từ kết quả tìm kiếm');
      }
      
      // Check if user is already a member
      const existingUserQuery = adminDb.collection('tripMembers')
        .where('tripId', '==', tripId)
        .where('userId', '==', selectedUserId)
        .where('leftAt', '==', null);
      
      const existingUserSnapshot = await existingUserQuery.get();
      if (!existingUserSnapshot.empty) {
        throw new Error('Người dùng này đã có trong chuyến đi');
      }
      
      // Get user details
      const userRef = adminDb.collection('users').doc(selectedUserId);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) {
        throw new Error('Người dùng không tồn tại');
      }
      
      const userData = userSnap.data();
      memberId = `${tripId}_${selectedUserId}`;
      memberData = {
        tripId,
        userId: selectedUserId,
        role: 'member',
        joinedAt: new Date(),
        // Additional fields for UI
        name: userData?.name || 'Unknown',
        weight: 1,
        optionalEmail: userData?.email || '',
      };
      
    } else if (method === 'group') {
      // Group member - need to get group members
      const groupId = formData.get('groupId') as string;
      const selectedMembers = formData.getAll('selectedMembers') as string[];
      
      if (!groupId) {
        throw new Error('Vui lòng chọn nhóm');
      }
      
      if (selectedMembers.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một thành viên từ nhóm');
      }
      
      // Get group details
      const groupRef = adminDb.collection('groups').doc(groupId);
      const groupSnap = await groupRef.get();
      
      if (!groupSnap.exists) {
        throw new Error('Nhóm không tồn tại');
      }
      
      // Check which members are already in the trip
      const existingMembersQuery = adminDb.collection('tripMembers')
        .where('tripId', '==', tripId)
        .where('userId', 'in', selectedMembers)
        .where('leftAt', '==', null);
      
      const existingMembersSnapshot = await existingMembersQuery.get();
      const existingUserIds = existingMembersSnapshot.docs.map(doc => doc.data().userId);
      
      // Filter out existing members
      const newMembers = selectedMembers.filter(memberId => 
        !existingUserIds.includes(memberId)
      );

      if (newMembers.length === 0) {
        // Nothing to add; return a friendly message instead of throwing
        console.log('No new members to add. All selected users are already in the trip.');
        return { success: true, memberIds: [], message: 'Không có thành viên mới để thêm' };
      }

      if (newMembers.length < selectedMembers.length) {
        const existingCount = selectedMembers.length - newMembers.length;
        console.log(`${existingCount} thành viên đã có trong chuyến đi, chỉ thêm ${newMembers.length} thành viên mới`);
      }

      // Add each new group member as trip member
      const results = [];
      for (const memberId of newMembers) {
        // Get user details
        const userRef = adminDb.collection('users').doc(memberId);
        const userSnap = await userRef.get();
        
        if (userSnap.exists) {
          const userData = userSnap.data();
          const tripMemberId = `${tripId}_${memberId}`;
          
          const tripMemberData: Omit<TripMember, 'id'> = {
            tripId,
            userId: memberId,
            role: 'member',
            joinedAt: new Date(),
            // Additional fields for UI
            name: userData?.name || 'Unknown',
            weight: 1,
            optionalEmail: userData?.email || '',
          };
          
          const cleanedMemberData = prepareFirestoreData(tripMemberData);
          await adminDb.collection('tripMembers').doc(tripMemberId).set(cleanedMemberData);
          
          results.push(tripMemberId);
        }
      }
      
      console.log('=== addTripMember SUCCESS (group) ===');
      return { success: true, memberIds: results };
    } else {
      throw new Error('Phương thức thêm thành viên không hợp lệ');
    }

    // Clean data before saving to Firestore
    const cleanedMemberData = prepareFirestoreData(memberData);
    await adminDb.collection('tripMembers').doc(memberId).set(cleanedMemberData);

    console.log('=== addTripMember SUCCESS ===');
    return { success: true, memberId };
  } catch (error) {
    console.error('=== addTripMember ERROR ===');
    console.error('Error adding trip member:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi thêm thành viên');
  }
}

// Remove Trip Member
export async function removeTripMember(tripId: string, memberId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    // Check if trip exists
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    // Mark member as left
    const memberRef = adminDb.collection('tripMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      throw new Error('Thành viên không tồn tại');
    }

    const memberData = memberSnap.data() as TripMember;
    
    // Owner cannot be removed
    if (memberData.role === 'creator') {
      throw new Error('Không thể xóa chủ chuyến đi');
    }

    // Mark as left instead of deleting
    const updateData = {
      ...memberData,
      leftAt: new Date(),
    };
    
    const cleanedUpdateData = prepareFirestoreData(updateData);
    await memberRef.set(cleanedUpdateData, { merge: true });

    return { success: true, message: 'Xóa thành viên thành công!' };
  } catch (error) {
    console.error('Error removing trip member:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa thành viên');
  }
}

// Check if user is trip member
export async function isTripMember(tripId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      return false;
    }

    // Query for active members (leftAt is null)
    const memberQuery = adminDb.collection('tripMembers')
      .where('tripId', '==', tripId)
      .where('userId', '==', userId)
      .where('leftAt', '==', null);
    
    const memberSnapshot = await memberQuery.get();
    const isMember = memberSnapshot.docs.length > 0;
    
    // If not a member but might be the trip owner, check and add them if needed
    if (!isMember) {
      const tripRef = adminDb.collection('trips').doc(tripId);
      const tripSnap = await tripRef.get();
      
      if (tripSnap.exists) {
        const tripData = tripSnap.data();
        if (tripData?.ownerId === userId) {
          // Trip owner is missing from trip members, add them
          const memberId = `${tripId}_${userId}`;
          const memberData: Omit<TripMember, 'id'> = {
            tripId,
            userId: userId,
            name: 'Bạn', // Will be replaced with actual user name
            weight: 1,
            role: 'creator',
            joinedAt: new Date(),
          };

          const cleanedMemberData = prepareFirestoreData(memberData);
          await adminDb.collection('tripMembers').doc(memberId).set(cleanedMemberData);
          
          console.log('Added missing trip owner to trip members:', { tripId, userId });
          return true;
        }
      }
    }
    
    return isMember;
  } catch (error) {
    console.error('Error checking trip membership:', error);
    return false;
  }
}

// Update Trip
export async function updateTrip(formDataOrObj: FormData | Record<string, unknown>) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const isFD = typeof (formDataOrObj as any)?.get === 'function';
    const fd = formDataOrObj as FormData;
    const obj = formDataOrObj as Record<string, unknown>;

    const userId = isFD ? (fd.get('userId') as string) : ((obj.userId as string) || (obj.ownerId as string));
    const tripId = isFD ? (fd.get('tripId') as string) : (obj.tripId as string);
    
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    if (!tripId) {
      throw new Error('Trip ID không được để trống');
    }

    // Check if trip exists and user is owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data() as Trip;
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể chỉnh sửa');
    }

    // Check if trip is closed
    if (tripData.status === 'closed') {
      throw new Error('Không thể chỉnh sửa chuyến đi đã được lưu trữ');
    }

    const data = {
      name: (isFD ? (fd.get('name') as string) : (obj.name as string)) || '',
      description: isFD ? ((fd.get('description') as string) || undefined) : ((obj.description as string) || undefined),
      startDate: isFD ? ((fd.get('startDate') as string) || undefined) : ((obj.startDate as string) || undefined),
      endDate: isFD ? ((fd.get('endDate') as string) || undefined) : ((obj.endDate as string) || undefined),
      destination: isFD ? ((fd.get('destination') as string) || undefined) : ((obj.destination as string) || undefined),
      coverUrl: isFD ? ((fd.get('coverUrl') as string) || undefined) : ((obj.coverUrl as string) || undefined),
      costPerPersonPlanned: ((): number | undefined => {
        const raw = isFD ? (fd.get('costPerPersonPlanned') as string) : (obj.costPerPersonPlanned as any);
        if (raw === undefined || raw === null || raw === '') return undefined;
        const num = typeof raw === 'number' ? raw : parseFloat(String(raw));
        return Number.isFinite(num) ? num : undefined;
      })(),
      category: isFD ? ((fd.get('category') as string) || undefined) : ((obj.category as string) || undefined),
    };

    // Validate input
    const validatedData = CreateTripSchema.omit({ slug: true, groupId: true, currency: true }).parse(data);

    // Update trip
    const updateData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    };

    // Clean data before saving to Firestore
    const cleanedUpdateData = prepareFirestoreData(updateData);
    await tripRef.update(cleanedUpdateData);

    return { success: true, message: 'Cập nhật chuyến đi thành công!' };
  } catch (error) {
    console.error('Error updating trip:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật chuyến đi');
  }
}

// Backfill createdAt and creator's joinedAt for trips that were saved with epoch date
export async function backfillTripTimestamps(tripId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data() as Trip;
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể sửa thời gian');
    }

    // Try to derive time from tripId prefix `${ms}_${rand}`
    let derivedDate: Date | null = null;
    const idPrefix = String(tripId).split('_')[0];
    const ms = Number(idPrefix);
    if (Number.isFinite(ms) && ms > 0) {
      derivedDate = new Date(ms);
    }

    // If createdAt is missing/epoch, update it
    const currentCreatedAt = (tripData as any).createdAt?.toDate?.() || (tripData as any).createdAt;
    const isEpoch = !currentCreatedAt || (currentCreatedAt instanceof Date && currentCreatedAt.getTime() === 0);

    const updates: any = {};
    if (derivedDate && isEpoch) {
      updates.createdAt = derivedDate;
    }

    if (Object.keys(updates).length > 0) {
      await tripRef.set(prepareFirestoreData(updates), { merge: true });
    }

    // Also backfill the creator's joinedAt if it's epoch/missing
    const creatorMemberId = `${tripId}_${tripData.ownerId}`;
    const memberRef = adminDb.collection('tripMembers').doc(creatorMemberId);
    const memberSnap = await memberRef.get();
    if (memberSnap.exists) {
      const memberData = memberSnap.data() as any;
      const currentJoinedAt = memberData.joinedAt?.toDate?.() || memberData.joinedAt;
      const joinedEpoch = !currentJoinedAt || (currentJoinedAt instanceof Date && currentJoinedAt.getTime() === 0);
      if (derivedDate && joinedEpoch) {
        await memberRef.set(prepareFirestoreData({ joinedAt: derivedDate }), { merge: true });
      }
    }

    return { success: true, createdAt: derivedDate?.toISOString() };
  } catch (error) {
    console.error('Error backfilling trip timestamps:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật thời gian chuyến đi');
  }
}

// Delete Trip
export async function deleteTrip(tripId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if trip exists and user is owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data() as Trip;
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể xóa');
    }

    // Use batch to delete trip and all related data
    const batch = adminDb.batch();

    // Delete trip
    batch.delete(tripRef);

    // Delete all trip members
    const membersQuery = adminDb.collection('tripMembers').where('tripId', '==', tripId);
    const membersSnapshot = await membersQuery.get();
    membersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all expenses
    const expensesQuery = adminDb.collection('expenses').where('tripId', '==', tripId);
    const expensesSnapshot = await expensesQuery.get();
    expensesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all advances
    const advancesQuery = adminDb.collection('advances').where('tripId', '==', tripId);
    const advancesSnapshot = await advancesQuery.get();
    advancesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all settlements
    const settlementsQuery = adminDb.collection('settlements').where('tripId', '==', tripId);
    const settlementsSnapshot = await settlementsQuery.get();
    settlementsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all settlement transactions
    const transactionsQuery = adminDb.collection('settlementTransactions').where('tripId', '==', tripId);
    const transactionsSnapshot = await transactionsQuery.get();
    transactionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Commit batch
    await batch.commit();

    return { success: true, message: 'Xóa chuyến đi thành công!' };
  } catch (error) {
    console.error('Error deleting trip:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa chuyến đi');
  }
}

// Update member weight
export async function updateMemberWeight(
  tripId: string, 
  memberId: string, 
  weight: number,
  userId: string
) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    if (weight < 0 || weight > 10) {
      throw new Error('Trọng số phải từ 0 đến 10');
    }

    // Check if user is trip owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data();
    if (!tripData) {
      throw new Error('Trip data not found');
    }
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể cập nhật trọng số');
    }

    // Update member weight
    const memberRef = adminDb.collection('tripMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      throw new Error('Thành viên không tồn tại trong chuyến đi');
    }

    await memberRef.update({
      weight: weight,
      weightUpdatedAt: new Date(),
      weightUpdatedBy: userId,
    });

    return { success: true, message: 'Cập nhật trọng số thành công!' };
  } catch (error) {
    console.error('Error updating member weight:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật trọng số');
  }
}

// Update member exclusions
export async function updateMemberExclusions(
  tripId: string, 
  memberId: string, 
  exclusions: string[],
  userId: string
) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if user is trip owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data();
    if (!tripData) {
      throw new Error('Trip data not found');
    }
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể cập nhật loại trừ');
    }

    // Update member exclusions
    const memberRef = adminDb.collection('tripMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      throw new Error('Thành viên không tồn tại trong chuyến đi');
    }

    await memberRef.update({
      exclusions: exclusions,
      exclusionsUpdatedAt: new Date(),
      exclusionsUpdatedBy: userId,
    });

    return { success: true, message: 'Cập nhật loại trừ thành công!' };
  } catch (error) {
    console.error('Error updating member exclusions:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật loại trừ');
  }
}

// Get payment status for all members in a trip
export async function getTripPaymentStatus(tripId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const membersQuery = adminDb.collection('tripMembers')
      .where('tripId', '==', tripId);
    
    const membersSnap = await membersQuery.get();
    
    // Filter out members who have left
    const activeMembers = membersSnap.docs.filter(doc => {
      const data = doc.data();
      return !data.leftAt; // Only include members who haven't left
    });
    
    const paymentStatus: Record<string, boolean> = {};
    activeMembers.forEach(doc => {
      const data = doc.data();
      // Use the full memberId (doc.id) as the key
      if (data.paymentStatus === 'paid') {
        paymentStatus[doc.id] = true;
      } else {
        paymentStatus[doc.id] = false;
      }
    });
    return paymentStatus;
  } catch (error) {
    console.error('Error getting trip payment status:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi lấy trạng thái thanh toán');
  }
}

// Update member payment status
export async function updateMemberPaymentStatus(
  tripId: string, 
  memberId: string, 
  paymentStatus: 'paid' | 'unpaid',
  userId: string
) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if user is trip owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data();
    if (!tripData) {
      throw new Error('Trip data not found');
    }
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể cập nhật trạng thái thanh toán');
    }

    // Update member payment status in tripMembers collection
    const memberRef = adminDb.collection('tripMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      throw new Error('Thành viên không tồn tại trong chuyến đi');
    }

    // Verify this member belongs to the trip
    const memberData = memberSnap.data();
    if (!memberData) {
      throw new Error('Member data not found');
    }
    if (memberData.tripId !== tripId) {
      throw new Error('Thành viên không thuộc chuyến đi này');
    }

    await memberRef.update({
      paymentStatus,
      paymentStatusUpdatedAt: new Date(),
      paymentStatusUpdatedBy: userId,
    });

    return { success: true, message: 'Cập nhật trạng thái thanh toán thành công!' };
  } catch (error) {
    console.error('Error updating member payment status:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
  }
}
