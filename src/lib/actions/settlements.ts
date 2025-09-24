'use server';

import { adminDb } from '../firebase-admin';
import { Expense, Advance, TripMember, SettlementSummary } from '../types';
import { prepareFirestoreData } from '../utils/firestore';

// Compute Settlement
export async function computeSettlement(tripId: string, userId: string) {
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

    const tripData = tripSnap.data();
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể tính toán');
    }

    // Get all expenses and advances
    const [expensesSnapshot, advancesSnapshot, membersSnapshot] = await Promise.all([
      adminDb.collection('expenses').where('tripId', '==', tripId).get(),
      adminDb.collection('advances').where('tripId', '==', tripId).get(),
      adminDb.collection('tripMembers').where('tripId', '==', tripId).get(),
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

    // Calculate settlement
    const settlement = await calculateSettlement(expenses, advances, members);

    // Save settlement to database
    const settlementId = `${tripId}_${Date.now()}`;
    const settlementData: Omit<SettlementSummary, 'id'> = {
      tripId,
      computedAt: new Date(),
      computedBy: userId,
      totalExpense: settlement.totalExpense,
      totalAdvance: settlement.totalAdvance,
      netBalance: settlement.netBalance,
      memberBalances: settlement.memberBalances,
      transactions: settlement.transactions,
    };

    const cleanedSettlementData = prepareFirestoreData(settlementData);
    await adminDb.collection('settlements').doc(settlementId).set(cleanedSettlementData);

    return { success: true, settlementId, settlement };
  } catch (error) {
    console.error('Error computing settlement:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi tính toán');
  }
}

// Get Trip Settlement
export async function getTripSettlement(tripId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const settlementQuery = adminDb.collection('settlements')
      .where('tripId', '==', tripId);

    const settlementSnapshot = await settlementQuery.get();
    
    if (settlementSnapshot.empty) {
      return null;
    }

    // Sort by computedAt in code and get the latest
    const settlements = settlementSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const aTime = a.computedAt?.toDate ? a.computedAt.toDate().getTime() : new Date(a.computedAt).getTime();
      const bTime = b.computedAt?.toDate ? b.computedAt.toDate().getTime() : new Date(b.computedAt).getTime();
      return bTime - aTime; // descending order (newest first)
    });

    const settlementDoc = settlements[0];
    
    // Convert Firestore Timestamps to Date if needed
    const processedSettlementData = {
      ...settlementDoc,
      computedAt: settlementDoc.computedAt?.toDate ? settlementDoc.computedAt.toDate() : settlementDoc.computedAt,
    };
    
    return processedSettlementData as SettlementSummary;
  } catch (error) {
    console.error('Error getting trip settlement:', error);
    throw new Error('Có lỗi xảy ra khi lấy thông tin tính toán');
  }
}

// Calculate Settlement Logic
async function calculateSettlement(expenses: Expense[], advances: Advance[], members: TripMember[]) {
  const memberBalances: { [memberId: string]: number } = {};
  const memberNames: { [memberId: string]: string } = {};
  
  // Initialize member balances and names
  members.forEach(member => {
    memberBalances[member.id] = 0;
    memberNames[member.id] = member.name;
  });

  // Process advances (positive balance)
  advances.forEach(advance => {
    if (memberBalances.hasOwnProperty(advance.memberId)) {
      memberBalances[advance.memberId] += advance.amount;
    }
  });

  // Process expenses (negative balance)
  for (const expense of expenses) {
    const splitAmounts = await calculateExpenseSplit(expense, members);
    
    // Add to paid by member (positive)
    if (memberBalances.hasOwnProperty(expense.paidBy)) {
      memberBalances[expense.paidBy] += expense.amount;
    }
    
    // Subtract from all members who should pay (negative)
    Object.entries(splitAmounts).forEach(([memberId, amount]) => {
      if (memberBalances.hasOwnProperty(memberId)) {
        memberBalances[memberId] -= amount;
      }
    });
  }

  // Calculate totals
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdvance = advances.reduce((sum, advance) => sum + advance.amount, 0);
  const netBalance = totalAdvance - totalExpense;

  // Generate transactions to balance accounts
  const transactions = generateTransactions(memberBalances, memberNames);

  return {
    totalExpense,
    totalAdvance,
    netBalance,
    memberBalances,
    transactions,
  };
}

