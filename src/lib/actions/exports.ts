'use server';

import { adminDb } from '../firebase-admin';
import { Expense, Advance, TripMember } from '../types';

// Export Trip Data to CSV
export async function exportTripData(tripId: string, userId: string, format: 'csv' | 'json' = 'csv') {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if trip exists and user has access
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data();
    
    // Check if user is trip owner or member
    const memberQuery = adminDb.collection('tripMembers')
      .where('tripId', '==', tripId)
      .where('userId', '==', userId)
      .where('leftAt', '==', null);
    
    const memberSnapshot = await memberQuery.get();
    const isOwner = tripData?.ownerId === userId;
    const isMember = memberSnapshot.docs.length > 0;

    if (!isOwner && !isMember) {
      throw new Error('Bạn không có quyền truy cập chuyến đi này');
    }

    // Get all data
    const [expensesSnapshot, advancesSnapshot, membersSnapshot, settlementSnapshot] = await Promise.all([
      adminDb.collection('expenses').where('tripId', '==', tripId).get(),
      adminDb.collection('advances').where('tripId', '==', tripId).get(),
      adminDb.collection('tripMembers').where('tripId', '==', tripId).get(),
      adminDb.collection('settlements').where('tripId', '==', tripId).get(),
    ]);

    const expenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[];

    const advances = advancesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Advance[];

    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TripMember[];

    const settlements = settlementSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Get latest settlement
    const latestSettlement = settlements.sort((a, b) => {
      const aTime = a.computedAt instanceof Date ? a.computedAt.getTime() : new Date(a.computedAt).getTime();
      const bTime = b.computedAt instanceof Date ? b.computedAt.getTime() : new Date(b.computedAt).getTime();
      return bTime - aTime;
    })[0];

    if (format === 'csv') {
      return generateCSV(tripData, expenses, advances, members, latestSettlement);
    } else {
      return generateJSON(tripData, expenses, advances, members, latestSettlement);
    }
  } catch (error) {
    console.error('Error exporting trip data:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xuất dữ liệu');
  }
}

// Generate CSV data
function generateCSV(trip: any, expenses: Expense[], advances: Advance[], members: TripMember[], settlement: any | undefined) {
  const lines: string[] = [];
  
  // Trip info
  lines.push('=== THÔNG TIN CHUYẾN ĐI ===');
  lines.push(`Tên chuyến đi,${trip.name}`);
  lines.push(`Mô tả,${trip.description || ''}`);
  lines.push(`Đơn vị tiền tệ,${trip.currency}`);
  lines.push(`Địa điểm,${trip.destination || ''}`);
  lines.push(`Ngày bắt đầu,${trip.startDate ? new Date(trip.startDate).toLocaleDateString('vi-VN') : ''}`);
  lines.push(`Ngày kết thúc,${trip.endDate ? new Date(trip.endDate).toLocaleDateString('vi-VN') : ''}`);
  lines.push(`Trạng thái,${trip.status === 'active' ? 'Hoạt động' : 'Đã đóng'}`);
  lines.push(`Ngày tạo,${new Date(trip.createdAt).toLocaleDateString('vi-VN')}`);
  lines.push('');

  // Members
  lines.push('=== THÀNH VIÊN ===');
  lines.push('Tên,Loại,Vai trò,Ngày tham gia');
  members.forEach(member => {
    const typeText = (member as any).type === 'user' ? 'Người dùng' :
                     (member as any).type === 'group' ? 'Nhóm' : 'Thành viên ảo';
    const roleText = member.role === 'creator' ? 'Chủ chuyến đi' : 'Thành viên';
    lines.push(`${member.name || 'Unknown'},${typeText},${roleText},${new Date(member.joinedAt).toLocaleDateString('vi-VN')}`);
  });
  lines.push('');

  // Expenses
  lines.push('=== CHI PHÍ ===');
  lines.push('Tên,Số tiền,Đơn vị,Người thanh toán,Cách chia,Danh mục,Mô tả,Ngày tạo');
  expenses.forEach(expense => {
    const paidByMember = members.find(m => m.id === expense.paidBy);
    const splitTypeText = expense.splitMethod === 'equal' ? 'Chia đều' : 'Theo trọng số';
    lines.push(`${paidByMember?.name || 'N/A'},${expense.amount},,${splitTypeText},${expense.category || ''},${expense.description || ''},${new Date(expense.createdAt).toLocaleDateString('vi-VN')}`);
  });
  lines.push('');

  // Advances
  lines.push('=== TẠM ỨNG ===');
  lines.push('Thành viên,Số tiền,Đơn vị,Mô tả,Ngày tạo');
  advances.forEach(advance => {
    const member = members.find(m => m.id === advance.paidTo);
    lines.push(`${member?.name || 'N/A'},${advance.amount},,${advance.description || ''},${new Date(advance.createdAt).toLocaleDateString('vi-VN')}`);
  });
  lines.push('');

  // Settlement
  if (settlement) {
    lines.push('=== QUYẾT TOÁN ===');
    lines.push(`Ngày tính toán,${new Date(settlement.computedAt).toLocaleDateString('vi-VN')}`);
    lines.push(`Tổng tạm ứng,${settlement.totalAdvance}`);
    lines.push(`Tổng chi phí,${settlement.totalExpense}`);
    lines.push(`Số dư,${settlement.netBalance}`);
    lines.push('');

    // Member balances
    lines.push('=== SỐ DƯ THÀNH VIÊN ===');
    lines.push('Thành viên,Số dư,Trạng thái');
    Object.entries(settlement.memberBalances).forEach(([memberId, balance]) => {
      const member = members.find(m => m.id === memberId);
      const status = (balance as number) > 0 ? 'Được hoàn' : (balance as number) < 0 ? 'Cần trả' : 'Cân bằng';
      lines.push(`${member?.name || 'N/A'},${balance},${status}`);
    });
    lines.push('');

    // Transactions
    if (settlement.transactions.length > 0) {
      lines.push('=== ĐỀ XUẤT HOÀN TRẢ ===');
      lines.push('Từ,Đến,Số tiền');
      settlement.transactions.forEach((transaction: any) => {
        lines.push(`${transaction.fromName},${transaction.toName},${transaction.amount}`);
      });
    }
  }

  return lines.join('\n');
}

// Generate JSON data
function generateJSON(trip: any, expenses: Expense[], advances: Advance[], members: TripMember[], settlement: any | undefined) {
  return {
    trip: {
      ...trip,
      createdAt: trip.createdAt?.toDate ? trip.createdAt.toDate() : trip.createdAt,
      startDate: trip.startDate?.toDate ? trip.startDate.toDate() : trip.startDate,
      endDate: trip.endDate?.toDate ? trip.endDate.toDate() : trip.endDate,
    },
    members: members.map(member => ({
      ...member,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
    })),
    expenses: expenses.map(expense => ({
      ...expense,
      createdAt: expense.createdAt,
    })),
    advances: advances.map(advance => ({
      ...advance,
      createdAt: advance.createdAt,
    })),
    settlement: settlement ? {
      ...settlement,
      computedAt: settlement.computedAt,
    } : null,
    exportedAt: new Date().toISOString(),
  };
}


