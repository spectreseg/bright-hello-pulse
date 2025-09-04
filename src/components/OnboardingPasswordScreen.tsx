import React, { useEffect, useState } from 'react';

interface OnboardingPasswordScreenProps {
  onBack: () => void;
  onProceed: (passwordData: {password: string}) => void;
}

export default function OnboardingPasswordScreen({ onBack, onProceed }: OnboardingPasswordScreenProps) {
  const [tigerVisible, setTigerVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    console.log('OnboardingPasswordScreen mounted');
    
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Password form submitted:', formData);
    onProceed({password: formData.password});
  };

  return (
    <div className="min-h-screen relative z-10 overflow-hidden">
      {/* Main content */}
      <div className="min-h-screen flex flex-col items-center justify-between md:justify-center px-4 py-4 md:py-8">
        
        {/* Content container with tiger and speech bubble */}
        <div className="relative flex flex-col md:flex-row items-center justify-center flex-1 md:flex-none mt-8 md:mt-12">
          
          {/* Speech bubble - above tiger on mobile, to the right on desktop */}
          <div className={`relative md:absolute md:-top-8 md:left-80 z-20 mb-2 md:mb-0 order-1 md:order-none transition-opacity duration-700 ${bubbleVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white rounded-2xl p-2 md:p-3 shadow-2xl relative w-56 md:w-64 h-16 md:h-20 flex items-center justify-center">
              {/* Speech bubble tail - pointing down on mobile, down-left on desktop */}
              <div className="absolute md:bottom-0 md:left-12 bottom-0 left-1/2 md:left-12 transform md:translate-y-2 translate-y-2 -translate-x-1/2 md:translate-x-0">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-white"></div>
              </div>
              
              {/* Text content */}
              <div className="text-center">
                <p className="text-gray-900 text-sm md:text-base font-medium leading-tight">
                  Create a secure password
                </p>
              </div>
            </div>
          </div>
          
          {/* Monte mascot with spy look */}
          <div className={`flex-shrink-0 order-2 md:order-none transition-transform duration-1000 ease-out ${tigerVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <img
              src="/lovable-uploads/0665048e-ad40-4530-b849-0390b3667650.png"
              alt="Monte the Tiger Spy"
              className="w-[350px] h-[350px] md:w-[550px] md:h-[550px] object-contain drop-shadow-2xl"
              onLoad={() => console.log('Tiger spy image loaded successfully')}
              onError={() => console.log('Tiger spy image failed to load')}
            />
          </div>
          
        </div>

        {/* Desktop form container with side buttons */}
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
            
            {/* Form container - center */}
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-2 border-red-500' 
                      : 'border border-gray-300'
                  }`}
                  required
                />
              </div>
            </form>
            
            {/* Proceed button - right side */}
            <div className={`transition-all duration-700 ease-out ${buttonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <button
                onClick={() => onProceed({password: formData.password})}
                disabled={!formData.password || formData.password !== formData.confirmPassword}
                className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>

        {/* Mobile form and buttons */}
        <div className="md:hidden">
          {/* Form container */}
          <div className={`w-full max-w-md mx-auto mb-8 transition-all duration-700 ease-out ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-2 border-red-500' 
                      : 'border border-gray-300'
                  }`}
                  required
                />
              </div>
            </form>
          </div>

          {/* Mobile buttons - positioned at bottom */}
          <div className={`flex flex-col gap-3 w-full max-w-md mx-auto transition-all duration-700 ease-out ${buttonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Proceed button first on mobile */}
            <button
              onClick={() => onProceed({password: formData.password})}
              disabled={!formData.password || formData.password !== formData.confirmPassword}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed
            </button>
            
            {/* Back button second on mobile */}
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