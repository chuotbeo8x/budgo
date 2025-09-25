'use server';

import { adminDb } from '../firebase-admin';
import { User } from '../types';
import { CreateAccountSchema } from '../schemas';
import { prepareFirestoreData } from '../utils/firestore';
import { toDate } from '../utils/date';

// Get User by ID
export async function getUserById(userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      return null;
    }

    const userData = userSnap.data();
    
    // Convert Firestore Timestamps to Date if needed
    const processedUserData = {
      ...userData,
      createdAt: userData?.createdAt?.toDate ? userData.createdAt.toDate() : toDate(userData?.createdAt),
      updatedAt: userData?.updatedAt?.toDate ? userData.updatedAt.toDate() : toDate(userData?.updatedAt),
      birthday: userData?.birthday?.toDate ? userData.birthday.toDate() : (userData?.birthday ? toDate(userData.birthday) : undefined),
    };
    
    return { id: userSnap.id, ...processedUserData } as any;
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin người dùng');
  }
}

// Admin: lock user
export async function lockUser(userId: string) {
  try {
    if (!adminDb) throw new Error('Database not initialized');
    if (!userId) throw new Error('Thiếu userId');
    await adminDb.collection('users').doc(userId).update({ disabled: true, updatedAt: new Date() });
    return { success: true, message: 'Người dùng đã bị khóa' };
  } catch (error) {
    console.error('Error locking user:', error);
    throw new Error('Có lỗi xảy ra khi khóa người dùng');
  }
}

// Admin: unlock user
export async function unlockUser(userId: string) {
  try {
    if (!adminDb) throw new Error('Database not initialized');
    if (!userId) throw new Error('Thiếu userId');
    await adminDb.collection('users').doc(userId).update({ disabled: false, updatedAt: new Date() });
    return { success: true, message: 'Người dùng đã được mở khóa' };
  } catch (error) {
    console.error('Error unlocking user:', error);
    throw new Error('Có lỗi xảy ra khi mở khóa người dùng');
  }
}

// Admin: delete user (MVP: delete profile doc only)
export async function deleteUser(userId: string) {
  try {
    if (!adminDb) throw new Error('Database not initialized');
    if (!userId) throw new Error('Thiếu userId');
    await adminDb.collection('users').doc(userId).delete();
    return { success: true, message: 'Người dùng đã bị xóa' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Có lỗi xảy ra khi xóa người dùng');
  }
}

// Get Users by IDs
export async function getUserByIds(userIds: string[]) {
  try {
    console.log('=== getUserByIds START ===');
    console.log('User IDs:', userIds);
    console.log('Admin DB available:', !!adminDb);
    
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (userIds.length === 0) {
      console.log('No user IDs provided');
      return [];
    }

    // Firestore has a limit of 10 items for 'in' queries
    // So we need to batch them if there are more than 10
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    const allUsers: User[] = [];

    for (const batch of batches) {
      // Use individual getDoc calls instead of 'in' query to avoid issues
      const batchUsers: User[] = [];
      
      for (const userId of batch) {
        try {
          const userRef = adminDb.collection('users').doc(userId);
          const userSnap = await userRef.get();
          
          if (userSnap.exists) {
            const userData = userSnap.data();
            
            if (!userData) {
              console.error(`User data is null for user ${userId}`);
              continue;
            }
            
            // Convert Firestore Timestamps to Date if needed
            const processedUserData = {
              ...userData,
              createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : toDate(userData.createdAt),
              updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : toDate(userData.updatedAt),
              birthday: userData.birthday?.toDate ? userData.birthday.toDate() : (userData.birthday ? toDate(userData.birthday) : undefined),
            };
            
            batchUsers.push({ id: userSnap.id, ...processedUserData } as any);
          }
        } catch (error) {
          console.error(`Error getting user ${userId}:`, error);
        }
      }
      
      allUsers.push(...batchUsers);
    }

    console.log('=== getUserByIds SUCCESS ===');
    console.log('Found users:', allUsers.length);
    console.log('Users:', allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));
    
    return allUsers;
  } catch (error) {
    console.error('Error getting users by IDs:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin người dùng');
  }
}

