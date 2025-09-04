import React, { useState } from 'react';
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
  const [currentMarker, setCurrentMarker] = useState<any>(null);

  // Handle map ready
  const handleMapReady = React.useCallback((map: any) => {
    setMapInstance(map);
    setMapLoaded(true);
    console.log('✅ LocationPicker map ready');

    // Add click listener for custom location selection
    map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedCoords({ lat, lng });
      
      // Clear existing marker
      if (currentMarker) {
        currentMarker.setMap(null);
      }
      
      // Add new marker
      const marker = new (window as any).google.maps.Marker({
        position: { lat, lng },
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
      
      setCurrentMarker(marker);
      console.log('LocationPicker: Selected coordinates:', { lat, lng });
    });
  }, [currentMarker]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!showPicker) {
      setMapLoaded(false);
      setSelectedCoords(null);
      setMapInstance(null);
      if (currentMarker) {
        currentMarker.setMap(null);
        setCurrentMarker(null);
      }
    }
  }, [showPicker, currentMarker]);

  // Handle building selection
  const handleBuildingSelect = (building: typeof SEWANEE_LOCATIONS[0]) => {
    const coords = { lat: building.coordinates.lat, lng: building.coordinates.lng };
    setSelectedCoords(coords);
    
    // Clear existing marker
    if (currentMarker) {
      currentMarker.setMap(null);
    }
    
    // Add marker for selected building
    if (mapInstance) {
      const marker = new (window as any).google.maps.Marker({
        position: coords,
        map: mapInstance,
        title: building.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#2563eb" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          `)}`,
          scaledSize: new (window as any).google.maps.Size(24, 24),
        }
      });
      
      setCurrentMarker(marker);
      mapInstance.setCenter(coords);
    }
  };

  // Handle current location
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedCoords(coords);
          
          if (mapInstance) {
            // Clear existing marker
            if (currentMarker) {
              currentMarker.setMap(null);
            }
            
            // Add marker for current location
            const marker = new (window as any).google.maps.Marker({
              position: coords,
              map: mapInstance,
              title: 'Current Location',
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#10b981" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `)}`,
                scaledSize: new (window as any).google.maps.Size(24, 24),
              }
            });
            
            setCurrentMarker(marker);
            mapInstance.setCenter(coords);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please select a location on the map or choose a building.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Handle selection confirmation
  const handleConfirm = () => {
    if (selectedCoords) {
      onChange('Custom Location', selectedCoords);
    }
    setShowPicker(false);
  };

  return (
    <>
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="font-inter"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(true)}
          className="w-full font-inter"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Pick Location on Map
        </Button>
      </div>

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pick Location
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 h-full">
            {/* Left side - Building list */}
            <div className="w-80 space-y-4">
              <Button
                onClick={handleCurrentLocation}
                variant="outline"
                className="w-full justify-start"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
              
              <div>
                <h3 className="font-semibold text-sm mb-2 text-gray-600">Campus Buildings:</h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {SEWANEE_LOCATIONS.map((location) => (
                    <Button
                      key={location.name}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleBuildingSelect(location)}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{location.name}</div>
                          <div className="text-xs text-gray-500">{location.type}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right side - Map */}
            <div className="flex-1 space-y-4">
              <div className="text-sm text-gray-600">
                Or click on the map to select:
              </div>
              
              <div className="h-96 border rounded-lg overflow-hidden relative">
                {showPicker && (
                  <GoogleMapComponent
                    key="location-picker-map"
                    center={SEWANEE_CENTER}
                    zoom={16}
                    onMapReady={handleMapReady}
                    className="w-full h-full"
                  />
                )}
                
                {!mapLoaded && showPicker && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedCoords && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ Location selected: {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPicker(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={!selectedCoords}
                >
                  Share Food
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationPicker;
