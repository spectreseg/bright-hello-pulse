// Sample food posts for testing the map
import { supabase } from '@/integrations/supabase/client';

export const addSampleFoodPosts = async (userId: string) => {
  const samplePosts = [
    {
      title: 'Pizza Party Leftovers',
      description: 'Lots of cheese and pepperoni pizza from our floor party! Still warm and delicious.',
      location: 'Benedict Hall',
      servings: '8-10',
      user_id: userId,
      image_url: '/src/assets/food-pizza.jpg',
      expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    },
    {
      title: 'Fresh Bagels & Cream Cheese',
      description: 'Made too many bagels this morning. Various flavors available!',
      location: 'Cannon Hall',
      servings: '6-8',
      user_id: userId,
      image_url: '/src/assets/food-bagels.jpg',
      expires_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    },
    {
      title: 'Homemade Cookies',
      description: 'Chocolate chip cookies fresh from the oven. Perfect with milk!',
      location: 'Cleveland Hall',
      servings: '12-15',
      user_id: userId,
      image_url: '/src/assets/food-pizza.jpg', // Using pizza as placeholder for cookies
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    },
    {
      title: 'Healthy Fruit Salad',
      description: 'Mixed berries, grapes, and melon. Great for a healthy snack!',
      location: 'Gorgas Hall',
      servings: '4-6',
      user_id: userId,
      image_url: '/src/assets/food-fruit.jpg',
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    },
    {
      title: 'Leftover Pasta',
      description: 'Spaghetti with marinara sauce. Made too much for dinner!',
      location: 'Hodgson Hall',
      servings: '3-4',
      user_id: userId,
      image_url: '/src/assets/food-pasta.jpg',
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    },
    {
      title: 'Grilled Sandwiches',
      description: 'Ham and cheese grilled sandwiches. Perfect for lunch!',
      location: 'Hunter Hall',
      servings: '5-6',
      user_id: userId,
      image_url: '/src/assets/food-sandwiches.jpg',
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    }
  ];

  try {
    const { data, error } = await supabase
      .from('food_posts')
      .insert(samplePosts)
      .select();

    if (error) {
      console.error('Error adding sample posts:', error);
      throw error;
    }

    console.log('✅ Added sample food posts:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to add sample posts:', error);
    throw error;
  }
};
