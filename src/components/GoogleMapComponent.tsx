import React, { useEffect, useRef } from 'react';

interface GoogleMapComponentProps {
  center: { lat: number; lng: number };
  zoom: number;
  onMapReady: (map: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center,
  zoom,
  onMapReady,
  className = '',
  style = {}
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = () => {
      if (!isMounted || !mapRef.current) return;
      
      // Check if Google Maps is available
      if (!(window as any).google?.maps) {
        console.log('Waiting for Google Maps to load...');
        setTimeout(initializeMap, 100);
        return;
      }

      try {
        // Create the map
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;
        
        // Trigger resize after a short delay
        setTimeout(() => {
          if (isMounted && (window as any).google?.maps?.event && map) {
            (window as any).google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          }
        }, 100);

        // Notify parent component
        setTimeout(() => {
          if (isMounted) {
            onMapReady(map);
          }
        }, 200);
        
        console.log('✅ GoogleMapComponent: Map initialized successfully');
      } catch (error) {
        console.error('GoogleMapComponent: Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      // Clean up Google Maps listeners
      if (mapInstanceRef.current) {
        try {
          (window as any).google?.maps?.event?.clearInstanceListeners?.(mapInstanceRef.current);
        } catch (e) {
          // Silent cleanup
        }
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lng, zoom, onMapReady]);

  // Use a key to force re-mount if needed
  return (
    <div
      key="google-map-container"
      ref={mapRef}
      className={className}
      style={style}
      suppressHydrationWarning={true}
    />
  );
};

export default GoogleMapComponent;