// Get User by Username
export async function getUserByUsername(username: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!username) {
      throw new Error('Username không được để trống');
    }

    const usersQuery = adminDb.collection('users')
      .where('username', '==', username)
      .limit(1);

    const usersSnapshot = await usersQuery.get();
    
    if (usersSnapshot.empty) {
      throw new Error('Không tìm thấy người dùng với username này');
    }

    const doc = usersSnapshot.docs[0];
    const userData = doc.data();
    
    // Convert Firestore Timestamps to Date if needed
    const processedUserData = {
      ...userData,
      createdAt: userData?.createdAt?.toDate ? userData.createdAt.toDate() : toDate(userData?.createdAt),
      updatedAt: userData?.updatedAt?.toDate ? userData.updatedAt.toDate() : toDate(userData?.updatedAt),
      birthday: userData?.birthday?.toDate ? userData.birthday.toDate() : (userData?.birthday ? toDate(userData.birthday) : undefined),
    };
    
    return { id: doc.id, ...processedUserData } as any;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin người dùng');
  }
}

// Search Users by Email (exact match)
export async function searchUsersByEmail(email: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!email || email.length < 3) {
      return [];
    }

    // Note: Firestore doesn't support case-insensitive search natively
    // This is a simple implementation. For production, consider using Algolia or similar
    const usersQuery = adminDb.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(10);

    const usersSnapshot = await usersQuery.get();
    
    const users = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      
      // Convert Firestore Timestamps to Date if needed
      const processedUserData = {
        ...userData,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
      };
      
      return { id: doc.id, ...processedUserData } as any;
    });

    return users;
  } catch (error) {
    console.error('Error searching users by email:', error);
    throw new Error('Có lỗi xảy ra khi tìm kiếm người dùng');
  }
}

// Search Users by Username (exact match)
export async function searchUsersByUsername(username: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!username || username.length < 2) {
      return [];
    }

    const usersQuery = adminDb.collection('users')
      .where('username', '==', username.toLowerCase())
      .limit(10);

    const usersSnapshot = await usersQuery.get();
    
    const users = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      
      // Convert Firestore Timestamps to Date if needed
      const processedUserData = {
        ...userData,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
      };
      
      return { id: doc.id, ...processedUserData } as any;
    });

    return users;
  } catch (error) {
    console.error('Error searching users by username:', error);
    throw new Error('Có lỗi xảy ra khi tìm kiếm người dùng');
  }
}

// Search Users by Name or Email (friendly search)
export async function searchUsers(query: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Get all users and filter in memory for better search experience
    // Note: This is not scalable for large datasets, but works for MVP
    const usersQuery = adminDb.collection('users').limit(100);
    const usersSnapshot = await usersQuery.get();
    
    const allUsers = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      
      // Convert Firestore Timestamps to Date if needed
      const processedUserData = {
        ...userData,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
      };
      
      return { id: doc.id, ...processedUserData } as any;
    });

    // Filter users by name or email containing the search term
    const filteredUsers = allUsers.filter(user => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             email.includes(searchTerm) || 
             username.includes(searchTerm);
    });

    // Sort by relevance (exact matches first, then partial matches)
    filteredUsers.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const aEmail = (a.email || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const bEmail = (b.email || '').toLowerCase();
      
      // Exact matches first
      const aExact = aName === searchTerm || aEmail === searchTerm;
      const bExact = bName === searchTerm || bEmail === searchTerm;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by name starts with search term
      const aNameStarts = aName.startsWith(searchTerm);
      const bNameStarts = bName.startsWith(searchTerm);
      
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;
      
      // Then by email starts with search term
      const aEmailStarts = aEmail.startsWith(searchTerm);
      const bEmailStarts = bEmail.startsWith(searchTerm);
      
      if (aEmailStarts && !bEmailStarts) return -1;
      if (!aEmailStarts && bEmailStarts) return 1;
      
      // Finally alphabetical
      return aName.localeCompare(bName);
    });

    return filteredUsers.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Có lỗi xảy ra khi tìm kiếm người dùng');
  }
}

