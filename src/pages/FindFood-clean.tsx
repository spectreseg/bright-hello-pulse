import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { findLocationCoordinates } from '@/utils/sewaneeLocations';

interface FoodPost {
  id: string;
  title: string;
  description: string;
  location: string;
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
  const mapRef = useRef<HTMLDivElement>(null);
  const [showExpired, setShowExpired] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

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

  // Fetch food posts
  const { data: foodPosts = [], isLoading, error } = useQuery({
    queryKey: ['food-posts-map'],
    queryFn: async () => {
      console.log('Fetching food posts for map...');
      
      const { data: posts, error } = await supabase
        .from('food_posts')
        .select(`
          id,
          title,
          description,
          location,
          servings,
          image_url,
          created_at,
          updated_at,
          expires_at,
          user_id,
          finished_by,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching food posts:', error);
        throw error;
      }

      console.log('Raw posts fetched:', posts);

      // Process posts to include location coordinates
      const postsWithProfiles = posts.map(post => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      }));

      console.log('Posts with profiles:', postsWithProfiles);

      return postsWithProfiles;
    },
  });

  // Filter posts based on expiration and toggle state
  const filteredPosts = React.useMemo(() => {
    const now = new Date();
    return foodPosts.filter(post => {
      const isExpired = new Date(post.expires_at) < now;
      return showExpired ? isExpired : !isExpired;
    });
  }, [foodPosts, showExpired]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || mapLoaded || mapError) return;

    const apiKey = "AIzaSyBKU09BeZYU7NJLAmx4JX56l-Gk1kSUdjY";
    if (!apiKey) {
      setMapError('Google Maps API key not found');
      return;
    }

    // Check if Google Maps is already loaded
    if ((window as any).google?.maps) {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: SEWANEE_CENTER,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      });
      (window as any).mapInstance = map;
      setMapLoaded(true);
      return;
    }

    // Load Google Maps script
    const callbackName = 'initMap_' + Date.now();
    (window as any)[callbackName] = () => {
      if (mapRef.current) {
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: SEWANEE_CENTER,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });
        (window as any).mapInstance = map;
        setMapLoaded(true);
      }
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps');
      delete (window as any)[callbackName];
    };

    document.head.appendChild(script);
  }, [mapLoaded, mapError]);

  // Add markers when posts change
  useEffect(() => {
    if (!mapLoaded || !(window as any).mapInstance || !(window as any).google?.maps) {
      return;
    }

    // Clear existing markers
    if ((window as any).markers) {
      (window as any).markers.forEach((marker: any) => marker.setMap(null));
    }

    const validPosts = filteredPosts.filter(post => {
      const coords = findLocationCoordinates(post.location);
      return coords !== null;
    });

    console.log('Adding markers for', validPosts.length, 'posts');

    validPosts.forEach(post => {
      const coords = findLocationCoordinates(post.location);
      if (!coords) return;

      console.log('Creating marker for:', post.title, 'at', post.location);

      const marker = new (window as any).google.maps.Marker({
        position: coords,
        map: (window as any).mapInstance,
        title: post.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="${showExpired ? '#6b7280' : '#10b981'}" stroke="white" stroke-width="2"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(24, 24),
        }
      });

      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div style="max-width: 280px; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              ${post.title}
            </h3>
            
            <div style="margin-bottom: 8px; font-size: 14px; color: #4b5563;">
              📍 <strong>${post.location}</strong>
            </div>
            
            <div style="margin-bottom: 8px; font-size: 13px; color: #6b7280;">
              ${post.description}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px;">
              <span style="color: #6b7280;">🍽️ ${post.servings} servings</span>
              <span style="color: #6b7280;">👤 ${post.profiles?.first_name || 'Anonymous'}</span>
            </div>
            
            <div style="margin-bottom: 8px; font-size: 13px; color: #6b7280;">
              ⏰ ${new Date(post.expires_at).toLocaleString()}
            </div>
            
            ${post.finished_by && post.finished_by.length > 0 ? 
              `<div style="font-size: 12px; color: #059669; font-weight: 600;">✅ ${post.finished_by.length} marked as finished</div>` : 
              ''
            }
          </div>
        `,
      });

      marker.addListener('click', () => {
        if ((window as any).currentInfoWindow) {
          (window as any).currentInfoWindow.close();
        }
        infoWindow.open((window as any).mapInstance, marker);
        (window as any).currentInfoWindow = infoWindow;
      });

      (window as any).markers = (window as any).markers || [];
      (window as any).markers.push(marker);
    });
  }, [filteredPosts, mapLoaded]);

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
        <div className="h-[calc(100vh-100px)] relative">
          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full bg-gray-100"
            style={{ minHeight: '400px' }}
          >
            {/* Loading placeholder */}
            {!mapLoaded && !mapError && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading Sewanee campus map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Post Count Badge */}
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
      </main>
    </div>
  );
};

export default FindFood;
