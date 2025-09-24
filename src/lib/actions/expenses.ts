'use server';

import { adminDb } from '../firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { AddExpenseSchema, AddAdvanceSchema } from '../schemas';
import { Expense, Advance, TripMember } from '../types';
import { prepareFirestoreData } from '../utils/firestore';

// Add Expense
export async function addExpense(formData: FormData) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const userId = formData.get('userId') as string;
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Soft-lock guard: block disabled users
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() as any : null;
      if (userData && userData.disabled === true) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Tài khoản của bạn đã bị khóa')) {
        throw e;
      }
      // If user doc missing, proceed; do not block legitimate users
    }

    const tripId = formData.get('tripId') as string;
    if (!tripId) {
      throw new Error('Thiếu thông tin chuyến đi');
    }

    // Check if trip is closed
    const tripRef1 = adminDb.collection('trips').doc(tripId);
    const tripSnap1 = await tripRef1.get();
    if (!tripSnap1.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }
    const tripData1 = tripSnap1.data();
    if (tripData1?.status === 'closed') {
      throw new Error('Chuyến đi đã được chốt, không thể thêm chi phí');
    }

    // Get weightMap array from FormData
    const formWeightMap: { memberId: string; weight: number }[] = [];
    const weightMapData = formData.getAll('weightMap');
    weightMapData.forEach(weightEntry => {
      if (typeof weightEntry === 'string' && weightEntry.trim()) {
        try {
          const parsed = JSON.parse(weightEntry);
          if (parsed.memberId && parsed.weight !== undefined) {
            formWeightMap.push(parsed);
          }
        } catch (error) {
          console.error('Error parsing weightMap entry:', error);
        }
      }
    });

    // Get trip members for weight calculation
    const membersQuery = adminDb.collection('tripMembers')
      .where('tripId', '==', tripId)
      .where('leftAt', '==', null);
    const membersSnap = await membersQuery.get();
    const activeMembers = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TripMember));

    // Fetch user data for members
    const userIds = activeMembers
      .map(doc => doc.userId)
      .filter(userId => userId);

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
            username: userData.username
          });
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    const members = activeMembers.map(member => {
      let displayName = member.name;
      if (!displayName) {
        if (member.userId) {
          const userData = userDataMap.get(member.userId);
          displayName = userData?.name || 'Unknown User';
        } else if (member.ghostName) {
          displayName = member.ghostName;
        }
      }
      return {
        ...member,
        name: displayName
      };
    });

    // Create weightMap if splitMethod is 'weight'
    let finalWeightMap = formWeightMap;
    if (formData.get('splitMethod') === 'weight') {
      if (!finalWeightMap || finalWeightMap.length === 0) {
        // Create default weightMap with all members having weight 1
        finalWeightMap = members.map(member => ({
          memberId: member.id,
          weight: 1
        }));
      }
    } else {
      // For equal split, set weightMap to undefined
      finalWeightMap = undefined;
    }

    const data = {
      tripId: tripId,
      amount: parseFloat(formData.get('amount') as string),
      paidBy: formData.get('paidBy') as string,
      splitMethod: formData.get('splitMethod') as 'equal' | 'weight',
      category: formData.get('category') as string || undefined,
      description: formData.get('description') as string || undefined,
      weightMap: finalWeightMap,
      exclusions: undefined, // No longer using exclusions
    };

    // Validate input
    const validatedData = AddExpenseSchema.parse(data);

    // Check if trip exists
    const tripRef = adminDb.collection('trips').doc(validatedData.tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    // Check if paidBy member exists
    const memberRef = adminDb.collection('tripMembers').doc(validatedData.paidBy);
    const memberSnap = await memberRef.get();
    
    if (!memberSnap.exists) {
      throw new Error('Thành viên thanh toán không tồn tại');
    }

    // Get current members to track who was in the trip when expense was created
    const membersSnapshot = await adminDb.collection('tripMembers')
      .where('tripId', '==', validatedData.tripId)
      .where('leftAt', '==', null)
      .get();
    
    const memberIdsAtCreation = membersSnapshot.docs.map(doc => doc.id);

    // Generate expense ID
    const expenseId = `${validatedData.tripId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create expense
    // Get createdAt from form (just store as string)
    const createdAtFromForm = formData.get('createdAt') as string;
    const createdAt = createdAtFromForm || new Date().toISOString().split('T')[0];

    const expenseData = {
      id: expenseId,
      tripId: validatedData.tripId,
      amount: validatedData.amount,
      description: validatedData.description,
      paidBy: validatedData.paidBy,
      splitMethod: validatedData.splitMethod,
      category: validatedData.category,
      weightMap: validatedData.weightMap,
      exclusions: validatedData.exclusions,
      memberIdsAtCreation: memberIdsAtCreation,
      createdBy: userId,
      createdAt: createdAt,
    };

    await adminDb.collection('expenses').doc(expenseId).set(prepareFirestoreData(expenseData));

    return { success: true, expenseId };
  } catch (error) {
    console.error('Error adding expense:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi thêm chi phí');
  }
}

// Get Expenses
export async function getExpenses(tripId: string) {
  try {
    console.log('🚀 getExpenses called with tripId:', tripId);
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const expensesQuery = adminDb.collection('expenses')
      .where('tripId', '==', tripId);
    const expensesSnap = await expensesQuery.get();
    console.log('📋 Found expenses in DB:', expensesSnap.docs.length);
    
    const expenses = expensesSnap.docs.map(doc => {
      const data = doc.data();
      
      // Handle createdAt - if it's a string, use it directly; otherwise convert to Date
      let convertedCreatedAt;
      if (typeof data.createdAt === 'string') {
        // It's already a string (YYYY-MM-DD format), convert to Date for display
        convertedCreatedAt = new Date(data.createdAt + 'T00:00:00');
      } else if (data.createdAt?.toDate) {
        // Firestore Timestamp
        convertedCreatedAt = data.createdAt.toDate();
      } else if (typeof data.createdAt === 'number') {
        // Unix timestamp (Date.now())
        convertedCreatedAt = new Date(data.createdAt);
      } else if (data.createdAt instanceof Date) {
        // Already a Date object
        convertedCreatedAt = data.createdAt;
      } else if (typeof data.createdAt === 'object' && Object.keys(data.createdAt).length === 0) {
        // Empty object - use document creation time as fallback
        console.warn('🐛 Empty createdAt object detected for expense:', doc.id, 'using document creation time');
        convertedCreatedAt = doc.createTime ? doc.createTime.toDate() : new Date();
      } else {
        // Fallback to current date
        console.warn('🐛 Invalid createdAt format for expense:', doc.id, 'using current date');
        convertedCreatedAt = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: convertedCreatedAt,
      } as Expense;
    });

    // Sort by createdAt desc in JavaScript
    expenses.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });

    return expenses;
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin chi phí');
  }
}

// Update Expense
export async function updateExpense(expenseId: string, formData: FormData) {
  try {
    console.log('=== updateExpense START ===');
    console.log('expenseId:', expenseId);
    console.log('formData available:', !!formData);
    console.log('adminDb available:', !!adminDb);
    
    if (!formData) {
      throw new Error('FormData không được cung cấp');
    }
    
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const userId = formData.get('userId') as string;
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Soft-lock guard: block disabled users
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() as any : null;
      if (userData && userData.disabled === true) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Tài khoản của bạn đã bị khóa')) {
        throw e;
      }
    }

    const tripId = formData.get('tripId') as string;
    console.log('Trip ID from formData:', tripId);
    if (!tripId) {
      throw new Error('Trip ID không được cung cấp');
    }

    // Check if trip is closed
    const tripRef2 = adminDb.collection('trips').doc(tripId);
    const tripSnap2 = await tripRef2.get();
    if (!tripSnap2.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }
    const tripData2 = tripSnap2.data();
    if (tripData2?.status === 'closed') {
      throw new Error('Chuyến đi đã được chốt, không thể sửa chi phí');
    }

    // Check if expense exists and user has permission
    const expenseRef = adminDb.collection('expenses').doc(expenseId);
    const expenseSnap = await expenseRef.get();
    
    if (!expenseSnap.exists) {
      throw new Error('Chi phí không tồn tại');
    }

    const expenseData = expenseSnap.data() as Expense;
    if (expenseData.createdBy !== userId) {
      throw new Error('Chỉ người tạo mới có thể chỉnh sửa');
    }

    // Get weightMap array from FormData
    const formWeightMap: { memberId: string; weight: number }[] = [];
    const weightMapData = formData.getAll('weightMap');
    weightMapData.forEach(weightEntry => {
      if (typeof weightEntry === 'string' && weightEntry.trim()) {
        try {
          const parsed = JSON.parse(weightEntry);
          if (parsed.memberId && parsed.weight !== undefined) {
            formWeightMap.push(parsed);
          }
        } catch (error) {
          console.error('Error parsing weightMap entry:', error);
        }
      }
    });

    // Get trip members for weight calculation
    const membersQuery = adminDb.collection('tripMembers')
      .where('tripId', '==', tripId)
      .where('leftAt', '==', null);
    const membersSnap = await membersQuery.get();
    const activeMembers = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TripMember));

    // Fetch user data for members
    const userIds = activeMembers
      .map(doc => doc.userId)
      .filter(userId => userId);

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
            username: userData.username
          });
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    const members = activeMembers.map(member => {
      let displayName = member.name;
      if (!displayName) {
        if (member.userId) {
          const userData = userDataMap.get(member.userId);
          displayName = userData?.name || 'Unknown User';
        } else if (member.ghostName) {
          displayName = member.ghostName;
        }
      }
      return {
        ...member,
        name: displayName
      };
    });

    // Create weightMap if splitMethod is 'weight'
    let finalWeightMap = formWeightMap;
    if (formData.get('splitMethod') === 'weight') {
      if (!finalWeightMap || finalWeightMap.length === 0) {
        // Create default weightMap with all members having weight 1
        finalWeightMap = members.map(member => ({
          memberId: member.id,
          weight: 1
        }));
      }
    } else {
      // For equal split, set weightMap to undefined
      finalWeightMap = undefined;
    }

    const data = {
      tripId: tripId,
      amount: parseFloat(formData.get('amount') as string),
      paidBy: formData.get('paidBy') as string,
      splitMethod: formData.get('splitMethod') as 'equal' | 'weight',
      category: formData.get('category') as string || undefined,
      description: formData.get('description') as string || undefined,
      weightMap: finalWeightMap,
      exclusions: undefined, // No longer using exclusions
    };

    // Validate input
    const validatedData = AddExpenseSchema.parse(data);

    // Update expense
    // Get createdAt from form (just store as string)
    const createdAtFromForm = formData.get('createdAt') as string;
    const createdAt = createdAtFromForm || expenseData.createdAt;

    const updateData = {
      ...expenseData,
      amount: validatedData.amount,
      description: validatedData.description,
      paidBy: validatedData.paidBy,
      splitMethod: validatedData.splitMethod,
      category: validatedData.category,
      weightMap: validatedData.weightMap,
      exclusions: validatedData.exclusions,
      createdAt: createdAt,
      updatedAt: new Date(),
    };

    console.log('Updating expense with data:', updateData);
    await adminDb.collection('expenses').doc(expenseId).update(prepareFirestoreData(updateData));
    console.log('Expense updated successfully');

    return { success: true };
  } catch (error) {
    console.error('Error updating expense:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật chi phí');
  }
}

// Delete Expense
export async function deleteExpense(expenseId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    // Soft-lock guard: block disabled users
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() as any : null;
      if (userData && userData.disabled === true) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Tài khoản của bạn đã bị khóa')) {
        throw e;
      }
    }

    // Check if expense exists and user has permission
    const expenseRef = adminDb.collection('expenses').doc(expenseId);
    const expenseSnap = await expenseRef.get();
    
    if (!expenseSnap.exists) {
      throw new Error('Chi phí không tồn tại');
    }

    const expenseData = expenseSnap.data() as Expense;
    if (expenseData.createdBy !== userId) {
      throw new Error('Chỉ người tạo mới có thể xóa');
    }

    await adminDb.collection('expenses').doc(expenseId).delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa chi phí');
  }
}

// Add Advance
export async function addAdvance(formData: FormData) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const userId = formData.get('userId') as string;
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Soft-lock guard: block disabled users
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() as any : null;
      if (userData && userData.disabled === true) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Tài khoản của bạn đã bị khóa')) {
        throw e;
      }
    }

    const tripId = formData.get('tripId') as string;
    if (!tripId) {
      throw new Error('Trip ID không được để trống');
    }

    // Check if trip is closed
    const tripRef3 = adminDb.collection('trips').doc(tripId);
    const tripSnap3 = await tripRef3.get();
    if (!tripSnap3.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }
    const tripData3 = tripSnap3.data();
    if (tripData3?.status === 'closed') {
      throw new Error('Chuyến đi đã được chốt, không thể thêm tạm ứng');
    }

    const paidBy = formData.get('paidBy') as string;
    if (!paidBy) {
      throw new Error('Phải chọn người ứng');
    }

    const paidTo = formData.get('paidTo') as string;
    if (!paidTo) {
      throw new Error('Phải chọn người nhận');
    }

    const data = {
      tripId: tripId,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string || undefined,
      paidBy: paidBy,
      paidTo: paidTo,
    };

    // Validate input
    const validatedData = AddAdvanceSchema.parse(data);

    // Check if trip exists
    const tripRef = adminDb.collection('trips').doc(validatedData.tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    // Check if paidBy member exists in tripMembers
    const paidByMemberRef = adminDb.collection('tripMembers').doc(validatedData.paidBy);
    const paidByMemberSnap = await paidByMemberRef.get();
    
    if (!paidByMemberSnap.exists) {
      throw new Error('Người ứng không tồn tại');
    }

    // For paidTo, we need to check if it's the trip owner or a trip member
    // First check if it's the trip owner
    const tripData = tripSnap.data();
    if (validatedData.paidTo === tripData.ownerId) {
      // It's the trip owner, that's valid
    } else {
      // Check if it's a trip member
      const paidToMemberRef = adminDb.collection('tripMembers').doc(validatedData.paidTo);
      const paidToMemberSnap = await paidToMemberRef.get();
      
      if (!paidToMemberSnap.exists) {
        throw new Error('Người nhận không tồn tại');
      }
    }

    // Generate advance ID
    const advanceId = `${validatedData.tripId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Get createdAt from form (just store as string)
    const createdAtFromForm = formData.get('createdAt') as string;
    const createdAt = createdAtFromForm || new Date().toISOString().split('T')[0];

    // Create advance
    const advanceData = {
      id: advanceId,
      tripId: validatedData.tripId,
      amount: validatedData.amount,
      description: validatedData.description,
      paidBy: validatedData.paidBy,
      paidTo: validatedData.paidTo,
      createdBy: userId,
      createdAt: createdAt,
    };

    await adminDb.collection('advances').doc(advanceId).set(prepareFirestoreData(advanceData));

    return { success: true, advanceId };
  } catch (error) {
    console.error('Error adding advance:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi thêm tạm ứng');
  }
}