// Get today's birthdays
// Vote for a user's title
export async function voteForUserTitle(voterId: string, targetUserId: string, titleId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database not initialized');
    }

    if (!voterId || !targetUserId || !titleId) {
      throw new Error('Missing required parameters');
    }

    if (voterId === targetUserId) {
      throw new Error('Không thể vote cho chính mình');
    }

    // Check if voter has already voted for this title for this user
    const voteId = `${voterId}_${targetUserId}_${titleId}`;
    const voteRef = adminDb.collection('userTitleVotes').doc(voteId);
    const voteSnap = await voteRef.get();

    if (voteSnap.exists) {
      // Remove existing vote
      await voteRef.delete();
      return { success: true, message: 'Đã hủy vote', action: 'removed' };
    } else {
      // Add new vote
      await voteRef.set({
        voterId,
        targetUserId,
        titleId,
        createdAt: new Date(),
      });
      return { success: true, message: 'Đã vote thành công', action: 'added' };
    }
  } catch (error) {
    console.error('Error voting for user title:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi vote');
  }
}

// Get user's title votes
export async function getUserTitleVotes(userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database not initialized');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get all votes for this user
    const votesSnapshot = await adminDb.collection('userTitleVotes')
      .where('targetUserId', '==', userId)
      .get();

    const titleVotes: { [titleId: string]: number } = {};
    votesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const titleId = data.titleId;
      titleVotes[titleId] = (titleVotes[titleId] || 0) + 1;
    });

    return titleVotes;
  } catch (error) {
    console.error('Error getting user title votes:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi lấy thông tin vote');
  }
}

// Check if current user has voted for specific titles
export async function getUserVotesForTarget(voterId: string, targetUserId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database not initialized');
    }

    if (!voterId || !targetUserId) {
      throw new Error('Missing required parameters');
    }

    const votesSnapshot = await adminDb.collection('userTitleVotes')
      .where('voterId', '==', voterId)
      .where('targetUserId', '==', targetUserId)
      .get();

    const votedTitles: string[] = [];
    votesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      votedTitles.push(data.titleId);
    });

    return votedTitles;
  } catch (error) {
    console.error('Error getting user votes for target:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi lấy thông tin vote');
  }
}

export async function getTodaysBirthdays(userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      return []; // Return empty array instead of throwing error
    }

    if (!userId) {
      console.error('No userId provided');
      return [];
    }

    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Get all users with birthdays today (simplified query)
    const usersQuery = adminDb.collection('users')
      .where('birthday', '!=', null)
      .limit(50); // Limit to prevent timeout
    
    const usersSnapshot = await usersQuery.get();
    
    const birthdayUsers: any[] = [];
    usersSnapshot.docs.forEach(doc => {
      try {
        const userData = doc.data();
        if (!userData.birthday) return;
        
        const birthday = userData.birthday?.toDate ? userData.birthday.toDate() : new Date(userData.birthday);
        const birthdayStr = `${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`;
        
        if (birthdayStr === todayStr) {
          birthdayUsers.push({
            id: doc.id,
            name: userData.name || 'Unknown',
            avatar: userData.avatar || userData.photoURL,
            username: userData.username || userData.email?.split('@')[0] || 'unknown'
          });
        }
      } catch (userError) {
        console.error('Error processing user:', doc.id, userError);
      }
    });

    // If no birthday users, return empty array
    if (birthdayUsers.length === 0) {
      return [];
    }

    // Get groups where the current user is a member (simplified)
    const userGroupsQuery = adminDb.collection('groupMembers')
      .where('userId', '==', userId)
      .limit(20); // Limit to prevent timeout
    
    const userGroupsSnapshot = await userGroupsQuery.get();
    const userGroupIds = userGroupsSnapshot.docs.map(doc => doc.data().groupId);

    if (userGroupIds.length === 0) {
      return [];
    }

    // Get group members for each group (simplified)
    const birthdayMembers = [];
    for (const birthdayUser of birthdayUsers.slice(0, 10)) { // Limit to 10 users
      for (const groupId of userGroupIds.slice(0, 5)) { // Limit to 5 groups
        try {
          const groupMemberQuery = adminDb.collection('groupMembers')
            .where('groupId', '==', groupId)
            .where('userId', '==', birthdayUser.id)
            .limit(1);
          
          const groupMemberSnapshot = await groupMemberQuery.get();
          
          if (!groupMemberSnapshot.empty) {
            // Get group name
            const groupRef = adminDb.collection('groups').doc(groupId);
            const groupSnap = await groupRef.get();
            const groupData = groupSnap.data();
            
            birthdayMembers.push({
              ...birthdayUser,
              groupId,
              groupName: groupData?.name || 'Unknown Group'
            });
            break; // Found in one group, no need to check others
          }
        } catch (groupError) {
          console.error('Error checking group membership:', groupError);
        }
      }
    }

    return birthdayMembers;
  } catch (error) {
    console.error('Error getting today\'s birthdays:', error);
    return []; // Return empty array instead of throwing error
  }
}