// Calculate how much each member should pay for an expense
export async function calculateExpenseSplit(expense: Expense, members: TripMember[]): Promise<{ [memberId: string]: number }> {
  const splitAmounts: { [memberId: string]: number } = {};
  
  // Only split among members who were in the trip when expense was created
  const eligibleMembers = members.filter(member => {
    // If memberIdsAtCreation is not set (legacy expenses), include all members
    if (!expense.memberIdsAtCreation) {
      return true;
    }
    // Only include members who were in the trip when expense was created
    return expense.memberIdsAtCreation.includes(member.id);
  });
  
  // Get active members (those with weight > 0) from eligible members
  const activeMembers = eligibleMembers.filter(member => {
    if (expense.splitMethod === 'weight' && expense.weightMap) {
      const weightEntry = expense.weightMap.find(w => w.memberId === member.id);
      return (weightEntry?.weight || 1) > 0;
    }
    return true; // For equal split, all eligible members are active
  });

  if (expense.splitMethod === 'equal') {
    // Equal split among eligible members
    const amountPerMember = expense.amount / activeMembers.length;
    activeMembers.forEach(member => {
      splitAmounts[member.id] = amountPerMember;
    });
  } else if (expense.splitMethod === 'weight') {
    // Weighted split among eligible members
    const totalWeight = activeMembers.reduce((sum, member) => {
      const weightEntry = expense.weightMap?.find(w => w.memberId === member.id);
      return sum + (weightEntry?.weight || member.weight || 1);
    }, 0);
    
    activeMembers.forEach(member => {
      const weightEntry = expense.weightMap?.find(w => w.memberId === member.id);
      const weight = weightEntry?.weight || member.weight || 1;
      splitAmounts[member.id] = (expense.amount * weight) / totalWeight;
    });
  }

  return splitAmounts;
}

// Generate transactions to balance accounts
function generateTransactions(
  memberBalances: { [memberId: string]: number },
  memberNames: { [memberId: string]: string }
) {
  const transactions: Array<{
    from: string;
    to: string;
    amount: number;
    fromName: string;
    toName: string;
  }> = [];

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors: Array<{ id: string; balance: number; name: string }> = [];
  const debtors: Array<{ id: string; balance: number; name: string }> = [];

  Object.entries(memberBalances).forEach(([memberId, balance]) => {
    if (balance > 0) {
      creditors.push({ id: memberId, balance, name: memberNames[memberId] });
    } else if (balance < 0) {
      debtors.push({ id: memberId, balance: Math.abs(balance), name: memberNames[memberId] });
    }
  });

  // Sort by balance (highest first)
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  // Generate transactions
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.balance, debtor.balance);

    if (amount > 0.01) { // Only create transactions for amounts > 1 cent
      transactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        fromName: debtor.name,
        toName: creditor.name,
      });

      creditor.balance -= amount;
      debtor.balance -= amount;
    }

    if (creditor.balance <= 0.01) creditorIndex++;
    if (debtor.balance <= 0.01) debtorIndex++;
  }

  return transactions;
}

// Create Settlement Transactions
export async function createSettlementTransactions(tripId: string, userId: string) {
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

    const tripData = tripSnap.data();
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể tạo giao dịch');
    }

    // Get latest settlement
    const settlement = await getTripSettlement(tripId);
    if (!settlement) {
      throw new Error('Chưa có tính toán quyết toán');
    }

    // Create individual transaction documents
    const transactionPromises = settlement.transactions.map(async (transaction) => {
      const transactionId = `${tripId}_${transaction.from}_${transaction.to}_${Date.now()}`;
      const transactionData = {
        tripId,
        fromMemberId: transaction.from,
        toMemberId: transaction.to,
        amount: transaction.amount,
        currency: tripData.currency,
        status: 'pending' as const,
        createdAt: new Date(),
        computedAt: settlement.computedAt,
        rounded: false,
      };

      const cleanedTransactionData = prepareFirestoreData(transactionData);
      await adminDb.collection('settlementTransactions').doc(transactionId).set(cleanedTransactionData);
      return transactionId;
    });

    const transactionIds = await Promise.all(transactionPromises);

    return { success: true, transactionIds };
  } catch (error) {
    console.error('Error creating settlement transactions:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi tạo giao dịch');
  }
}

// Get Settlement Transactions
export async function getSettlementTransactions(tripId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const transactionsQuery = adminDb.collection('settlementTransactions')
      .where('tripId', '==', tripId);

    const transactionsSnapshot = await transactionsQuery.get();
    
    const transactions = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to Date if needed
      const processedData = {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
        computedAt: data.computedAt?.toDate ? data.computedAt.toDate() : data.computedAt,
      };
      
      return {
        id: doc.id,
        ...processedData
      };
    });

    return transactions;
  } catch (error) {
    console.error('Error getting settlement transactions:', error);
    throw new Error('Có lỗi xảy ra khi lấy danh sách giao dịch');
  }
}

// Update Settlement Transaction Status
export async function updateSettlementTransactionStatus(
  transactionId: string, 
  status: 'pending' | 'completed', 
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

    const transactionRef = adminDb.collection('settlementTransactions').doc(transactionId);
    const transactionSnap = await transactionRef.get();
    
    if (!transactionSnap.exists) {
      throw new Error('Giao dịch không tồn tại');
    }

    const updateData: any = {
      status,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const cleanedUpdateData = prepareFirestoreData(updateData);
    await transactionRef.update(cleanedUpdateData);

    return { success: true, message: 'Cập nhật trạng thái thành công!' };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi cập nhật trạng thái');
  }
}
