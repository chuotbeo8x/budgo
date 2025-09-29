'use server';

import { adminDb } from '../firebase-admin-new';
import { CreateGroupSchema } from '../schemas';
import { Group, GroupMember, JoinRequest } from '../types';
import { prepareFirestoreData } from '../utils/firestore';
import { toDate, safeToDate } from '../utils/date';
import { searchUsersByEmail, searchUsersByUsername } from './users';

export async function createGroup(inputData: any) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    // Handle both FormData and object formats
    const userId = inputData.get ? inputData.get('userId') as string : inputData.userId;
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    const groupName = inputData.get ? inputData.get('name') as string : inputData.name;
    const baseSlug = inputData.get ? inputData.get('slug') as string : inputData.slug;
    
    // Generate unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const groupRef = adminDb.collection('groups').doc(finalSlug);
      const groupSnap = await groupRef.get();
      
      if (!groupSnap.exists) {
        break; // Slug is unique
      }
      
      // Generate new slug with counter
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
      
      // Prevent infinite loop
      if (counter > 1000) {
        throw new Error('Không thể tạo slug duy nhất cho nhóm');
      }
    }

    const data = {
      name: groupName,
      description: inputData.get ? inputData.get('description') as string : inputData.description || undefined,
      coverUrl: inputData.get ? inputData.get('coverUrl') as string : inputData.coverUrl || undefined,
      type: inputData.get ? inputData.get('type') as 'public' | 'close' | 'secret' : inputData.type,
      slug: finalSlug,
    };

    // Validate input
    const validatedData = CreateGroupSchema.parse(data);

    // Create group
    const groupId = validatedData.slug;
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupData = {
      name: validatedData.name,
      description: validatedData.description,
      coverUrl: validatedData.coverUrl,
      type: validatedData.type,
      ownerId: userId,
      slug: validatedData.slug,
      createdAt: new Date(),
    };

    // Clean data before saving to Firestore
    const cleanedGroupData = prepareFirestoreData(groupData);
    await groupRef.set(cleanedGroupData);

    // Add owner as member
    const memberId = `${groupId}_${userId}`;
    const memberData = {
      groupId,
      userId: userId,
      role: 'owner',
      joinedAt: new Date(),
    };

    console.log('Creating group member:', {
      memberId,
      memberData,
      groupId,
      userId
    });

    const cleanedMemberData = prepareFirestoreData(memberData);
    console.log('Cleaned member data:', cleanedMemberData);
    
    await adminDb.collection('groupMembers').doc(memberId).set(cleanedMemberData);
    console.log('Group member created successfully');

    return { success: true, groupId };
  } catch (error) {
    console.error('Error creating group:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi tạo nhóm');
  }
}

export async function getGroupBySlug(slug: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    const groupRef = adminDb.collection('groups').doc(slug);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      return null;
    }

    const groupData = groupSnap.data();
    
    // Convert Firestore Timestamp to Date if needed
    const processedGroupData = {
      ...groupData,
      createdAt: safeToDate(groupData?.createdAt) || new Date()
    };
    
    return { id: groupSnap.id, ...processedGroupData } as Group;
  } catch (error) {
    console.error('Error getting group:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin nhóm');
  }
}