// Create User Profile
export async function createUserProfile(formData: FormData) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const googleUid = formData.get('googleUid') as string;
    const email = formData.get('email') as string;
    
    if (!googleUid) {
      throw new Error('Google UID không được để trống');
    }

    if (!email) {
      throw new Error('Email không được để trống');
    }

    // Check if user already exists
    const existingUserRef = adminDb.collection('users').doc(googleUid);
    const existingUserSnap = await existingUserRef.get();
    
    if (existingUserSnap.exists) {
      throw new Error('Người dùng đã tồn tại');
    }

    // Get Google username from email (part before @)
    const googleUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const data = {
      name: formData.get('name') as string,
      username: formData.get('username') as string || googleUsername,
      avatarUrl: formData.get('avatarUrl') as string || undefined,
      birthday: formData.get('birthday') as string || undefined,
    };

    // Validate input
    const validatedData = CreateAccountSchema.parse(data);

    // Check if username is already taken
    const usernameQuery = adminDb.collection('users')
      .where('username', '==', validatedData.username);
    const usernameSnapshot = await usernameQuery.get();
    
    if (!usernameSnapshot.empty) {
      throw new Error('Username đã được sử dụng');
    }

    // Create user profile
    const userData = {
      googleUid: googleUid,
      email: email,
      name: validatedData.name,
      username: validatedData.username,
      avatar: validatedData.avatarUrl || '',
      birthday: validatedData.birthday || undefined,
      createdAt: new Date(),
    };

    // Clean data before saving to Firestore
    const cleanedUserData = prepareFirestoreData(userData);
    await existingUserRef.set(cleanedUserData);

    return { success: true, userId: googleUid };
  } catch (error) {
    console.error('Error creating user profile:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi tạo profile người dùng');
  }
}

// Update User Profile (name, avatar only)
export async function updateUserProfile(formData: FormData) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const googleUid = formData.get('googleUid') as string;
    const name = (formData.get('name') as string) || '';
    const birthday = formData.get('birthday') as string;
    const phone = formData.get('phone') as string;
    const bio = formData.get('bio') as string;
    const location = formData.get('location') as string;
    const currency = formData.get('currency') as string;
    const notifications = formData.get('notifications') as string;

    if (!googleUid) {
      throw new Error('Google UID không được để trống');
    }

    // Only allow updating limited fields per spec
    const userRef = adminDb.collection('users').doc(googleUid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new Error('Không tìm thấy người dùng');
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (birthday) {
      // Convert birthday string to Date
      const birthdayDate = new Date(birthday);
      if (!isNaN(birthdayDate.getTime())) {
        updateData.birthday = birthdayDate;
      }
    }
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (currency) updateData.currency = currency;
    if (notifications) {
      try {
        updateData.notifications = JSON.parse(notifications);
      } catch (error) {
        console.warn('Invalid notifications JSON:', notifications);
      }
    }
    updateData.updatedAt = new Date();

    const cleaned = prepareFirestoreData(updateData);
    await userRef.update(cleaned);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật profile người dùng');
  }
}