// Get Advances
export async function getAdvances(tripId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const advancesQuery = adminDb.collection('advances')
      .where('tripId', '==', tripId);
    const advancesSnap = await advancesQuery.get();
    
    const advances = advancesSnap.docs.map(doc => {
      const data = doc.data();
      
      // Handle createdAt - if it's a string, use it directly; otherwise convert to Date
      let convertedCreatedAt;
      if (typeof data.createdAt === 'string') {
        // It's already a string (YYYY-MM-DD format), convert to Date for display
        convertedCreatedAt = new Date(data.createdAt + 'T00:00:00');
      } else if (data.createdAt?.toDate) {
        // Firestore Timestamp
        convertedCreatedAt = data.createdAt.toDate();
      } else if (typeof data.createdAt === 'number') {
        // Unix timestamp (Date.now())
        convertedCreatedAt = new Date(data.createdAt);
      } else if (data.createdAt instanceof Date) {
        // Already a Date object
        convertedCreatedAt = data.createdAt;
      } else if (typeof data.createdAt === 'object' && Object.keys(data.createdAt).length === 0) {
        // Empty object - use document creation time as fallback
        console.warn('🐛 Empty createdAt object detected for advance:', doc.id, 'using document creation time');
        convertedCreatedAt = doc.createTime ? doc.createTime.toDate() : new Date();
      } else {
        // Fallback to current date
        console.warn('🐛 Invalid createdAt format for advance:', doc.id, 'using current date');
        convertedCreatedAt = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: convertedCreatedAt,
      } as Advance;
    });

    // Sort by createdAt desc in JavaScript
    advances.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });

    return advances;
  } catch (error) {
    console.error('Error getting advances:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin tạm ứng');
  }
}

