import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SEWANEE_LOCATIONS } from '@/utils/sewaneeLocations';
import GoogleMapComponent from './GoogleMapComponent';

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
}

const SEWANEE_CENTER = { lat: 35.2042, lng: -85.9217 };

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "e.g., Gailor Hall lobby, McClurg dining hall" 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize map when picker opens
  useEffect(() => {
    if (!showPicker) {
      setMapLoaded(false);
      setSelectedCoords(null);
      return;
    }

    if (mapLoaded || !mapRef.current) return;

    let retryCount = 0;
    const maxRetries = 50;

    const initMap = () => {
      if (!mapRef.current) return;
      
      // Check if Google Maps is available
      if (!(window as any).google?.maps) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`LocationPicker: Waiting for Google Maps... (${retryCount}/${maxRetries})`);
          setTimeout(initMap, 100);
          return;
        } else {
          console.error('LocationPicker: Failed to load Google Maps after maximum retries');
          return;
        }
      }
      
      console.log('LocationPicker: Initializing map...');
      
      try {
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: SEWANEE_CENTER,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add click listener for location selection
        map.addListener('click', (event: any) => {
          const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          setSelectedCoords(coords);
          
          // Clear existing markers
          if ((window as any).locationMarker) {
            (window as any).locationMarker.setMap(null);
          }
          
          // Add marker at clicked location
          const marker = new (window as any).google.maps.Marker({
            position: coords,
            map: map,
            title: 'Selected Location',
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="white"/>
                </svg>
              `)}`,
              scaledSize: new (window as any).google.maps.Size(24, 24),
            }
          });
          
          (window as any).locationMarker = marker;
        });

        (window as any).locationPickerMap = map;
        setMapLoaded(true);
        console.log('✅ LocationPicker: Map initialized successfully');
      } catch (error) {
        console.error('LocationPicker: Error initializing map:', error);
      }
    };

    // Start trying to initialize the map
    setTimeout(initMap, 100); // Small delay to ensure DOM is ready
  }, [showPicker]);

  const handleLocationSelect = (locationName: string, coords?: { lat: number; lng: number }) => {
    onChange(locationName, coords);
    setShowPicker(false);
    setSelectedCoords(null);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSelectedCoords(coords);
        onChange('Current Location', coords);
        setShowPicker(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location');
      }
    );
  };

  const handleMapLocationConfirm = () => {
    if (selectedCoords) {
      onChange('Custom Location', selectedCoords);
      setShowPicker(false);
      setSelectedCoords(null);
    }
  };

  return (
    <div>
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(true)}
          className="w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Choose Location
        </Button>
      </div>

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pick Location
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">
            {/* Location List */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleCurrentLocation}
                  className="w-full justify-start"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>
                
                <div className="text-sm font-semibold text-muted-foreground">Campus Buildings:</div>
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {SEWANEE_LOCATIONS.map((location) => (
                    <Button
                      key={location.name}
                      variant="ghost"
                      onClick={() => handleLocationSelect(location.name, location.coordinates)}
                      className="w-full justify-start text-left h-auto py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{location.type}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground">
                Or click on the map to select:
              </div>
              
              {/* Map Container */}
              <div className="relative">
                <div
                  ref={mapRef}
                  className="w-full h-64 bg-gray-100 rounded-lg border"
                  style={{ minHeight: '256px' }}
                >
                  {!mapLoaded && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedCoords && (
                  <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded shadow text-xs">
                    📍 {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                  </div>
                )}
              </div>

              {selectedCoords && (
                <Button 
                  onClick={handleMapLocationConfirm}
                  className="w-full"
                >
                  Use Selected Location
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationPicker;
