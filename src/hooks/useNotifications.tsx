import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Set up real-time subscription for notification changes
    const channel = supabase
      .channel('notifications-badge-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          console.log('Badge: Real-time notification update:', payload);
          // Always refetch count when any notification changes
          await fetchUnreadCount();
        }
      )
      .subscribe((status) => {
        console.log('Badge subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Badge: No user, setting count to 0');
        setUnreadCount(0);
        return;
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Badge: Error fetching unread count:', error);
        setUnreadCount(0);
        return;
      }

      const newCount = count || 0;
      console.log('Badge: Fetched unread count:', newCount);
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Badge: Error in fetchUnreadCount:', error);
      setUnreadCount(0);
    }
  };

  return { unreadCount, refetchUnreadCount: fetchUnreadCount };
};