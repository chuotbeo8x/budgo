'use client';

import { useState, useEffect } from 'react';
import { updateMemberPaymentStatus, getTripPaymentStatus } from '@/lib/actions/trips';

export const usePaymentStatus = (tripId?: string, userId?: string) => {
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load payment status from database
  const loadPaymentStatus = async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      // console.log('🔄 usePaymentStatus.loadPaymentStatus START - tripId:', tripId);
      const dbPaymentStatus = await getTripPaymentStatus(tripId);
      // console.log('🔄 usePaymentStatus.loadPaymentStatus - loaded from DB:', dbPaymentStatus);
      setPaymentStatus(dbPaymentStatus);
      // console.log('🔄 usePaymentStatus.loadPaymentStatus END');
    } catch (error) {
      console.error('Error loading payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentStatus();
  }, [tripId]);

  // Auto-refresh when tab gains focus (reflect changes from manage page)
  useEffect(() => {
    const onFocus = () => loadPaymentStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [tripId]);

  // TEMPORARILY DISABLED POLLING FOR DEBUGGING - might cause modal conflicts
  // Lightweight polling to ensure view stays fresh even without focus change
  // useEffect(() => {
  //   if (!tripId) return;
  //   const id = window.setInterval(() => {
  //     loadPaymentStatus();
  //   }, 5000);
  //   return () => window.clearInterval(id);
  // }, [tripId]);

  const updatePaymentStatus = async (memberId: string, status: boolean) => {
    if (!tripId || !userId) {
      console.error('Missing tripId or userId for payment status update');
      return;
    }

    try {
      setUpdating(true);
      // console.log('=== usePaymentStatus.updatePaymentStatus START ===');
      // console.log('Updating payment status:', { memberId, status, tripId, userId });

      // Update in database
      await updateMemberPaymentStatus(
        tripId,
        memberId,
        status ? 'paid' : 'unpaid',
        userId
      );

      // console.log('Database updated successfully');

      // TEMPORARILY DISABLED OPTIMISTIC UPDATES FOR DEBUGGING - might cause modal conflicts
      // Optimistically update local state so UI reflects immediately
      // setPaymentStatus(prev => {
      //   const newStatus = {
      //     ...prev,
      //     [memberId]: status,
      //   };
      //   console.log('Updated payment status state:', newStatus);
      //   return newStatus;
      // });
      
      // Reload payment status from database instead
      // console.log('Reloading payment status from database...');
      await loadPaymentStatus();
      // console.log('=== usePaymentStatus.updatePaymentStatus END ===');

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
    loadPaymentStatus,
    updating,
    loading
  };
};