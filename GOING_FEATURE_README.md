# Adding "Going" Feature to Sewanee Food Share

I've implemented a "Going" button feature that allows users to indicate they're planning to pick up food from a post. Here's what I've done and what you need to do to complete it:

## ✅ What's Already Implemented:

1. **TypeScript Interface**: Added `going_by?: string[] | null` to the `FoodPost` interface
2. **Database Migration**: Created migration file `20250903000000_add_going_by_to_food_posts.sql`
3. **Handler Functions**: Created `handleMarkAsGoing()` function (temporarily commented out)
4. **Helper Functions**: Added `isUserInGoingList()` helper function  
5. **UI Components**: Added Going button with count display (temporarily commented out)
6. **State Management**: Local state updates for instant UI feedback

## 🔧 To Complete the Feature:

### Step 1: Add Database Column

Go to your Supabase Dashboard (https://supabase.com/dashboard/project/ohlgzwrhxxixubqjqqrd) and:

1. Go to **SQL Editor**
2. Run this SQL query:

```sql
-- Add going_by column to track users who indicated they're going to pick up food
ALTER TABLE public.food_posts 
ADD COLUMN going_by uuid[] DEFAULT '{}';

-- Add index for better performance on going_by queries
CREATE INDEX idx_food_posts_going_by ON public.food_posts USING GIN(going_by);

-- Update RLS policies to allow users to update going_by field
DROP POLICY IF EXISTS "Users can update going_by field of any post" ON public.food_posts;
CREATE POLICY "Users can update going_by field of any post" ON public.food_posts
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

### Step 2: Enable the Feature in Code

After running the SQL, uncomment these sections in `src/components/Dashboard.tsx`:

1. **Update SELECT queries** (around lines 108, 140, 166, 325):
   ```typescript
   .select('*, finished_by, going_by')  // Add going_by to all select statements
   ```

2. **Uncomment handleMarkAsGoing function** (around line 417):
   ```typescript
   // Remove the /* */ comment blocks around the handleMarkAsGoing function
   ```

3. **Uncomment Going buttons in UI** (around line 917):
   ```typescript
   // Remove the /* */ comment blocks around the Going button JSX
   ```

4. **Update TypeScript interface** (already done, but ensure going_by is included):
   ```typescript
   interface FoodPost {
     // ... other fields
     going_by?: string[] | null;
   }
   ```

## 🎯 How the Feature Works:

### User Experience:
- **Going Button**: Blue button with MapPin icon
- **Count Display**: Shows number of users going: "Going (3)"
- **Toggle Behavior**: Click to mark/unmark as going
- **Visual States**: 
  - Not going: Outline blue button "Going"
  - Going: Filled blue button "Going (count)"

### Technical Implementation:
- **Database Storage**: Array of user UUIDs in `going_by` column
- **Real-time Updates**: Instant UI feedback with local state updates
- **Persistence**: Database updates with error handling
- **Performance**: GIN index for efficient array queries

## 🔄 Testing the Feature:

1. **Run the SQL migration** in Supabase Dashboard
2. **Uncomment the code sections** mentioned above  
3. **Rebuild the app**: `npm run build`
4. **Test on mobile**: Visit the app and try clicking "Going" buttons
5. **Verify counts**: Check that the count increases/decreases correctly
6. **Test persistence**: Refresh the page and verify the going status persists

## 🎨 UI Design:

```
┌─────────────────────────────────────────┐
│  🍕 Pizza Party Leftovers               │
│  Lots of pizza from our dorm party!     │
│  📍 Humphreys Hall  ⏰ Expires in 2h    │
│  by John Doe                            │
│                                         │
│  [View Details] [Going (2)] [Finished] │
└─────────────────────────────────────────┘
```

The Going button will appear between "View Details" and "Mark as Finished", making it easy for users to indicate their interest in picking up the food!

Let me know when you've added the database column and I'll help you uncomment and test the feature! 🚀
