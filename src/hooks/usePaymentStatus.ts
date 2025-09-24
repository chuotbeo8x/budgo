'use client';

import { useState, useEffect } from 'react';
import { updateMemberPaymentStatus, getTripPaymentStatus } from '@/lib/actions/trips';

// Global payment status state
let globalPaymentStatus: Record<string, boolean> = {};
let listeners: Set<(status: Record<string, boolean>) => void> = new Set();

export const usePaymentStatus = (tripId?: string, userId?: string) => {
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(globalPaymentStatus);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load payment status from database when tripId changes
  useEffect(() => {
    if (!tripId) return;
    
    const loadPaymentStatus = async () => {
      try {
        setLoading(true);
        const dbPaymentStatus = await getTripPaymentStatus(tripId);
        
        // Update global state with database data
        globalPaymentStatus = dbPaymentStatus;
        
        // Update local state
        setPaymentStatus(dbPaymentStatus);
        
        // Notify all listeners
        listeners.forEach(listener => listener(dbPaymentStatus));
      } catch (error) {
        console.error('Error loading payment status:', error);
        // Fallback to global state if database fails
        setPaymentStatus(globalPaymentStatus);
      } finally {
        setLoading(false);
      }
    };
    
    loadPaymentStatus();
  }, [tripId]);

  useEffect(() => {
    const listener = (newStatus: Record<string, boolean>) => {
      setPaymentStatus(newStatus);
    };
    
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updatePaymentStatus = async (memberId: string, status: boolean) => {
    if (!tripId || !userId) {
      console.error('Missing tripId or userId for payment status update');
      return;
    }

    try {
      setUpdating(true);
      
      // Update in database
      await updateMemberPaymentStatus(
        tripId, 
        memberId, 
        status ? 'paid' : 'unpaid', 
        userId
      );
      
      // Update global state
      globalPaymentStatus = {
        ...globalPaymentStatus,
        [memberId]: status
      };
      
      // Notify all listeners
      listeners.forEach(listener => listener(globalPaymentStatus));
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return {
    paymentStatus,
    updatePaymentStatus,
    updating,
    loading
  };
};
