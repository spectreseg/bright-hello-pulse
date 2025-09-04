import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SEWANEE_LOCATIONS } from '@/utils/sewaneeLocations';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [customLocationName, setCustomLocationName] = useState<string>('');
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const isMobile = useIsMobile();
  
  // Chrome detection for specific fixes
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

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
    setSelectedLocationName(building.name);
    setCustomLocationName(''); // Clear custom name when selecting predefined location
    
    // Clear existing marker and create new one using setCurrentMarker callback
    if (mapInstance) {
      setCurrentMarker((prevMarker: any) => {
        if (prevMarker) {
          prevMarker.setMap(null);
        }
        
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
        
        mapInstance.setCenter(coords);
        return marker;
      });
    }
  };

  // Handle map ready
  const handleMapReady = React.useCallback((map: any) => {
    setMapInstance(map);
    setMapLoaded(true);
    
    // Add existing campus location markers
    SEWANEE_LOCATIONS.forEach((location) => {
      new (window as any).google.maps.Marker({
        position: location.coordinates,
        map: map,
        title: location.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#6b7280" stroke="white" stroke-width="2"/>
              <rect x="8" y="8" width="8" height="8" fill="white" rx="1"/>
            </svg>
          `)}`,
          scaledSize: new (window as any).google.maps.Size(20, 20),
        }
      });
    });

    // Handle map click for custom location selection
    map.addListener('click', (event: any) => {
      console.log('Map clicked at:', event.latLng.lat(), event.latLng.lng());
      
      const coords = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      
      setSelectedCoords(coords);
      setSelectedLocationName(''); // Clear predefined location name for custom selection
      
      // Clear existing marker using setCurrentMarker callback
      setCurrentMarker((prevMarker: any) => {
        if (prevMarker) {
          prevMarker.setMap(null);
        }
        
        // Create new marker
        const marker = new (window as any).google.maps.Marker({
          position: coords,
          map: map,
          title: 'Selected Location',
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#ff4444" stroke="white" stroke-width="2"/>
                <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
              </svg>
            `)}`,
            scaledSize: new (window as any).google.maps.Size(24, 24),
          }
        });
        
        return marker;
      });
    });
  }, []);

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
          setSelectedLocationName('Current Location');
          setCustomLocationName('');
          
          if (mapInstance) {
            setCurrentMarker((prevMarker: any) => {
              // Clear existing marker
              if (prevMarker) {
                prevMarker.setMap(null);
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
              
              mapInstance.setCenter(coords);
              return marker;
            });
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
      const locationName = selectedLocationName || customLocationName || 'Custom Location';
      onChange(locationName, selectedCoords);
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
        <DialogContent 
          className={`${
            isMobile 
              ? `${isChrome ? 'mobile-dialog-chrome' : ''} dialog-chrome-fix w-[95vw] max-w-[95vw] vh-chrome-fix overflow-hidden` 
              : 'max-w-4xl h-[80vh]'
          } flex-chrome-fix flex-col`}
          style={isMobile && isChrome ? {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95vw',
            maxWidth: '95vw',
            height: '85vh',
            maxHeight: '85vh',
            margin: 0
          } : undefined}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pick Location
            </DialogTitle>
          </DialogHeader>
          
          <div className={`flex ${isMobile ? 'flex-col flex-1 overflow-hidden' : 'gap-4 h-full'}`}>
            {/* Left side - Building list */}
            <div className={`${isMobile ? 'w-full flex-shrink-0 mb-4' : 'w-80'} space-y-4`}>
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
                <div className={`space-y-1 ${isMobile ? 'max-h-24 overflow-y-auto' : 'max-h-96 overflow-y-auto'} border rounded-md`}>
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
            <div className={`${isMobile ? 'w-full flex-1 flex flex-col overflow-hidden' : 'flex-1'} space-y-4`}>
              <div className="text-sm text-gray-600 flex-shrink-0">
                Or click on the map to select a custom location:
              </div>
              
              {/* Custom Location Name Input - Only show when map location is selected and no predefined location */}
              {selectedCoords && !selectedLocationName && (
                <div className="flex-shrink-0">
                  <label className="text-sm font-medium mb-2 block">Name this location:</label>
                  <Input
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    placeholder="Enter a name for this location (e.g., 'Near Library', 'Academic Quad')"
                    className="w-full"
                  />
                </div>
              )}
              
              <div className={`${isMobile ? 'h-48 flex-shrink-0' : 'h-96'} border rounded-lg overflow-hidden relative`}>
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
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded flex-shrink-0">
                  <div className="font-medium">✅ Location selected:</div>
                  <div className="mt-1">
                    <strong>{selectedLocationName || customLocationName || 'Custom Location'}</strong>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                  </div>
                </div>
              )}
              
              <div className={`flex gap-2 ${isMobile ? 'flex-col mt-auto pt-4 flex-shrink-0' : 'justify-end'}`}>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPicker(false)}
                  className={`${isMobile ? 'w-full' : ''} min-h-[40px]`}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={!selectedCoords}
                  className={`${isMobile ? 'w-full' : ''} min-h-[40px]`}
                >
                  Confirm Location
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