// Get User Profile with detailed stats
export async function getUserProfile(usernameOrId: string) {
  try {
    console.log('getUserProfile called with:', usernameOrId);
    
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    // First try to find by username
    console.log('Searching by username:', usernameOrId);
    const usernameQuery = adminDb.collection('users')
      .where('username', '==', usernameOrId)
      .limit(1);
    const usernameSnapshot = await usernameQuery.get();
    
    console.log('Username query result:', usernameSnapshot.empty ? 'empty' : 'found');
    
    let userDoc;
    if (!usernameSnapshot.empty) {
      userDoc = usernameSnapshot.docs[0];
      console.log('Found by username');
    } else {
      // If not found by username, try by ID
      console.log('Searching by ID:', usernameOrId);
      const userRef = adminDb.collection('users').doc(usernameOrId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        userDoc = userSnap;
        console.log('Found by ID');
      }
    }

    if (!userDoc) {
      console.log('User not found');
      return { success: false, error: 'Không tìm thấy người dùng' };
    }

    const userData = userDoc.data();
    const userId = userDoc.id;
    console.log('User found:', userId, userData?.name);

    // Get real stats
    console.log('Fetching real user stats for user:', userId);
    
    // Get user's trips (simplified query to avoid index issues)
    let recentTrips: any[] = [];
    let totalTrips = 0;
    try {
      // First get all trips by ownerId (without orderBy to avoid index requirement)
      const tripsQuery = adminDb.collection('trips')
        .where('ownerId', '==', userId)
        .limit(20); // Get more to sort client-side
      const tripsSnapshot = await tripsQuery.get();
      
      // Sort client-side by createdAt
      const allTrips = tripsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Trip',
          startDate: data.startDate?.toDate?.() || data.startDate,
          endDate: data.endDate?.toDate?.() || data.endDate,
          totalExpense: data.totalExpense || 0,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
        };
      });
      
      // Sort by createdAt descending and take first 5
      recentTrips = allTrips
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      totalTrips = allTrips.length;
      console.log('Found trips:', totalTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }

    // Get user's groups (simplified to avoid complex queries)
    let userGroups: any[] = [];
    let totalGroups = 0;
    try {
      // Get all group memberships for this user
      const groupsQuery = adminDb.collection('groupMembers')
        .where('userId', '==', userId);
      const groupsSnapshot = await groupsQuery.get();
      
      // Filter active memberships client-side
      const activeMemberships = groupsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.leftAt || data.leftAt === null;
      });
      
      const groupIds = activeMemberships.map(doc => doc.data().groupId);
      console.log('Found group memberships:', groupIds.length);
      
      if (groupIds.length > 0) {
        // Fetch groups one by one to avoid complex queries
        for (const groupId of groupIds.slice(0, 6)) {
          try {
            const groupDoc = await adminDb.collection('groups').doc(groupId).get();
            if (groupDoc.exists) {
              const groupData = groupDoc.data();
              
              // Get member count (simplified query)
              const memberCountQuery = adminDb.collection('groupMembers')
                .where('groupId', '==', groupId);
              const memberCountSnapshot = await memberCountQuery.get();
              
              // Filter active members client-side
              const activeMembers = memberCountSnapshot.docs.filter(doc => {
                const data = doc.data();
                return !data.leftAt || data.leftAt === null;
              });
              
              // Get trip count (simplified query)
              const tripCountQuery = adminDb.collection('trips')
                .where('groupId', '==', groupId);
              const tripCountSnapshot = await tripCountQuery.get();
              
              userGroups.push({
                id: groupId,
                name: groupData?.name || 'Unknown Group',
                description: groupData?.description || '',
                memberCount: activeMembers.length,
                tripCount: tripCountSnapshot.size
              });
            }
          } catch (error) {
            console.warn(`Error fetching group ${groupId}:`, error);
          }
        }
      }
      totalGroups = userGroups.length;
      console.log('Found groups:', totalGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }

    // Calculate total expenses
    let totalExpenses = 0;
    try {
      for (const trip of recentTrips) {
        totalExpenses += trip.totalExpense || 0;
      }
      console.log('Total expenses calculated:', totalExpenses);
    } catch (error) {
      console.error('Error calculating total expenses:', error);
    }

    // Get titles and votes
    const titles = userData?.titles || [];
    const totalVotes = userData?.totalVotes || 0;

    const result = {
      success: true,
      data: {
        id: userId,
        name: userData?.name || 'Chưa có tên',
        email: userData?.email || '',
        username: userData?.username || userId,
        avatar: userData?.photoURL || userData?.avatar,
        bio: userData?.bio || '',
        phone: userData?.phone || '',
        location: userData?.location || '',
        isPublic: userData?.isPublic || false,
        createdAt: userData?.createdAt?.toDate?.() || new Date(userData?.createdAt),
        // Stats
        totalTrips,
        totalGroups,
        totalExpenses,
        // Titles
        titles,
        totalVotes,
        // Recent activity
        recentTrips,
        userGroups
      }
    };

    console.log('Returning user profile data:', {
      id: result.data.id,
      name: result.data.name,
      totalTrips: result.data.totalTrips,
      totalGroups: result.data.totalGroups,
      totalExpenses: result.data.totalExpenses,
      recentTripsCount: result.data.recentTrips.length,
      userGroupsCount: result.data.userGroups.length
    });

    return result;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: 'Có lỗi xảy ra khi tải thông tin người dùng' };
  }
}