// Update Advance
export async function updateAdvance(advanceId: string, formData: FormData) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const userId = formData.get('userId') as string;
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Soft-lock guard: block disabled users
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() as any : null;
      if (userData && userData.disabled === true) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Tài khoản của bạn đã bị khóa')) {
        throw e;
      }
    }

    const tripId = formData.get('tripId') as string;
    if (!tripId) {
      throw new Error('Trip ID không được để trống');
    }

    // Check if advance exists and user has permission
    const advanceRef = adminDb.collection('advances').doc(advanceId);
    const advanceSnap = await advanceRef.get();
    
    if (!advanceSnap.exists) {
      throw new Error('Tạm ứng không tồn tại');
    }

    const advanceData = advanceSnap.data() as Advance;
    
    // Check if user is trip owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data();
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể chỉnh sửa tạm ứng');
    }

    const data = {
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string || undefined,
      paidBy: formData.get('paidBy') as string,
      paidTo: formData.get('paidTo') as string,
    };

    // Validate input
    const validatedData = AddAdvanceSchema.parse(data);

    // Get createdAt from form (just store as string)
    const createdAtFromForm = formData.get('createdAt') as string;
    const createdAt = createdAtFromForm || advanceData.createdAt;

    // Update advance
    const updateData = {
      ...validatedData,
      createdAt: createdAt,
      updatedAt: new Date(),
      updatedBy: userId,
    };

    // Clean data before saving to Firestore
    const cleanedUpdateData = prepareFirestoreData(updateData);
    await advanceRef.update(cleanedUpdateData);

    return { success: true, message: 'Cập nhật tạm ứng thành công!' };
  } catch (error) {
    console.error('Error updating advance:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật tạm ứng');
  }
}

// Delete Advance
export async function deleteAdvance(advanceId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Soft-lock guard: block disabled users
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() as any : null;
      if (userData && userData.disabled === true) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Tài khoản của bạn đã bị khóa')) {
        throw e;
      }
    }

    // Check if advance exists
    const advanceRef = adminDb.collection('advances').doc(advanceId);
    const advanceSnap = await advanceRef.get();
    
    if (!advanceSnap.exists) {
      throw new Error('Tạm ứng không tồn tại');
    }

    const advanceData = advanceSnap.data() as Advance;
    
    // Check if user is trip owner
    const tripRef = adminDb.collection('trips').doc(advanceData.tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data();
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể xóa tạm ứng');
    }

    // Delete advance
    await advanceRef.delete();

    return { success: true, message: 'Xóa tạm ứng thành công!' };
  } catch (error) {
    console.error('Error deleting advance:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa tạm ứng');
  }
}
