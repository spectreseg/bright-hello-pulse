import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { findLocationCoordinates } from '@/utils/sewaneeLocations';
import { addSampleFoodPosts } from '@/utils/sampleFoodPosts';
import ErrorBoundary from '@/components/ErrorBoundary';
import GoogleMapComponent from '@/components/GoogleMapComponent';

interface FoodPost {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  servings: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  user_id: string;
  finished_by: string[] | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

const SEWANEE_CENTER = { lat: 35.2042, lng: -85.9217 };

const FindFood = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showExpired, setShowExpired] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [addingData, setAddingData] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(user);
      }
    };

    getUser();
  }, []);

  // Add sample food posts
  const handleAddSampleData = async () => {
    if (!user || addingData) return;
    
    setAddingData(true);
    try {
      await addSampleFoodPosts(user.id);
      // Refresh the query
      queryClient.invalidateQueries({ queryKey: ['food-posts-map'] });
      console.log('✅ Sample data added successfully');
    } catch (error) {
      console.error('❌ Failed to add sample data:', error);
    } finally {
      setAddingData(false);
    }
  };

  // Fetch food posts
  const { data: foodPosts = [], isLoading, error } = useQuery({
    queryKey: ['food-posts-map'],
    queryFn: async () => {
      console.log('Fetching food posts for map...');
      
      // First get food posts
      const { data: posts, error: postsError } = await supabase
        .from('food_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching food posts:', postsError);
        throw postsError;
      }

      // Then get profiles for each post
      const postsWithProfiles = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', post.user_id)
            .single();

          return {
            ...post,
            profiles: profile
          };
        })
      );

      return postsWithProfiles;
    },
    staleTime: 30000, // Cache for 30 seconds to prevent excessive re-fetching
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });

  // Filter posts based on expiration and toggle state - memoized to prevent re-renders
  const filteredPosts = React.useMemo(() => {
    if (!foodPosts || foodPosts.length === 0) return [];
    
    const now = new Date();
    return foodPosts.filter(post => {
      const isExpired = new Date(post.expires_at) < now;
      return showExpired ? isExpired : !isExpired;
    });
  }, [foodPosts, showExpired]);

    // Handle map ready callback
  const handleMapReady = React.useCallback((map: any) => {
    setMapInstance(map);
    setMapLoaded(true);
    console.log('✅ Map ready and loaded successfully');
  }, []);

  // Helper function to create a custom marker with food image
  const createFoodImageMarker = (post: FoodPost, markerColor: string, isExpired: boolean): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 48;
      canvas.width = size;
      canvas.height = size;

      if (!ctx) {
        // Fallback to simple marker
        resolve(`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
            <text x="16" y="20" text-anchor="middle" fill="${markerColor}" font-size="10" font-weight="bold">🍽️</text>
          </svg>
        `)}`);
        return;
      }

      // Draw shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Draw outer circle (status color)
      ctx.fillStyle = markerColor;
      ctx.beginPath();
      ctx.arc(size/2, size/2, 22, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow for inner elements
      ctx.shadowColor = 'transparent';

      // Draw white inner circle
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(size/2, size/2, 18, 0, 2 * Math.PI);
      ctx.fill();

      if (post.image_url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Create circular clipping mask
          ctx.save();
          ctx.beginPath();
          ctx.arc(size/2, size/2, 18, 0, 2 * Math.PI);
          ctx.clip();

          // Draw the food image
          ctx.drawImage(img, 6, 6, 36, 36);
          ctx.restore();

          // Draw border ring
          ctx.strokeStyle = markerColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(size/2, size/2, 18, 0, 2 * Math.PI);
          ctx.stroke();

          // Add expired overlay if needed
          if (isExpired) {
            ctx.fillStyle = 'rgba(107, 114, 128, 0.7)';
            ctx.beginPath();
            ctx.arc(size/2, size/2, 18, 0, 2 * Math.PI);
            ctx.fill();

            // Add clock emoji for expired
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⏰', size/2, size/2);
          }

          resolve(canvas.toDataURL());
        };
        img.onerror = () => {
          // Fallback if image fails to load
          ctx.fillStyle = markerColor;
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🍽️', size/2, size/2);
          resolve(canvas.toDataURL());
        };
        img.src = post.image_url;
      } else {
        // No image - just draw food emoji
        ctx.fillStyle = markerColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍽️', size/2, size/2);
        resolve(canvas.toDataURL());
      }
    });
  };

  // Add markers when posts change - debounced to prevent excessive updates
  useEffect(() => {
    if (!mapLoaded || !mapInstance || !filteredPosts) return;

    const timeoutId = setTimeout(() => {
      // Clear existing markers
      if ((window as any).markers) {
        (window as any).markers.forEach((marker: any) => marker.setMap(null));
        (window as any).markers = [];
      }

      // Get posts with coordinates - use database coordinates if available, otherwise try location name mapping
      const postsWithCoords = filteredPosts.map(post => {
        let coords = null;
        
        // First, check if we have coordinates stored in the database
        const postWithCoords = post as any;
        if (postWithCoords.latitude && postWithCoords.longitude) {
          coords = { lat: postWithCoords.latitude, lng: postWithCoords.longitude };
          console.log(`Using database coordinates for "${post.title}": (${coords.lat}, ${coords.lng})`);
        } else {
          // Fallback to location name mapping for older posts
          coords = findLocationCoordinates(post.location);
          console.log(`Using location mapping for "${post.title}" at "${post.location}": ${coords ? `(${coords.lat}, ${coords.lng})` : 'null'}`);
        }
        
        return { ...post, coords };
      }).filter(post => post.coords);

      console.log('Filtered posts count:', filteredPosts.length);
      console.log('Posts with coordinates count:', postsWithCoords.length);
      console.log('Adding markers for', postsWithCoords.length, 'posts');

    postsWithCoords.forEach((post, index) => {
      if (!post.coords) return;

      console.log(`Creating marker ${index + 1}:`, post.title, 'at', post.location, `(${post.coords.lat}, ${post.coords.lng})`);

      // Check for overlapping coordinates and slightly offset if needed
      const existingMarkers = (window as any).markers || [];
      let adjustedCoords = { ...post.coords };
      
      // Check if any existing marker is at the same or very close coordinates
      existingMarkers.forEach((existingMarker: any, existingIndex: number) => {
        const existingPos = existingMarker.getPosition();
        if (existingPos && 
            Math.abs(existingPos.lat() - adjustedCoords.lat) < 0.0001 && 
            Math.abs(existingPos.lng() - adjustedCoords.lng) < 0.0001) {
          // Slightly offset the new marker to prevent complete overlap
          adjustedCoords.lat += (index * 0.0002);
          adjustedCoords.lng += (index * 0.0002);
          console.log(`Adjusted coordinates for overlap: (${adjustedCoords.lat}, ${adjustedCoords.lng})`);
        }
      });

      const isExpired = new Date(post.expires_at) < new Date();
      const finishedCount = post.finished_by?.length || 0;
      
      let markerColor = '#10b981'; // Green for active
      if (isExpired) markerColor = '#6b7280'; // Gray for expired
      else if (finishedCount >= 2) markerColor = '#f59e0b'; // Amber for almost finished

      console.log(`Marker ${index + 1} color:`, markerColor, 'Expired:', isExpired);

      // Create marker with custom food image
      createFoodImageMarker(post, markerColor, isExpired).then((markerIconUrl) => {
        const marker = new (window as any).google.maps.Marker({
          position: adjustedCoords,
          map: mapInstance,
          title: post.title,
          icon: {
            url: markerIconUrl,
            scaledSize: new (window as any).google.maps.Size(48, 48),
            anchor: new (window as any).google.maps.Point(24, 24),
          }
        });

        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="max-width: 320px; padding: 16px; font-family: system-ui;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                ${post.title}
              </h3>
              
              ${post.image_url ? `
                <div style="margin-bottom: 12px;">
                  <img 
                    src="${post.image_url}" 
                    alt="Food Image" 
                    style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                  />
                </div>
              ` : ''}
              
              <div style="margin-bottom: 10px; font-size: 14px; color: #374151;">
                📍 <strong>${post.location}</strong>
              </div>
              
              <div style="margin-bottom: 10px; font-size: 14px; color: #6b7280; line-height: 1.4;">
                ${post.description}
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: #4b5563;">
                <span>🍽️ ${post.servings} servings</span>
                <span>👤 ${post.profiles?.first_name || 'Anonymous'}</span>
              </div>
              
              <div style="font-size: 12px; color: #6b7280;">
                ⏰ Expires: ${new Date(post.expires_at).toLocaleString()}
              </div>
              
              ${finishedCount > 0 ? 
                `<div style="margin-top: 10px; font-size: 12px; color: #059669; font-weight: 600;">
                  ✅ ${finishedCount} people marked as finished
                </div>` : ''
              }
            </div>
          `,
        });

        marker.addListener('click', () => {
          if ((window as any).currentInfoWindow) {
            (window as any).currentInfoWindow.close();
          }
          infoWindow.open(mapInstance, marker);
          (window as any).currentInfoWindow = infoWindow;
        });

        (window as any).markers = (window as any).markers || [];
        (window as any).markers.push(marker);
        console.log(`Marker ${index + 1} added. Total markers:`, (window as any).markers.length);
      });
    });
    
    console.log('Finished creating all markers. Total on map:', (window as any).markers?.length || 0);
    
    }, 100); // Debounce delay
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [filteredPosts, mapLoaded, mapInstance]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading food map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading food posts: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Find Food on Campus</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSampleData}
              disabled={addingData || !user}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addingData ? 'Adding...' : 'Add Sample Data'}
            </Button>
            <Toggle
              pressed={showExpired}
              onPressedChange={setShowExpired}
              className="data-[state=on]:bg-orange-100 data-[state=on]:text-orange-800 data-[state=on]:border-orange-300"
            >
              Show Expired
            </Toggle>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <main className="flex-1">
        <ErrorBoundary fallback={
          <div className="h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Map temporarily unavailable</p>
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </div>
        }>
          <div className="h-[calc(100vh-100px)] relative">
            {/* Loading placeholder - only show when not loaded */}
            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white z-50">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading Sewanee campus map...</p>
                </div>
              </div>
            )}
            
            {/* Google Map Component */}
            <GoogleMapComponent
              key="sewanee-food-map"
              center={SEWANEE_CENTER}
              zoom={16}
              onMapReady={handleMapReady}
              className="w-full h-full bg-gray-100"
              style={{ minHeight: '400px' }}
            />
            
            {/* Map loaded indicator */}
            {mapLoaded && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-10">
                Map Loaded ✅
              </div>
            )}          {/* Post Count Badge */}
          <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-10">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-semibold text-sm">
                {filteredPosts.length} {showExpired ? 'Expired' : 'Active'} Posts
              </span>
            </div>
          </div>

          {/* Error Message */}
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
                <MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Map Loading Error
                </h3>
                <p className="text-muted-foreground mb-4">
                  {mapError}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          )}

          {/* No Posts Message */}
          {filteredPosts.length === 0 && mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No {showExpired ? 'expired' : 'active'} food posts
                </h3>
                <p className="text-muted-foreground mb-4">
                  {showExpired 
                    ? 'Switch to active posts to see available food on campus'
                    : 'Be the first to share food on campus!'
                  }
                </p>
                {!showExpired && (
                  <Button onClick={() => navigate('/share-food')} className="font-inter">
                    Share Food
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Map Legend */}
          {mapLoaded && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
              <h3 className="font-semibold text-sm mb-3 text-gray-800">Map Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                  <span className="text-gray-700">Active Food Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white"></div>
                  <span className="text-gray-700">Expired</span>
                </div>
              </div>
            </div>
          )}
        </div>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default FindFood;
