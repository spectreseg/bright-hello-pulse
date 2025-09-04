import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

interface OnboardingLocationScreenProps {
  onBack: () => void;
  onProceed: (locationData: {location: string}) => void;
}

export default function OnboardingLocationScreen({ onBack, onProceed }: OnboardingLocationScreenProps) {
  const [tigerVisible, setTigerVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationData, setLocationData] = useState('');

  useEffect(() => {
    console.log('OnboardingLocationScreen mounted');
    
    // Tiger flies up first
    const tigerTimer = setTimeout(() => {
      console.log('Tiger animation triggered');
      setTigerVisible(true);
    }, 300);

    // Bubble fades in after tiger
    const bubbleTimer = setTimeout(() => {
      console.log('Bubble animation triggered');
      setBubbleVisible(true);
    }, 800);

    // Form appears after bubble
    const formTimer = setTimeout(() => {
      console.log('Form animation triggered');
      setFormVisible(true);
    }, 1300);

    // Buttons fly up last
    const buttonsTimer = setTimeout(() => {
      console.log('Buttons animation triggered');
      setButtonsVisible(true);
    }, 1800);

    return () => {
      clearTimeout(tigerTimer);
      clearTimeout(bubbleTimer);
      clearTimeout(formTimer);
      clearTimeout(buttonsTimer);
    };
  }, []);

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location granted:', position.coords);
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          console.log('Setting location data:', coords);
          setLocationData(coords);
          setLocationGranted(true);
          console.log('Location state updated - granted: true');
        },
        (error) => {
          console.log('Location denied:', error);
          alert('Location access is required to continue. Please allow location access and try again.');
        }
      );
    } else {
      console.log('Geolocation not supported');
      alert('Geolocation is not supported by your browser. Please use a modern browser.');
    }
  };

  const handleProceed = () => {
    console.log('Proceed clicked - locationGranted:', locationGranted, 'locationData:', locationData);
    
    if (locationGranted && locationData) {
      console.log('Proceeding with location:', locationData);
      onProceed({location: locationData});
    } else {
      console.log('Proceeding without location');
      onProceed({location: 'not_provided'});
    }
  };

  return (
    <div className="min-h-screen relative z-10 overflow-hidden">
      {/* Main content */}
      <div className="min-h-screen flex flex-col items-center justify-between md:justify-center px-4 py-4 md:py-8">
        
        {/* Content container with tiger and speech bubble */}
        <div className="relative flex flex-col md:flex-row items-center justify-center flex-1 md:flex-none mt-8 md:mt-12">
          
          {/* Speech bubble - above tiger on mobile, to the right on desktop */}
          <div className={`relative md:absolute md:-top-12 md:left-80 z-20 mb-2 md:mb-0 order-1 md:order-none transition-opacity duration-700 ${bubbleVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white rounded-2xl p-2 md:p-3 shadow-2xl relative w-64 md:w-72 h-20 md:h-24 flex items-center justify-center">
              {/* Speech bubble tail - pointing down on mobile, down-left on desktop */}
              <div className="absolute md:bottom-0 md:left-12 bottom-0 left-1/2 md:left-12 transform md:translate-y-2 translate-y-2 -translate-x-1/2 md:translate-x-0">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-white"></div>
              </div>
              
              {/* Text content */}
              <div className="text-center">
                <p className="text-gray-900 text-sm md:text-base font-medium leading-tight">
                  Please enable location<br />
                  services for the best<br />
                  experience.
                </p>
              </div>
            </div>
          </div>
          
          {/* Monte mascot with map */}
          <div className={`flex-shrink-0 order-2 md:order-none transition-transform duration-1000 ease-out ${tigerVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <img
              src="/lovable-uploads/fc82ea5e-3e13-4240-8f8c-b4469c2153c4.png"
              alt="Monte the Tiger with Map"
              className="w-[350px] h-[350px] md:w-[550px] md:h-[550px] object-contain drop-shadow-2xl"
              onLoad={() => console.log('Tiger map image loaded successfully')}
              onError={() => console.log('Tiger map image failed to load')}
            />
          </div>
          
        </div>

        {/* Desktop button container with side buttons */}
        <div className={`hidden md:block w-full max-w-4xl mx-auto mb-8 transition-all duration-700 ease-out ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-center gap-8">
            {/* Back button - left side */}
            <div className={`transition-all duration-700 ease-out ${buttonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <button
                onClick={onBack}
                type="button"
                className="bg-white text-purple-600 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-purple-300"
              >
                Back
              </button>
            </div>
            
            {/* Location button - center */}
            <div className="w-full max-w-md">
              <button
                onClick={handleLocationRequest}
                className={`w-full px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 flex items-center justify-center gap-2 ${
                  locationGranted 
                    ? 'bg-green-200 text-green-700 border-green-300' 
                    : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                }`}
                disabled={locationGranted}
              >
                <MapPin size={20} />
                {locationGranted ? 'Location Enabled ✓' : 'Use my location'}
              </button>
            </div>
            
            {/* Proceed button - right side */}
            <div className={`transition-all duration-700 ease-out ${buttonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <button
                onClick={handleProceed}
                className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-purple-600"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden">
          {/* Location button container */}
          <div className={`w-full max-w-md mx-auto mb-8 transition-all duration-700 ease-out ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <button
              onClick={handleLocationRequest}
              className={`w-full px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 flex items-center justify-center gap-2 ${
                locationGranted 
                  ? 'bg-green-200 text-green-700 border-green-300' 
                  : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
              }`}
              disabled={locationGranted}
            >
              <MapPin size={20} />
              {locationGranted ? 'Location Enabled ✓' : 'Use my location'}
            </button>
          </div>

          {/* Mobile buttons */}
          <div className={`flex flex-col gap-3 w-full max-w-md mx-auto transition-all duration-700 ease-out ${buttonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Proceed button */}
            <button
              onClick={handleProceed}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-purple-600"
            >
              Proceed
            </button>
            
            {/* Back button */}
            <button
              onClick={onBack}
              type="button"
              className="w-full bg-white text-purple-600 px-6 py-3 rounded-xl text-base font-semibold hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-purple-300"
            >
              Back
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}