export async function getUserGroups(userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }
    console.log('Getting groups for user:', userId);
    
    // First get group members
    const membersQuery = adminDb.collection('groupMembers')
      .where('userId', '==', userId);
    
    const membersSnapshot = await membersQuery.get();
    console.log('Found members:', membersSnapshot.docs.length);
    
    // Debug: Log all member data
    membersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Member ${index}:`, {
        id: doc.id,
        groupId: data.groupId,
        userId: data.userId,
        role: data.role,
        joinedAt: data.joinedAt,
        leftAt: data.leftAt
      });
    });
    
    // Filter out members who have left the group (handle both null and empty object cases)
    const activeMembers = membersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.leftAt || (typeof data.leftAt === 'object' && Object.keys(data.leftAt).length === 0);
    });
    
    console.log('Active members:', activeMembers.length);
    
    const groupIds = activeMembers.map(doc => doc.data().groupId);
    
    if (groupIds.length === 0) {
      console.log('No groups found for user');
      return [];
    }

    // Get groups by individual queries to avoid 'in' operator issues
    const groups: Group[] = [];
    
    for (const groupId of groupIds) {
      try {
        console.log(`Getting group: ${groupId}`);
        const groupRef = adminDb.collection('groups').doc(groupId);
        const groupSnap = await groupRef.get();
        
        if (groupSnap.exists) {
          const groupData = groupSnap.data();
          console.log(`Group ${groupId} data:`, groupData);
          
          // Get member count for this group (all active members)
          const memberCountQuery = adminDb.collection('groupMembers')
            .where('groupId', '==', groupId);
          const memberCountSnapshot = await memberCountQuery.get();
          
          // Filter out members who have left (handle both null and empty object cases)
          const activeMembers = memberCountSnapshot.docs.filter(doc => {
            const data = doc.data();
            return !data.leftAt || (typeof data.leftAt === 'object' && Object.keys(data.leftAt).length === 0);
          });
          
          const memberCount = activeMembers.length;
          
          console.log(`Group ${groupId} - Total members: ${memberCountSnapshot.docs.length}, Active members: ${memberCount}`);
          
          // Convert Firestore Timestamp to Date if needed
          console.log(`Group ${groupId} - createdAt raw:`, groupData?.createdAt);
          const createdAt = safeToDate(groupData?.createdAt) || new Date();
          console.log(`Group ${groupId} - createdAt converted:`, createdAt);
          
          const processedGroupData = {
            ...groupData,
            createdAt: createdAt,
            memberCount: memberCount
          };
          
          groups.push({
            id: groupSnap.id,
            ...processedGroupData
          } as Group & { memberCount: number });
        } else {
          console.warn(`Group ${groupId} not found`);
        }
      } catch (groupError) {
        console.error(`Error getting group ${groupId}:`, groupError);
        // Continue with other groups even if one fails
      }
    }
    
    console.log('Returning groups:', groups.length);
    return groups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      adminDbAvailable: !!adminDb
    });
    throw new Error('Có lỗi xảy ra khi lấy danh sách nhóm');
  }
}

export async function checkSlugExists(slug: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    const groupRef = adminDb.collection('groups').doc(slug);
    const groupSnap = await groupRef.get();
    return groupSnap.exists;
  } catch (error) {
    console.error('Error checking slug:', error);
    return false;
  }
}

export async function joinGroup(groupId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Get group info
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;

    // Check if user is already an active member
    const memberId = `${groupId}_${userId}`;
    const memberRef = adminDb.collection('groupMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (memberSnap.exists) {
      const memberData = memberSnap.data() as GroupMember;
      // Check if member has not left the group
      if (!memberData.leftAt) {
        throw new Error('Bạn đã là thành viên của nhóm này');
      }
      // If member has left, we can allow them to rejoin
    }

    // Check group type and permissions
    if (groupData.type === 'secret') {
      throw new Error('Nhóm này là bí mật, chỉ có thể tham gia qua lời mời');
    }

    // For public groups, join immediately
    if (groupData.type === 'public') {
      // Use current UTC time to avoid timezone issues
      const newJoinedAt = new Date();
      console.log('Setting joinedAt to:', newJoinedAt, 'UTC time:', newJoinedAt.toISOString(), 'Year:', newJoinedAt.getFullYear());
      
      let memberData;
      
      if (memberSnap.exists) {
        // User is rejoining - update joinedAt to current time
        const existingData = memberSnap.data() as GroupMember;
        console.log('User rejoining group - existing data:', {
          userId,
          groupId,
          oldJoinedAt: existingData.joinedAt,
          newJoinedAt: newJoinedAt,
          leftAt: existingData.leftAt
        });
        
        memberData = {
          ...existingData,
          joinedAt: newJoinedAt, // Update to new join time
          leftAt: null, // Clear leftAt if rejoining
        };
      } else {
        // User is joining for the first time
        console.log('User joining group for first time:', { userId, groupId, joinedAt: newJoinedAt });
        memberData = {
          groupId,
          userId: userId,
          role: 'member',
          joinedAt: newJoinedAt,
        };
      }

      console.log('Final memberData before save:', memberData);
      const cleanedMemberData = prepareFirestoreData(memberData);
      console.log('Cleaned memberData:', cleanedMemberData);
      
      await memberRef.set(cleanedMemberData);
      console.log('Successfully saved member data');
      
      return { success: true, message: 'Tham gia nhóm thành công!' };
    }

    // For close groups, create join request
    if (groupData.type === 'close') {
      // Check if there's already a pending request
      const requestId = `${groupId}_${userId}`;
      const requestRef = adminDb.collection('joinRequests').doc(requestId);
      const requestSnap = await requestRef.get();
      
      if (requestSnap.exists) {
        const requestData = requestSnap.data();
        if (requestData?.status === 'pending') {
          throw new Error('Bạn đã gửi yêu cầu tham gia nhóm này rồi');
        }
      }

      // Create join request
      const requestData = {
        groupId,
        userId: userId,
        status: 'pending',
        requestedAt: new Date(),
      };

      const cleanedRequestData = prepareFirestoreData(requestData);
      await requestRef.set(cleanedRequestData);
      
      return { success: true, message: 'Đã gửi yêu cầu tham gia nhóm. Chờ chủ nhóm phê duyệt.' };
    }

    throw new Error('Loại nhóm không hợp lệ');
  } catch (error) {
    console.error('Error joining group:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi tham gia nhóm');
  }
}

export async function leaveGroup(groupId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    const memberId = `${groupId}_${userId}`;
    const memberRef = adminDb.collection('groupMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      throw new Error('Bạn không phải là thành viên của nhóm này');
    }

    const memberData = memberSnap.data() as GroupMember;
    
    // Owner cannot leave group
    if (memberData.role === 'owner') {
      throw new Error('Chủ nhóm không thể rời khỏi nhóm');
    }

    // Mark as left instead of deleting
    const updateData = {
      ...memberData,
      leftAt: new Date(),
    };
    
    const cleanedUpdateData = prepareFirestoreData(updateData);
    await memberRef.set(cleanedUpdateData, { merge: true });

    return { success: true, message: 'Rời nhóm thành công!' };
  } catch (error) {
    console.error('Error leaving group:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi rời nhóm');
  }
}

export async function getGroupMembers(groupId: string) {
  try {
    console.log('Getting members for group:', groupId);
    
    // Check if adminDb is available
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    
    const q = adminDb.collection('groupMembers')
      .where('groupId', '==', groupId);
    
    const querySnapshot = await q.get();
    console.log('Found members:', querySnapshot.docs.length);
    
    // Filter out members who have left the group
    const activeMembers = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      const leftAt = data.leftAt;
      // Consider null, undefined, or empty object as "not left"
      return leftAt === null || leftAt === undefined || (typeof leftAt === 'object' && Object.keys(leftAt).length === 0);
    });
    
    console.log('Active members:', activeMembers.length);
    
    // Get all user IDs that need to be fetched
    const userIds = activeMembers
      .map(doc => doc.data().userId)
      .filter(userId => userId);

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
            avatar: userData.photoURL || userData.avatar
          });
        });
      } catch (error) {
        console.error('Error fetching user data for group members:', error);
        // Continue without user data
      }
    }

    // Fetch title votes for each member (use correct collection and compute top title)
    const titleVotesMap = new Map();
    const topTitleMap = new Map();
    for (const userId of userIds) {
      try {
        const titleVotesQuery = adminDb.collection('userTitleVotes')
          .where('targetUserId', '==', userId);
        const titleVotesSnapshot = await titleVotesQuery.get();
        
        const votes: { [titleId: string]: number } = {};
        const latestByTitle: { [titleId: string]: number } = {};
        titleVotesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const titleId = data.titleId;
          if (titleId) {
            votes[titleId] = (votes[titleId] || 0) + 1;
            const ts = (data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now())).getTime();
            latestByTitle[titleId] = Math.max(latestByTitle[titleId] || 0, ts);
          }
        });
        
        titleVotesMap.set(userId, votes);
        // Compute top title with tie-breaker by latest vote time
        const entries = Object.entries(votes);
        if (entries.length > 0) {
          entries.sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return (latestByTitle[b[0]] || 0) - (latestByTitle[a[0]] || 0);
          });
          const [topTitleId, topCount] = entries[0];
          topTitleMap.set(userId, {
            titleId: topTitleId,
            count: topCount,
            latestAt: latestByTitle[topTitleId] ? new Date(latestByTitle[topTitleId]) : undefined,
          });
        } else {
          topTitleMap.set(userId, null);
        }
      } catch (error) {
        console.error(`Error fetching title votes for user ${userId}:`, error);
        titleVotesMap.set(userId, {});
        topTitleMap.set(userId, null);
      }
    }

    const members = activeMembers.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to Date if needed
      const processedData = {
        ...data,
        joinedAt: safeToDate(data.joinedAt) || new Date(),
        leftAt: safeToDate(data.leftAt)
      };
      
      // Get user data for display
      const userData = userDataMap.get((processedData as any).userId);
      const titleVotes = titleVotesMap.get((processedData as any).userId) || {};
      const topTitle = topTitleMap.get((processedData as any).userId) || null;
      
      return {
        id: doc.id,
        ...processedData,
        name: userData?.name || 'Unknown User',
        email: userData?.email || '',
        username: userData?.username || '',
        avatar: userData?.avatar || '',
        titleVotes: titleVotes,
        topTitle: topTitle
      };
    }) as (GroupMember & { name: string; email: string; username: string; avatar: string; titleVotes: { [titleId: string]: number }; topTitle: { titleId: string; count: number; latestAt?: Date } | null })[];

    // Sort by joinedAt in code
    members.sort((a, b) => {
      const aTime = a.joinedAt instanceof Date ? a.joinedAt.getTime() : new Date(a.joinedAt).getTime();
      const bTime = b.joinedAt instanceof Date ? b.joinedAt.getTime() : new Date(b.joinedAt).getTime();
      return aTime - bTime; // ascending order (oldest first)
    });

    return members;
  } catch (error) {
    console.error('Error getting group members:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      groupId,
      adminDbAvailable: !!adminDb
    });
    throw new Error('Có lỗi xảy ra khi lấy danh sách thành viên');
  }
}

export async function isGroupMember(groupId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    const memberId = `${groupId}_${userId}`;
    const memberRef = adminDb.collection('groupMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      return false;
    }

    const memberData = memberSnap.data() as GroupMember;
    return !memberData.leftAt; // Not left the group
  } catch (error) {
    console.error('Error checking group membership:', error);
    return false;
  }
}

// Add Group Member (by email)
export async function addGroupMember(formData: FormData) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    const userId = formData.get('userId') as string;
    const groupId = formData.get('groupId') as string;
    const memberEmail = formData.get('memberEmail') as string;

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    if (!groupId) {
      throw new Error('Group ID không được để trống');
    }

    if (!memberEmail) {
      throw new Error('Email thành viên không được để trống');
    }

    // Check if group exists
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;

    // Check if user is group owner
    if (groupData.ownerId !== userId) {
      throw new Error('Chỉ chủ nhóm mới có thể thêm thành viên');
    }

    // Find user by email
    const users = await searchUsersByEmail(memberEmail);
    if (users.length === 0) {
      throw new Error('Không tìm thấy người dùng với email này');
    }

    const targetUser = users[0]; // Take the first match

    // Check if user is already a member
    const existingMemberId = `${groupId}_${targetUser.id}`;
    const existingMemberRef = adminDb.collection('groupMembers').doc(existingMemberId);
    const existingMemberSnap = await existingMemberRef.get();
    
    if (existingMemberSnap.exists) {
      throw new Error('Người dùng này đã là thành viên của nhóm');
    }

    // Create group member
    const memberData: Omit<GroupMember, 'id'> = {
      groupId: groupId,
      userId: targetUser.id,
      role: 'member',
      joinedAt: new Date(),
    };

    // Clean data before saving to Firestore
    const cleanedMemberData = prepareFirestoreData(memberData);
    await existingMemberRef.set(cleanedMemberData);

    return { success: true, memberId: existingMemberId, message: `Đã thêm thành viên ${targetUser.name} vào nhóm` };
  } catch (error) {
    console.error('Error adding group member:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi thêm thành viên');
  }
}

// Remove Group Member
export async function removeGroupMember(groupId: string, memberId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if group exists
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;

    // Check if user is group owner
    if (groupData.ownerId !== userId) {
      throw new Error('Chỉ chủ nhóm mới có thể xóa thành viên');
    }

    // Get member data
    const memberRef = adminDb.collection('groupMembers').doc(memberId);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      throw new Error('Thành viên không tồn tại');
    }

    const memberData = memberSnap.data() as GroupMember;
    
    // Owner cannot be removed
    if (memberData.role === 'owner') {
      throw new Error('Không thể xóa chủ nhóm');
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
    console.error('Error removing group member:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa thành viên');
  }
}

// Update Group
export async function updateGroup(formData: FormData) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const userId = formData.get('userId') as string;
    const groupId = formData.get('groupId') as string;
    
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    if (!groupId) {
      throw new Error('ID nhóm không hợp lệ');
    }

    // Check if user is owner
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data();
    if (groupData?.ownerId !== userId) {
      throw new Error('Bạn không có quyền chỉnh sửa nhóm này');
    }

    const updateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      coverUrl: formData.get('coverUrl') as string || undefined,
      type: formData.get('type') as 'public' | 'close' | 'secret',
      updatedAt: new Date(),
    };

    // Validate input
    const validatedData = CreateGroupSchema.parse({
      ...updateData,
      slug: groupSnap.id, // Keep existing slug
    });

    // Update group
    await groupRef.update(prepareFirestoreData(validatedData));

    return { success: true, message: 'Cập nhật nhóm thành công!' };
  } catch (error) {
    console.error('Error updating group:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật nhóm');
  }
}

// Delete Group
export async function deleteGroup(formData: FormData) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const userId = formData.get('userId') as string;
    const groupId = formData.get('groupId') as string;
    
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    if (!groupId) {
      throw new Error('ID nhóm không hợp lệ');
    }

    // Check if user is owner
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data();
    if (groupData?.ownerId !== userId) {
      throw new Error('Bạn không có quyền xóa nhóm này');
    }

    // Delete group members
    const membersQuery = adminDb.collection('groupMembers')
      .where('groupId', '==', groupId);
    const membersSnapshot = await membersQuery.get();
    
    const deletePromises = membersSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Delete group trips
    const tripsQuery = adminDb.collection('trips')
      .where('groupId', '==', groupId);
    const tripsSnapshot = await tripsQuery.get();
    
    const tripDeletePromises = tripsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(tripDeletePromises);

    // Delete group
    await groupRef.delete();

    return { success: true, message: 'Xóa nhóm thành công!' };
  } catch (error) {
    console.error('Error deleting group:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa nhóm');
  }
}

// Join Request Management
export async function getJoinRequests(groupId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if user is group owner
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;
    if (groupData.ownerId !== userId) {
      throw new Error('Chỉ chủ nhóm mới có thể xem yêu cầu tham gia');
    }

    const requestsQuery = adminDb.collection('joinRequests')
      .where('groupId', '==', groupId)
      .where('status', '==', 'pending');

    const requestsSnapshot = await requestsQuery.get();
    
    const requests = requestsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requestedAt: data.requestedAt?.toDate ? data.requestedAt.toDate() : data.requestedAt,
        processedAt: data.processedAt?.toDate ? data.processedAt.toDate() : data.processedAt,
      };
    }) as JoinRequest[];

    // Sort by requestedAt in code (descending)
    requests.sort((a, b) => {
      const aTime = a.requestedAt instanceof Date ? a.requestedAt.getTime() : new Date(a.requestedAt).getTime();
      const bTime = b.requestedAt instanceof Date ? b.requestedAt.getTime() : new Date(b.requestedAt).getTime();
      return bTime - aTime; // descending order (newest first)
    });

    return requests;
  } catch (error) {
    console.error('Error getting join requests:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi lấy danh sách yêu cầu tham gia');
  }
}

export async function approveJoinRequest(requestId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Get join request
    const requestRef = adminDb.collection('joinRequests').doc(requestId);
    const requestSnap = await requestRef.get();
    
    if (!requestSnap.exists) {
      throw new Error('Yêu cầu tham gia không tồn tại');
    }

    const requestData = requestSnap.data() as JoinRequest;
    
    // Check if user is group owner
    const groupRef = adminDb.collection('groups').doc(requestData.groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;
    if (groupData.ownerId !== userId) {
      throw new Error('Chỉ chủ nhóm mới có thể phê duyệt yêu cầu');
    }

    if (requestData.status !== 'pending') {
      throw new Error('Yêu cầu này đã được xử lý rồi');
    }

    // Add user to group
    const memberId = `${requestData.groupId}_${requestData.userId}`;
    const memberData = {
      groupId: requestData.groupId,
      userId: requestData.userId,
      role: 'member',
      joinedAt: new Date(),
    };

    const cleanedMemberData = prepareFirestoreData(memberData);
    await adminDb.collection('groupMembers').doc(memberId).set(cleanedMemberData);

    // Update request status
    const updateData = {
      status: 'approved',
      processedAt: new Date(),
      processedBy: userId,
    };

    const cleanedUpdateData = prepareFirestoreData(updateData);
    await requestRef.update(cleanedUpdateData);

    return { success: true, message: 'Đã phê duyệt yêu cầu tham gia nhóm' };
  } catch (error) {
    console.error('Error approving join request:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi phê duyệt yêu cầu');
  }
}

export async function rejectJoinRequest(requestId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Get join request
    const requestRef = adminDb.collection('joinRequests').doc(requestId);
    const requestSnap = await requestRef.get();
    
    if (!requestSnap.exists) {
      throw new Error('Yêu cầu tham gia không tồn tại');
    }

    const requestData = requestSnap.data() as JoinRequest;
    
    // Check if user is group owner
    const groupRef = adminDb.collection('groups').doc(requestData.groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;
    if (groupData.ownerId !== userId) {
      throw new Error('Chỉ chủ nhóm mới có thể từ chối yêu cầu');
    }

    if (requestData.status !== 'pending') {
      throw new Error('Yêu cầu này đã được xử lý rồi');
    }

    // Update request status
    const updateData = {
      status: 'rejected',
      processedAt: new Date(),
      processedBy: userId,
    };

    const cleanedUpdateData = prepareFirestoreData(updateData);
    await requestRef.update(cleanedUpdateData);

    return { success: true, message: 'Đã từ chối yêu cầu tham gia nhóm' };
  } catch (error) {
    console.error('Error rejecting join request:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi từ chối yêu cầu');
  }
}


// Transfer Group Ownership
export async function transferGroupOwnership(groupId: string, newOwnerId: string, currentOwnerId: string) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    if (!currentOwnerId) {
      throw new Error('Chưa đăng nhập');
    }

    if (!newOwnerId) {
      throw new Error('ID chủ nhóm mới không được để trống');
    }

    // Check if group exists and user is current owner
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;
    if (groupData.ownerId !== currentOwnerId) {
      throw new Error('Chỉ chủ nhóm hiện tại mới có thể chuyển quyền');
    }

    // Check if new owner is a member of the group
    const newOwnerMemberId = `${groupId}_${newOwnerId}`;
    const newOwnerMemberRef = adminDb.collection('groupMembers').doc(newOwnerMemberId);
    const newOwnerMemberSnap = await newOwnerMemberRef.get();
    
    if (!newOwnerMemberSnap.exists) {
      throw new Error('Người dùng này không phải là thành viên của nhóm');
    }

    const newOwnerMemberData = newOwnerMemberSnap.data() as GroupMember;
    if (newOwnerMemberData.leftAt) {
      throw new Error('Người dùng này đã rời khỏi nhóm');
    }

    // Use batch to ensure atomicity
    const batch = adminDb.batch();

    // Update group owner
    batch.update(groupRef, {
      ownerId: newOwnerId,
      updatedAt: new Date(),
    });

    // Update current owner role to member
    const currentOwnerMemberId = `${groupId}_${currentOwnerId}`;
    const currentOwnerMemberRef = adminDb.collection('groupMembers').doc(currentOwnerMemberId);
    batch.update(currentOwnerMemberRef, {
      role: 'member',
    });

    // Update new owner role to owner
    batch.update(newOwnerMemberRef, {
      role: 'owner',
    });

    await batch.commit();

    return { success: true, message: 'Chuyển quyền chủ nhóm thành công!' };
  } catch (error) {
    console.error('Error transferring group ownership:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi chuyển quyền chủ nhóm');
  }
}

// Get Group Requests
export async function getGroupRequests(groupId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    // Check if user is owner of the group
    const groupRef = adminDb.collection('groups').doc(groupId);
    const groupSnap = await groupRef.get();
    
    if (!groupSnap.exists) {
      throw new Error('Nhóm không tồn tại');
    }

    const groupData = groupSnap.data() as Group;
    if (groupData.ownerId !== userId) {
      throw new Error('Chỉ chủ nhóm mới có thể xem yêu cầu tham gia');
    }

    // Get all requests for this group
    const requestsQuery = adminDb.collection('groupRequests')
      .where('groupId', '==', groupId);

    const requestsSnapshot = await requestsQuery.get();
    
    const requests = requestsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as any;
    });

    // Sort by createdAt in descending order (newest first)
    requests.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    return requests;
  } catch (error) {
    console.error('Error getting group requests:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi lấy danh sách yêu cầu tham gia');
  }
}

// Search public groups
export async function searchPublicGroups(searchTerm: string): Promise<Group[]> {
  try {
    if (!adminDb) {
      throw new Error('Database not initialized');
    }

    if (!searchTerm.trim()) {
      return [];
    }

    const groupsRef = adminDb.collection('groups');
    const snapshot = await groupsRef
      .where('type', '==', 'public')
      .get();

    const groups: Group[] = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if group name or description contains search term
      const nameMatch = data.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = data.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (nameMatch || descMatch) {
        // Get actual member count
        const membersSnapshot = await adminDb.collection('groupMembers')
          .where('groupId', '==', doc.id)
          .get();
        
        // Filter out members who have left (handle both null and empty object cases)
        const activeMembers = membersSnapshot.docs.filter(doc => {
          const data = doc.data();
          return !data.leftAt || (typeof data.leftAt === 'object' && Object.keys(data.leftAt).length === 0);
        });
        
        const actualMemberCount = activeMembers.length;
        
        groups.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          slug: data.slug || '',
          type: data.type || 'public',
          ownerId: data.ownerId || '',
          memberCount: actualMemberCount,
          createdAt: toDate(data.createdAt),
          coverUrl: data.coverUrl || null,
        });
      }
    }

    // Sort by member count (most popular first)
    groups.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

    return groups;
  } catch (error) {
    console.error('Error searching public groups:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi tìm kiếm nhóm công khai');
  }
}
