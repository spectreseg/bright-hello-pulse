import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, ArrowLeft, MapPin, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import dummyPizzaImage from '@/assets/dummy-pizza.jpg';
import dummySaladImage from '@/assets/dummy-salad.jpg';
import dummyFruitImage from '@/assets/dummy-fruit.jpg';
import dummySandwichesImage from '@/assets/dummy-sandwiches.jpg';
import dummyBagelsImage from '@/assets/dummy-bagels.jpg';
import dummyPastaImage from '@/assets/dummy-pasta.jpg';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  food_post_id: string | null;
  read: boolean;
  created_at: string;
  food_post?: {
    title: string;
    image_url: string | null;
    location: string;
    expires_at: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Map dummy post IDs to images
  const dummyPostImages: Record<string, string> = {
    'dummy-1': dummyPizzaImage,
    'dummy-2': dummySaladImage,
    'dummy-3': dummyFruitImage,
    'dummy-4': dummySandwichesImage,
    'dummy-5': dummyBagelsImage,
    'dummy-6': dummyPastaImage,
  };


  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-page-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          console.log('Notifications page: Real-time event:', payload);
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;

          // Handle INSERT events (new notifications)
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as any;
            if (newNotification.user_id === user.id) {
              console.log('New notification for current user, refetching...');
              await fetchNotifications(); // Refetch to get complete data with joins
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
          }
          
          // Handle UPDATE events (marking as read)
          if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as any;
            if (updatedNotification.user_id === user.id) {
              console.log('Notification updated, refreshing list...');
              await fetchNotifications();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Notifications page subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to notifications changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to notifications channel');
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Subscription timed out, attempting to reconnect...');
          // Attempt to resubscribe after a delay
          setTimeout(() => {
            fetchNotifications();
          }, 2000);
        }
      });

    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Fetch notifications with food post data and profiles
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          food_posts!food_post_id (
            title,
            image_url,
            location,
            expires_at,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        return;
      }

      // Get profile information for post authors
      const postUserIds = (data || [])
        .map(notif => notif.food_posts?.user_id)
        .filter(Boolean);

      let profiles = {};
      if (postUserIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', postUserIds);
        
        profiles = (profileData || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
      }
      // Transform the data to match our interface
      const transformedData = (data || []).map(notif => ({
        ...notif,
        food_post: notif.food_posts ? {
          title: notif.food_posts.title,
          image_url: notif.food_posts.image_url,
          location: notif.food_posts.location,
          expires_at: notif.food_posts.expires_at,
          profiles: profiles[notif.food_posts.user_id] || null
        } : null
      }));
      
      setNotifications(transformedData);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistically update the UI first
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        // Revert the optimistic update on error
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: false }
              : notif
          )
        );
        return;
      }

      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  const getTimeStatus = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `Expires in ${hours}h ${minutes}m`;
      } else {
        return `Expires in ${minutes}m`;
      }
    } else {
      return 'Expired';
    }
  };

  const getPosterName = (profiles: any) => {
    if (profiles?.first_name) {
      return `${profiles.first_name}${profiles.last_name ? ` ${profiles.last_name}` : ''}`;
    }
    return 'Anonymous User';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="text-center">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border/20 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side - Notifications title */}
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-playfair font-bold text-foreground">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            
            {/* Right side - Dashboard button */}
            <div className="ml-auto">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 text-foreground hover:text-foreground transition-all duration-200 px-4 py-2 rounded-lg h-12 text-lg font-inter font-bold hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-bold">Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pt-8">
        {notifications.length === 0 ? (
          <Card className="text-center py-12 bg-white border-border/20">
            <CardContent>
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No notifications yet
              </h3>
              <p className="text-muted-foreground">
                You'll see notifications here when other users share food near you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`transition-all duration-200 bg-white border hover:shadow-md ${
                  !notification.read 
                    ? 'border-purple-200 bg-purple-50/30' 
                    : 'border-border/20'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Food Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-muted/20 rounded-lg overflow-hidden">
                        <img
                          src={notification.food_post?.image_url || dummyPostImages[notification.food_post_id || ''] || dummyPizzaImage}
                          alt={notification.food_post?.title || 'Food'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-inter font-bold text-lg text-foreground">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <User className="h-4 w-4 text-primary" />
                              <span>
                                {notification.food_post?.profiles 
                                  ? getPosterName(notification.food_post.profiles)
                                  : 'Someone'
                                } shared {notification.food_post?.title || 'food'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <MapPin className="h-4 w-4" />
                              <span>{notification.food_post?.location || 'Location not specified'}</span>
                            </div>
                            
                            {notification.food_post?.expires_at && (
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock className="h-4 w-4" />
                                <span>{getTimeStatus(notification.food_post.expires_at)}</span>
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Mark as Read Button - Right Side */}
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Mark as read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;