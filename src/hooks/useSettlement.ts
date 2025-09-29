import { useMemo } from 'react';
import { Expense, Advance, TripMember } from '@/lib/types';

interface Settlement {
  memberId: string;
  memberName: string;
  totalExpenses: number;
  totalAdvances: number;
  balance: number;
}

export const useSettlement = (expenses: Expense[], advances: Advance[], members: TripMember[]) => {
  const settlements = useMemo(() => {
    const settlementMap = new Map<string, Settlement>();
    
    // Safety check for undefined/null arrays
    if (!members || !Array.isArray(members)) {
      return [];
    }
    
    // Initialize settlements for all members
    members.forEach(member => {
      settlementMap.set(member.id, {
        memberId: member.id,
        memberName: member.name || 'Unknown',
        totalExpenses: 0,
        totalAdvances: 0,
        balance: 0
      });
    });

    // Calculate expenses for each member
    if (expenses && Array.isArray(expenses)) {
      expenses.forEach(expense => {
      // Only split among members who were in the trip when expense was created
      const eligibleMembers = members.filter(member => {
        // If memberIdsAtCreation is not set or empty (legacy expenses), include all members
        if (!expense.memberIdsAtCreation || expense.memberIdsAtCreation.length === 0) {
          return true;
        }
        // Only include members who were in the trip when expense was created
        return expense.memberIdsAtCreation.includes(member.id);
      });

      if (expense.splitMethod === 'equal') {
        const amountPerPerson = expense.amount / eligibleMembers.length;
        
        // Add money to the person who paid (paidBy)
        const paidBySettlement = settlementMap.get(expense.paidBy);
        if (paidBySettlement) {
          paidBySettlement.totalAdvances += expense.amount; // They should receive the full amount back
        }
        
        // Subtract money from all eligible members (including the payer)
        eligibleMembers.forEach(member => {
          const settlement = settlementMap.get(member.id);
          if (settlement) {
            settlement.totalExpenses += amountPerPerson;
          }
        });
      } else if (expense.splitMethod === 'weight' && expense.weightMap) {
        // Filter weightMap to only include eligible members
        const eligibleWeightMap = expense.weightMap.filter(weightEntry => 
          eligibleMembers.some(member => member.id === weightEntry.memberId)
        );
        
        const totalWeight = eligibleWeightMap.reduce((sum, entry) => sum + entry.weight, 0);
        if (totalWeight > 0) {
          // Add money to the person who paid (paidBy)
          const paidBySettlement = settlementMap.get(expense.paidBy);
          if (paidBySettlement) {
            paidBySettlement.totalAdvances += expense.amount; // They should receive the full amount back
          }
          
          // Subtract money from all eligible members based on their weight
          eligibleWeightMap.forEach(weightEntry => {
            const settlement = settlementMap.get(weightEntry.memberId);
            if (settlement) {
              const memberAmount = (expense.amount * weightEntry.weight) / totalWeight;
              settlement.totalExpenses += memberAmount;
            }
          });
        }
      }
      });
    }

    // Calculate advances for each member
    if (advances && Array.isArray(advances)) {
      advances.forEach(advance => {
      // Person who paid the advance (paidBy) should receive money back
      const paidBySettlement = settlementMap.get(advance.paidBy);
      if (paidBySettlement) {
        paidBySettlement.totalAdvances += advance.amount;
      }
      
      // Person who received the advance (paidTo) should pay money back
      const paidToSettlement = settlementMap.get(advance.paidTo);
      if (paidToSettlement) {
        paidToSettlement.totalAdvances -= advance.amount;
      }
      });
    }

    // Calculate final balance
    settlementMap.forEach(settlement => {
      settlement.balance = settlement.totalAdvances - settlement.totalExpenses;
    });

    return Array.from(settlementMap.values());
  }, [expenses, advances, members]);

  const totalExpense = useMemo(() => 
    expenses && Array.isArray(expenses) ? expenses.reduce((sum, expense) => sum + expense.amount, 0) : 0, 
    [expenses]
  );

  const totalAdvance = useMemo(() => 
    advances && Array.isArray(advances) ? advances.reduce((sum, advance) => sum + advance.amount, 0) : 0, 
    [advances]
  );

  const debtors = useMemo(() => 
    settlements && Array.isArray(settlements) ? settlements.filter(s => s.balance < -0.01) : [], 
    [settlements]
  );

  const creditors = useMemo(() => 
    settlements && Array.isArray(settlements) ? settlements.filter(s => s.balance > 0.01) : [], 
    [settlements]
  );

  return {
    settlements,
    totalExpense,
    totalAdvance,
    debtors,
    creditors
  };
};
