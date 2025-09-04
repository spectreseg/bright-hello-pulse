import React from 'react';
import { LogOut, TrendingUp, Map, Plus, Bell, Settings, Moon, Sun, MapPin, Clock, Users, ChevronRight, CheckCircle, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/ui/mobile-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import dummyPizzaImage from '@/assets/dummy-pizza.jpg';
import dummySaladImage from '@/assets/dummy-salad.jpg';
import dummyFruitImage from '@/assets/dummy-fruit.jpg';
import dummySandwichesImage from '@/assets/dummy-sandwiches.jpg';
import dummyBagelsImage from '@/assets/dummy-bagels.jpg';
import dummyPastaImage from '@/assets/dummy-pasta.jpg';

interface DashboardProps {
  onSignOut?: () => void;
}

interface FoodPost {
  id: string;
  title: string;
  description: string;
  location: string;
  servings: string;
  image_url: string | null;
  expires_at: string;
  created_at: string;
  user_id: string;
  finished_by?: string[] | null;
  going_by?: string[] | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export default function Dashboard({ onSignOut }: DashboardProps = {}) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingActions, setLoadingActions] = React.useState<Record<string, string>>({});
  const [showExpiredPosts, setShowExpiredPosts] = React.useState(false);
  const [showMyPosts, setShowMyPosts] = React.useState(false);
  const [activePosts, setActivePosts] = React.useState<FoodPost[]>([]);
  const [expiredPosts, setExpiredPosts] = React.useState<FoodPost[]>([]);
  const [myPosts, setMyPosts] = React.useState<FoodPost[]>([]);
  const [showFinishConfirm, setShowFinishConfirm] = React.useState<{show: boolean, postId: string, title: string}>({show: false, postId: '', title: ''});
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useUserProfile(user);
  const { unreadCount, refetchUnreadCount } = useNotifications();

  // Debug unread count
  React.useEffect(() => {
    console.log('Dashboard: Current unread count:', unreadCount);
  }, [unreadCount]);

  // Force refresh unread count when dashboard loads
  React.useEffect(() => {
    if (user) {
      console.log('Dashboard: User loaded, refreshing unread count');
      refetchUnreadCount();
    }
  }, [user, refetchUnreadCount]);

  React.useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Redirect unauthenticated users
        if (!session) {
          window.location.href = '/';
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirect unauthenticated users
      if (!session) {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch food posts
  const fetchPosts = React.useCallback(async () => {
    try {
      const now = new Date().toISOString();
      
      // Fetch active posts
      const { data: activeData, error: activeError } = await supabase
        .from('food_posts')
        .select('*, finished_by, going_by')
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (activeError) {
        console.error('Error fetching active posts:', activeError);
      } else {
        console.log('Raw active posts from database:', activeData);
        // Get profile data for each post
        const postsWithProfiles = await Promise.all(
          (activeData || []).map(async (post) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', post.user_id)
            .single();
          
          console.log(`Profile data for user ${post.user_id}:`, profileData);
          return { ...post, profiles: profileData };
          })
        );
        console.log('Active posts with profiles:', postsWithProfiles);
        setActivePosts(postsWithProfiles);
      }

      // Fetch expired posts
      const { data: expiredData, error: expiredError } = await supabase
        .from('food_posts')
        .select('*, finished_by, going_by')
        .lte('expires_at', now)
        .order('created_at', { ascending: false });

      if (expiredError) {
        console.error('Error fetching expired posts:', expiredError);
      } else {
        // Get profile data for each post
        const postsWithProfiles = await Promise.all(
          (expiredData || []).map(async (post) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', post.user_id)
              .single();
            
            return { ...post, profiles: profileData };
          })
        );
        setExpiredPosts(postsWithProfiles);
      }

      // Fetch user's posts if logged in
      if (user) {
        const { data: myData, error: myError } = await supabase
          .from('food_posts')
          .select('*, finished_by, going_by')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (myError) {
          console.error('Error fetching my posts:', myError);
        } else {
          console.log('Raw my posts from database:', myData);
          // Get profile data for each post
          const postsWithProfiles = await Promise.all(
            (myData || []).map(async (post) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('user_id', post.user_id)
                .single();
              
              return { ...post, profiles: profileData };
            })
          );
          console.log('My posts with profiles:', postsWithProfiles);
          setMyPosts(postsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    }
  }, [user]);

  // Dummy posts with properly generated images
  const dummyPosts = [
    {
      id: 'dummy-1',
      user_id: 'dummy-user-1',
      title: 'Homemade Margherita Pizza',
      description: 'Fresh basil, mozzarella, and tomato sauce on homemade dough. Made too much for dinner tonight!',
      location: 'Downtown Apartment',
      servings: '6-8 slices',
      image_url: dummyPizzaImage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // expires in 4 hours
      finished_by: [] as string[],
      profiles: { first_name: 'Marco', last_name: 'Rossi', avatar_url: null }
    },
    {
      id: 'dummy-2', 
      user_id: 'dummy-user-2',
      title: 'Fresh Garden Salad',
      description: 'Mixed greens with cherry tomatoes, cucumbers, and house vinaigrette. Perfect for a healthy lunch!',
      location: 'University Campus',
      servings: '4-6 people',
      image_url: dummySaladImage,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // expires in 8 hours
      finished_by: [] as string[],
      profiles: { first_name: 'Sarah', last_name: 'Johnson', avatar_url: null }
    },
    {
      id: 'dummy-3',
      user_id: 'dummy-user-3', 
      title: 'Seasonal Fruit Bowl',
      description: 'Fresh strawberries, blueberries, and kiwi from the farmers market. Great for sharing!',
      location: 'Community Center',
      servings: '8-10 people',
      image_url: dummyFruitImage,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // expires in 5 hours
      finished_by: [] as string[],
      profiles: { first_name: 'Emma', last_name: 'Chen', avatar_url: null }
    },
    {
      id: 'dummy-4',
      user_id: 'dummy-user-4',
      title: 'Gourmet Sandwiches',
      description: 'Turkey, avocado, and sprouts on artisan sourdough. Made for office lunch but have extras!',
      location: 'Business District',
      servings: '4 sandwiches',
      image_url: dummySandwichesImage,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // expired 1 hour ago
      finished_by: [] as string[],
      profiles: { first_name: 'David', last_name: 'Miller', avatar_url: null }
    },
    {
      id: 'dummy-5',
      user_id: 'dummy-user-5',
      title: 'Everything Bagels',
      description: 'Fresh baked everything bagels with cream cheese and lox. Perfect for weekend brunch!',
      location: 'Local Bakery',
      servings: '8 bagels',
      image_url: dummyBagelsImage,
      created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
      updated_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // expired 2 hours ago
      finished_by: [] as string[],
      profiles: { first_name: 'Lisa', last_name: 'Anderson', avatar_url: null }
    },
    {
      id: 'dummy-6',
      user_id: 'dummy-user-6',
      title: 'Creamy Italian Pasta',
      description: 'Penne with herbs, vegetables, and parmesan. Comfort food at its finest!',
      location: 'Little Italy',
      servings: '6-8 people',
      image_url: dummyPastaImage,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // expires in 6 hours
      finished_by: [] as string[],
      profiles: { first_name: 'Antonio', last_name: 'Gonzalez', avatar_url: null }
    }
  ];

  // Handle marking dummy posts as finished (for UI demo)
  const [dummyPostsState, setDummyPostsState] = React.useState(dummyPosts);
  
  const handleMarkDummyAsFinished = (postId: string) => {
    console.log('Handling dummy post mark as finished:', postId);
    console.log('Current user ID:', user?.id);
    
    setDummyPostsState(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          const currentFinishedBy = post.finished_by || [];
          const userId = user?.id || 'current-user';
          console.log('Current finished_by for post:', currentFinishedBy);
          
          if (currentFinishedBy.includes(userId)) {
            // User already marked as finished, so unmark (remove from array)
            const updatedFinishedBy = currentFinishedBy.filter(id => id !== userId);
            console.log('Removing user from finished_by:', updatedFinishedBy);
            return { ...post, finished_by: updatedFinishedBy };
          } else {
            // User hasn't marked as finished, so add to array
            const updatedFinishedBy = [...currentFinishedBy, userId];
            console.log('Adding user to finished_by:', updatedFinishedBy);
            return { ...post, finished_by: updatedFinishedBy };
          }
        }
        return post;
      });
      console.log('Updated dummy posts state:', updatedPosts);
      return updatedPosts;
    });
    
    console.log('Demo: Toggled dummy post finished status!');
  };

  // Handle marking post as finished or unmarking it
  const handleMarkAsFinished = async (postId: string, userId: string) => {
    console.log('Toggling post finished status:', postId, 'by user:', userId);

    try {
      // Get current post data
      const { data: currentPost, error: fetchError } = await supabase
        .from('food_posts')
        .select('finished_by, going_by')
        .eq('id', postId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching post:', fetchError);
        alert('Failed to fetch post data. Please try again.');
        return;
      }

      if (!currentPost) {
        console.error('Post not found:', postId);
        alert('Post not found. Please refresh the page.');
        return;
      }

      console.log('Current post data:', currentPost);
      
      const currentFinishedBy = currentPost.finished_by || [];
      console.log('Current finished_by array:', currentFinishedBy);
      
      let updatedFinishedBy: string[];
      let isMarking: boolean;
      
      // Check if user already marked as finished
      if (currentFinishedBy.includes(userId)) {
        // User already marked as finished, so unmark (remove from array)
        updatedFinishedBy = currentFinishedBy.filter(id => id !== userId);
        isMarking = false;
        console.log('Unmarking post as finished. Updated finished_by array:', updatedFinishedBy);
      } else {
        // User hasn't marked as finished, so add to array
        updatedFinishedBy = [...currentFinishedBy, userId];
        isMarking = true;
        console.log('Marking post as finished. Updated finished_by array:', updatedFinishedBy);
      }

      // Update the post in the database
      const { error } = await supabase
        .from('food_posts')
        .update({ finished_by: updatedFinishedBy })
        .eq('id', postId);

      if (error) {
        console.error('Error updating finished_by:', error);
        alert('Failed to update post status. Please try again.');
        return;
      }

      console.log('Successfully updated finished_by array');

      // Immediately update local state for instant UI feedback
      setActivePosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, finished_by: updatedFinishedBy }
            : post
        )
      );

      // Also update myPosts if the user is viewing their own posts
      setMyPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, finished_by: updatedFinishedBy }
            : post
        )
      );

      // Handle automatic expiration logic only when marking (not unmarking)
      if (isMarking && updatedFinishedBy.length >= 3) {
        console.log('Post should be expired now - 3 users marked as finished');
        
        // Update expires_at to current time to expire the post
        const { error: expireError } = await supabase
          .from('food_posts')
          .update({ expires_at: new Date().toISOString() })
          .eq('id', postId);
          
        if (expireError) {
          console.error('Error expiring post:', expireError);
        } else {
          console.log('Post automatically expired due to 3 users marking as finished');
        }
        
        alert('This post has been marked as finished by 3 users and is now automatically expired!');
      }

      // Don't refresh posts automatically to maintain button state
      // fetchPosts() will be called naturally when user navigates or performs other actions
    } catch (error) {
      console.error('Error in handleMarkAsFinished:', error);
      alert('Failed to update post status. Please try again.');
    }
  };

  // Handle marking dummy post as "going"
  const handleMarkDummyAsGoing = (postId: string) => {
    console.log('Handling dummy post mark as going:', postId);
    
    // For dummy posts, just update local state
    setActivePosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const currentGoingBy = post.going_by || [];
          const userId = user?.id || 'current-user';
          let updatedGoingBy;
          
          if (currentGoingBy.includes(userId)) {
            // User already marked as going, so unmark (remove from array)
            updatedGoingBy = currentGoingBy.filter(id => id !== userId);
            console.log(`Dummy post ${postId}: Unmarking as going`);
          } else {
            // User hasn't marked as going, so add to array
            updatedGoingBy = [...currentGoingBy, userId];
            console.log(`Dummy post ${postId}: Marking as going`);
          }
          
          return { ...post, going_by: updatedGoingBy };
        }
        return post;
      })
    );
    console.log('Dummy post going state updated locally');
  };

  // Handle marking post as "going"
  const handleMarkAsGoing = async (postId: string, userId: string) => {
    console.log('=== HANDLE MARK AS GOING ===');
    console.log('Post ID:', postId);
    console.log('User ID:', userId);
    
    try {
      // Get current post data
      console.log('Fetching current post data...');
      const { data: currentPost, error: fetchError } = await supabase
        .from('food_posts')
        .select('going_by')
        .eq('id', postId)
        .maybeSingle();

      console.log('Fetch result:', { currentPost, fetchError });

      if (fetchError) {
        console.error('Error fetching post:', fetchError);
        console.error('Fetch error details:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint
        });
        alert(`Failed to fetch post data: ${fetchError.message}`);
        return;
      }

      if (!currentPost) {
        console.error('Post not found for ID:', postId);
        alert('Post not found.');
        return;
      }

      console.log('Current post data:', currentPost);
      const currentGoingBy = currentPost.going_by || [];
      console.log('Current going_by array:', currentGoingBy);
      
      // Toggle user in going_by array
      let updatedGoingBy;
      const isGoing = currentGoingBy.includes(userId);
      console.log('Is user currently going?', isGoing);
      
      if (isGoing) {
        // Remove user from going_by
        updatedGoingBy = currentGoingBy.filter(id => id !== userId);
        console.log('Unmarking as going. New going_by array:', updatedGoingBy);
      } else {
        // Add user to going_by
        updatedGoingBy = [...currentGoingBy, userId];
        console.log('Marking as going. New going_by array:', updatedGoingBy);
      }

      // Update database
      console.log('Updating database with new going_by array...');
      const { error: updateError } = await supabase
        .from('food_posts')
        .update({ going_by: updatedGoingBy })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating post:', updateError);
        console.error('Update error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
        alert(`Failed to update going status: ${updateError.message}`);
        return;
      }

      console.log('Successfully updated going_by array in database');

      // Immediately update local state for instant UI feedback
      setActivePosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, going_by: updatedGoingBy }
            : post
        )
      );

      // Also update myPosts if the user is viewing their own posts
      setMyPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, going_by: updatedGoingBy }
            : post
        )
      );

      console.log('Local state updated successfully');

    } catch (error) {
      console.error('Error in handleMarkAsGoing:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      alert('Failed to update going status. Please try again.');
    }
  };

  // Handle deleting post
  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('food_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure only owner can delete

      if (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
        return;
      }

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error in handleDeletePost:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Handle marking own post as finished (expire it)
  const handleMarkPostAsFinished = async (postId: string) => {
    if (!user || loadingActions[postId]) return;

    // First, verify the user owns this post and get the title
    const { data: postData, error: fetchError } = await supabase
      .from('food_posts')
      .select('user_id, title')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Error fetching post to verify ownership:', fetchError);
      return;
    }

    if (postData.user_id !== user.id) {
      return;
    }

    // Show styled confirmation dialog
    setShowFinishConfirm({show: true, postId, title: postData.title});
  };

  const confirmMarkAsFinished = async () => {
    const { postId } = showFinishConfirm;
    setShowFinishConfirm({show: false, postId: '', title: ''});
    
    if (!user || loadingActions[postId]) return;

    // Set loading state
    setLoadingActions(prev => ({ ...prev, [postId]: 'finishing' }));

    try {
      console.log('Post ownership verified. Marking as finished:', {
        postId,
        ownerId: user.id,
        currentUserId: user.id
      });

      // Set the expiration date to current time to make it expired
      const now = new Date().toISOString();
      
      console.log('Attempting to mark post as finished:', {
        postId,
        userId: user.id,
        currentTime: now
      });

      // Check current auth session
      const { data: authSession } = await supabase.auth.getSession();
      console.log('Current auth session:', {
        hasSession: !!authSession.session,
        userId: authSession.session?.user?.id,
        matchesUser: authSession.session?.user?.id === user.id
      });
      
      // Try a simpler approach - just update the expires_at field
      const updateData = { expires_at: now };
      
      const { error, data } = await supabase
        .from('food_posts')
        .update(updateData)
        .eq('id', postId)
        .eq('user_id', user.id) // Add back the user_id check for RLS compatibility

      console.log('Update result:', { error, data, errorMessage: error?.message, errorDetails: error?.details });

      if (error) {
        console.error('Database error marking post as finished:', error);
        alert(`Failed to mark post as finished: ${error.message || 'Unknown error'}. Please try again.`);
        return;
      }

      // Update local state immediately for better UX
      setActivePosts(prev => prev.filter(post => post.id !== postId));
      setMyPosts(prev => prev.filter(post => post.id !== postId));
      
      // Refresh posts to ensure consistency
      fetchPosts();
      
      // Show styled success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error in confirmMarkAsFinished:', error);
      alert('Failed to mark post as finished. Please try again.');
    } finally {
      // Clear loading state
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Call parent onSignOut if provided
      if (onSignOut) {
        onSignOut();
      }
      
      // Force redirect to auth page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if signout fails
      window.location.href = '/';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user || !session) {
    window.location.href = '/';
    return null;
  }

  const handleNavClick = (item: any) => {
    if (item.label === 'New Post') {
      navigate('/share-food');
    } else if (item.label === 'My Posts') {
      setShowMyPosts(!showMyPosts);
      setShowExpiredPosts(false);
    } else if (item.label === 'Notifications') {
      navigate('/notifications');
    } else if (item.label === 'Find Food') {
      navigate('/find-food');
    }
    // Add other navigation logic here as needed
  };

  const navItems = [
    { icon: TrendingUp, label: 'My Posts', href: '#' },
    { icon: Map, label: 'Find Food', href: '/find-food' },
    { icon: Plus, label: 'New Post', href: '#', primary: true },
    { icon: Bell, label: 'Notifications', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' },
  ];

  // Helper function to get display image
  const getPostImage = (post: FoodPost, index: number) => {
    if (post.image_url) {
      return post.image_url;
    }
    // Fallback to static images based on index
    const images = [dummyPizzaImage, dummySaladImage, dummyFruitImage, dummySandwichesImage, dummyBagelsImage, dummyPastaImage];
    return images[index % images.length];
  };

  // Helper function to format time remaining or expired
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
      const pastHours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
      if (pastHours < 24) {
        return `Expired ${pastHours}h ago`;
      } else {
        const pastDays = Math.floor(pastHours / 24);
        return `Expired ${pastDays}d ago`;
      }
    }
  };

  // Helper function to get poster name
  const getPosterName = (post: FoodPost) => {
    if (post.profiles?.first_name) {
      return `${post.profiles.first_name}${post.profiles.last_name ? ` ${post.profiles.last_name}` : ''}`;
    }
    return 'Anonymous User';
  };

  // Helper function to check if user is in finished list
  const isUserInFinishedList = (finishedBy: string[] | null | undefined, userId: string | undefined) => {
    if (!finishedBy) return false;
    const effectiveUserId = userId || 'current-user'; // Use same fallback as in handlers
    return finishedBy.includes(effectiveUserId);
  };

  // Helper function to check if user is in going list
  const isUserInGoingList = (goingBy: string[] | null | undefined, userId: string | undefined) => {
    if (!goingBy) return false;
    const effectiveUserId = userId || 'current-user'; // Use same fallback as in handlers
    return goingBy.includes(effectiveUserId);
  };

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
    : user?.email?.split('@')[0] || 'User';

  const initials = profile?.first_name 
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="w-full px-4 py-4">
          {isMobile ? (
            // Mobile Header
            <div className="flex items-center justify-between">
              <button onClick={toggleDarkMode} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                {isDarkMode ? <Sun className="h-5 w-5 text-foreground/80" /> : <Moon className="h-5 w-5 text-foreground/80" />}
              </button>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-border/30">
                  <AvatarImage 
                    src={profile?.avatar_url || ""} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h1 className="text-lg font-playfair font-semibold text-foreground">
                    Welcome back,
                  </h1>
                  <p className="text-base font-playfair text-foreground/70">
                    {displayName}!
                  </p>
                </div>
              </div>
              
              <button onClick={handleSignOut} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <LogOut className="h-5 w-5 text-destructive" />
              </button>
            </div>
          ) : (
            // Desktop Header
            <div className="flex items-center justify-center gap-48">
              <div className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className="w-12 h-12 bg-transparent flex items-center justify-center group-hover:bg-muted/50 rounded-lg transition-colors duration-200">
                  <button onClick={toggleDarkMode}>
                    {isDarkMode ? <Sun className="h-6 w-6 text-foreground/80 group-hover:text-foreground" /> : <Moon className="h-6 w-6 text-foreground/80 group-hover:text-foreground" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 border-2 border-border/30">
                  <AvatarImage 
                    src={profile?.avatar_url || ""} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-playfair font-semibold text-foreground tracking-wide">
                  Welcome back, {displayName}!
                </h1>
              </div>
              
              <div className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className="w-12 h-12 bg-transparent flex items-center justify-center group-hover:bg-muted/50 rounded-lg transition-colors duration-200">
                  <button onClick={handleSignOut}>
                    <LogOut className="h-6 w-6 text-destructive group-hover:text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`w-full px-4 py-3 ${isMobile ? 'pb-20' : ''}`}>
        {/* Desktop Navigation Grid */}
        {!isMobile && (
          <div className="flex items-center justify-between px-8 py-6 mb-4 bg-muted/50 mx-4 rounded-lg">
            {navItems.map((item) => (
              <div 
                key={item.label} 
                className="flex flex-col items-center gap-3 cursor-pointer group"
                onClick={() => handleNavClick(item)}
              >
                {item.primary ? (
                  <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <item.icon className="h-7 w-7 text-white dark:text-black" />
                  </div>
                ) : (
                  <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors duration-200 relative ${
                    item.label === 'My Posts' && showMyPosts 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'bg-transparent group-hover:bg-muted/50'
                  }`}>
                    <item.icon className={`h-6 w-6 transition-colors ${
                      item.label === 'My Posts' && showMyPosts 
                        ? 'text-white' 
                        : 'text-foreground/80 group-hover:text-foreground'
                    }`} />
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-5"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                )}
                <span className={`text-sm font-medium transition-colors ${
                  item.label === 'My Posts' && showMyPosts 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-foreground/60 group-hover:text-foreground'
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Posts Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-semibold text-foreground tracking-wide">
              {showMyPosts ? 'My Posts' : (showExpiredPosts ? 'Expired Posts' : 'Active Posts')}
            </h2>
            <div className="flex gap-4">
              {showMyPosts ? (
                <button
                  onClick={() => {
                    setShowMyPosts(false);
                    setShowExpiredPosts(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-inter font-medium text-foreground hover:text-foreground/80 transition-colors duration-200"
                >
                  Active Posts
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowExpiredPosts(!showExpiredPosts)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-inter font-medium text-foreground/80 hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors duration-200"
                >
                  {showExpiredPosts ? 'Show Active Posts' : 'Show Expired Posts'}
                  <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showExpiredPosts ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              let postsToShow: FoodPost[] = [];
              if (showMyPosts) {
                postsToShow = myPosts;
              } else if (showExpiredPosts) {
                postsToShow = [...expiredPosts, ...dummyPostsState.filter(post => new Date(post.expires_at) < new Date())];
              } else {
                postsToShow = [...activePosts, ...dummyPostsState.filter(post => new Date(post.expires_at) > new Date())];
              }
              
              console.log('Final posts to show:', postsToShow);

              if (postsToShow.length === 0) {
                return (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      {showMyPosts ? 'You haven\'t posted any food yet' : 
                       showExpiredPosts ? 'No expired posts' : 'No active posts available'}
                    </p>
                  </div>
                );
              }

              return postsToShow.map((post, index) => (
              <Card key={post.id} className="bg-card border-border/30 hover:border-border/50 transition-all duration-200 hover:shadow-sm overflow-hidden group flex flex-col">
                <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                  <img 
                    src={getPostImage(post, index)} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <Badge 
                    variant="secondary" 
                    className={`absolute top-2 right-2 ${
                      showExpiredPosts 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    {showExpiredPosts ? 'Expired' : 'Available'}
                  </Badge>
                </div>
                <CardContent className="p-4 cursor-default flex flex-col flex-1">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="font-inter font-semibold text-base text-foreground leading-tight mb-2 tracking-wide">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-inter">
                        {post.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground font-inter">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{post.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeStatus(post.expires_at)}</span>
                      </div>
                      {post.servings && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{post.servings} servings</span>
                        </div>
                      )}
                      <div className="text-sm text-foreground/70 font-medium">
                        by {getPosterName(post)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 mt-auto">
                    {user && post.user_id === user.id ? (
                      // Show action buttons for own posts
                      <>
                        {!showExpiredPosts && new Date(post.expires_at) > new Date() && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-sm h-9 font-inter font-medium text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => handleMarkPostAsFinished(post.id)}
                            disabled={!!loadingActions[post.id]}
                          >
                            {loadingActions[post.id] === 'finishing' ? (
                              <>
                                <div className="animate-spin w-4 h-4 mr-2 rounded-full border-2 border-green-600 border-t-transparent" />
                                Finishing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Finished
                              </>
                            )}
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className={`${!showExpiredPosts && new Date(post.expires_at) > new Date() ? 'flex-1' : 'w-full'} text-sm h-9 font-inter font-medium`}
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </Button>
                      </>
                    ) : (
                      // Show action buttons for other users' posts
                      <>
                        <Button variant="ghost" size="sm" className="flex-1 text-sm h-9 text-primary font-inter font-medium">
                          View Details
                        </Button>
                        {/* Going Button */}
                        {isUserInGoingList(post.going_by, user?.id) ? (
                          <Button 
                            size="sm" 
                            className="flex-1 text-sm h-9 bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer font-inter font-medium border-0 dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white transition-colors" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('=== UNMARK GOING BUTTON CLICKED ===');
                              console.log('Button clicked for post:', post.id);
                              console.log('User ID:', user?.id);
                              
                              if (post.id.startsWith('dummy-')) {
                                console.log('This is a dummy post, calling handleMarkDummyAsGoing to unmark');
                                handleMarkDummyAsGoing(post.id);
                                return;
                              }
                              
                              console.log('This is a real post, calling handleMarkAsGoing to unmark');
                              handleMarkAsGoing(post.id, user?.id || 'current-user');
                            }}
                            title="Click to unmark as going"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Going ({post.going_by?.length || 0})
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 text-sm h-9 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 font-inter font-medium"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('=== GOING BUTTON CLICKED ===');
                              console.log('Button clicked for post:', post.id);
                              console.log('User ID:', user?.id);
                              
                              if (post.id.startsWith('dummy-')) {
                                console.log('This is a dummy post, calling handleMarkDummyAsGoing');
                                handleMarkDummyAsGoing(post.id);
                                return;
                              }
                              
                              console.log('This is a real post, calling handleMarkAsGoing');
                              handleMarkAsGoing(post.id, user?.id || 'current-user');
                            }}
                            disabled={showExpiredPosts}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Going
                          </Button>
                        )}
                        {/* Mark as Finished Button */}
                        {isUserInFinishedList(post.finished_by, user?.id) ? (
                          <Button 
                            size="sm" 
                            className="flex-1 text-sm h-9 bg-green-600 hover:bg-green-500 text-white font-bold cursor-pointer font-inter font-medium border-0 dark:bg-green-700 dark:hover:bg-green-600 dark:text-white transition-colors" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('=== UNMARK BUTTON CLICKED ===');
                              console.log('Button clicked for post:', post.id);
                              console.log('User ID:', user?.id);
                              
                              if (post.id.startsWith('dummy-')) {
                                console.log('This is a dummy post, calling handleMarkDummyAsFinished to unmark');
                                handleMarkDummyAsFinished(post.id);
                                return;
                              }
                              
                              console.log('This is a real post, calling handleMarkAsFinished to unmark');
                              handleMarkAsFinished(post.id, user?.id || 'current-user');
                            }}
                            title="Click to unmark as finished"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Finished ({post.finished_by?.length || 0})
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1 text-sm h-9 bg-primary hover:bg-primary/90 text-white font-inter font-medium dark:text-black"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('=== BUTTON CLICKED ===');
                              console.log('Button clicked for post:', post.id);
                              console.log('User ID:', user?.id);
                              
                              if (post.id.startsWith('dummy-')) {
                                console.log('This is a dummy post, calling handleMarkDummyAsFinished');
                                handleMarkDummyAsFinished(post.id);
                                return;
                              }
                              
                              console.log('This is a real post, calling handleMarkAsFinished');
                              handleMarkAsFinished(post.id, user?.id || 'current-user');
                            }}
                            disabled={showExpiredPosts}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Finished
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
            })()}
          </div>
        </section>
      </main>
      
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav 
          unreadCount={unreadCount} 
          onMyPosts={() => setShowMyPosts(!showMyPosts)}
          showMyPosts={showMyPosts}
        />
      )}

      {/* Styled Confirmation Dialog */}
      {showFinishConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Mark as Finished</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Are you sure you want to mark <span className="font-medium text-foreground">"{showFinishConfirm.title}"</span> as finished? This will move it to the expired section and other users will no longer be able to claim it.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowFinishConfirm({show: false, postId: '', title: ''})}
                  className="px-6 py-2.5 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmMarkAsFinished}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  Mark Finished
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Post marked as finished!</p>
              <p className="text-sm text-white/80">It has been moved to the expired section.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}