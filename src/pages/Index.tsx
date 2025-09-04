import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import StarryBackground from '@/components/StarryBackground';
import OnboardingScreen from '@/components/OnboardingScreen';
import OnboardingFormScreen from '@/components/OnboardingFormScreen';
import OnboardingPasswordScreen from '@/components/OnboardingPasswordScreen';
import OnboardingLocationScreen from '@/components/OnboardingLocationScreen';
import OnboardingAvatarScreen from '@/components/OnboardingAvatarScreen';
import OnboardingCompletionScreen from '@/components/OnboardingCompletionScreen';
import Dashboard from '@/components/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [onboardingStep, setOnboardingStep] = useState<'none' | 'intro' | 'form' | 'password' | 'location' | 'avatar' | 'completion'>('none');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Store onboarding data
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    avatar: null as File | null
  });

  
  // Preload all onboarding images for smooth transitions
  useEffect(() => {
    const preloadImages = () => {
      const imageUrls = [
        '/lovable-uploads/0ae562c5-5c88-4c2d-97cd-7d89c980721a.png', // Form screen tiger
        '/lovable-uploads/0665048e-ad40-4530-b849-0390b3667650.png', // Password screen tiger
        '/lovable-uploads/fc82ea5e-3e13-4240-8f8c-b4469c2153c4.png', // Location screen tiger
        '/lovable-uploads/4e2f3f60-20d2-4179-a8c3-d01aaedd6fb1.png', // Avatar screen tiger
        '/lovable-uploads/bb95d81e-f824-4762-aed3-c6fb2af3cfba.png'  // Completion screen tiger
      ];

      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    preloadImages();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    console.log('Login attempted - auth handled by AuthForm');
    // Authentication is now handled by AuthForm
  };

  const handleToggleMode = (mode: 'login' | 'register') => {
    console.log('handleToggleMode called with:', mode);
    setAuthMode(mode);
    if (mode === 'register') {
      console.log('Setting onboardingStep to intro');
      setOnboardingStep('intro');
    }
  };

  const handleOnboardingBack = () => {
    if (onboardingStep === 'avatar') {
      setOnboardingStep('location');
    } else if (onboardingStep === 'location') {
      setOnboardingStep('password');
    } else if (onboardingStep === 'password') {
      setOnboardingStep('form');
    } else if (onboardingStep === 'form') {
      setOnboardingStep('intro');
    } else {
      setOnboardingStep('none');
      setAuthMode('login');
    }
  };

  const handleOnboardingProceed = () => {
    if (onboardingStep === 'intro') {
      console.log('Moving to form step');
      setOnboardingStep('form');
    } else if (onboardingStep === 'form') {
      console.log('Moving to password step');
      setOnboardingStep('password');
    } else if (onboardingStep === 'password') {
      console.log('Moving to location step');
      setOnboardingStep('location');
    } else if (onboardingStep === 'location') {
      console.log('Moving to avatar step');
      setOnboardingStep('avatar');
    } else if (onboardingStep === 'avatar') {
      console.log('Moving to completion step');
      setOnboardingStep('completion');
    } else {
      setOnboardingStep('none');
      console.log('Completing registration');
    }
  };

  const handleFormBack = () => {
    setOnboardingStep('intro');
  };

  const handleFormProceed = (formData: {name: string, email: string}) => {
    setOnboardingData(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email
    }));
    setOnboardingStep('password');
    console.log('Moving to password step with data:', formData);
  };

  const handlePasswordBack = () => {
    setOnboardingStep('form');
  };

  const handlePasswordProceed = (passwordData: {password: string}) => {
    setOnboardingData(prev => ({
      ...prev,
      password: passwordData.password
    }));
    setOnboardingStep('location');
    console.log('Moving to location step with password set');
  };

  const handleLocationBack = () => {
    setOnboardingStep('password');
  };

  const handleLocationProceed = (locationData: {location: string}) => {
    setOnboardingData(prev => ({
      ...prev,
      location: locationData.location
    }));
    setOnboardingStep('avatar');
    console.log('Moving to avatar step with location:', locationData.location);
  };

  const handleAvatarBack = () => {
    setOnboardingStep('location');
  };

  const handleAvatarProceed = async (avatarData?: {avatar: File | null}) => {
    let avatarFile = null;
    if (avatarData?.avatar) {
      avatarFile = avatarData.avatar;
      setOnboardingData(prev => ({
        ...prev,
        avatar: avatarFile
      }));
    }
    
    // Now register the user with all collected data
    try {
      setLoading(true);
      const [firstName, ...lastNameParts] = onboardingData.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      console.log('Registering user with data:', {
        email: onboardingData.email,
        firstName,
        lastName,
        location: onboardingData.location,
        hasAvatar: !!avatarFile
      });

      // Check if we have all required data
      if (!onboardingData.email || !onboardingData.password || !onboardingData.name) {
        throw new Error('Missing required registration data');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: onboardingData.email,
        password: onboardingData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            location: onboardingData.location
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      console.log('User registered successfully:', data);
      
      // INSTANT transition to completion screen - no delays
      setOnboardingStep('completion');
      
      // Upload avatar after successful registration if we have one
      if (avatarFile && data.user) {
        try {
          console.log('Uploading avatar for new user:', data.user.id);
          
          // Create a path that follows the expected folder structure: {userId}/filename
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `avatar-${Date.now()}.${fileExt}`;
          const filePath = `${data.user.id}/${fileName}`;
          
          // Upload to storage with proper folder structure
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Avatar upload error:', uploadError);
          } else {
            console.log('Avatar uploaded successfully:', uploadData.path);
            
            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(uploadData.path);
            
            // Update the user's profile with the avatar URL
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ avatar_url: publicUrl })
              .eq('user_id', data.user.id);
              
            if (profileError) {
              console.error('Profile update error:', profileError);
            } else {
              console.log('Profile updated with avatar URL:', publicUrl);
            }
          }
        } catch (avatarError) {
          console.error('Avatar processing error:', avatarError);
          // Don't fail registration if avatar upload fails
        }
      }
      
      // Don't set completion here since we already did it after registration
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Load failed')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Invalid email address. Please check your email format.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password requirements not met. Please try a stronger password.';
        } else {
          errorMessage = `Registration failed: ${error.message}`;
        }
      }
      
      alert(errorMessage);
      
      // Reset to form step so user can try again
      setOnboardingStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletionFinish = () => {
    console.log('Registration completed, clearing onboarding and resetting to dashboard');
    setOnboardingStep('none');
    setOnboardingData({ name: '', email: '', password: '', location: '', avatar: null });
  };

  console.log('Current state - authMode:', authMode, 'onboardingStep:', onboardingStep, 'user:', user?.id);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <StarryBackground />
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }


  // Show dashboard if user is authenticated and not in onboarding
  if (user && onboardingStep === 'none') {
    console.log('Rendering dashboard');
    return <Dashboard onSignOut={() => {
      setUser(null);
      setSession(null);
      setOnboardingStep('none');
      setAuthMode('login');
    }} />;
  }

  // Show first onboarding screen
  if (onboardingStep === 'intro') {
    console.log('Rendering intro onboarding screen');
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <OnboardingScreen 
          onBack={handleOnboardingBack}
          onProceed={handleOnboardingProceed}
        />
      </div>
    );
  }

  // Show avatar onboarding screen
  if (onboardingStep === 'avatar') {
    console.log('Rendering avatar onboarding screen');
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <OnboardingAvatarScreen 
          onBack={handleAvatarBack}
          onProceed={handleAvatarProceed}
        />
      </div>
    );
  }

  // Show completion onboarding screen
  if (onboardingStep === 'completion') {
    console.log('Rendering completion onboarding screen');
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <OnboardingCompletionScreen 
          onComplete={handleCompletionFinish}
        />
      </div>
    );
  }

  // Show form onboarding screen
  if (onboardingStep === 'form') {
    console.log('Rendering form onboarding screen');
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <OnboardingFormScreen 
          onBack={handleFormBack}
          onProceed={handleFormProceed}
        />
      </div>
    );
  }

  // Show password onboarding screen
  if (onboardingStep === 'password') {
    console.log('Rendering password onboarding screen');
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <OnboardingPasswordScreen 
          onBack={handlePasswordBack}
          onProceed={handlePasswordProceed}
        />
      </div>
    );
  }

  // Show location onboarding screen
  if (onboardingStep === 'location') {
    console.log('Rendering location onboarding screen');
    return (
      <div className="min-h-screen relative">
        <StarryBackground />
        <OnboardingLocationScreen 
          onBack={handleLocationBack}
          onProceed={handleLocationProceed}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative pt-20">
      <StarryBackground />
      <div className="w-full max-w-lg relative z-10">
        <AuthForm 
          mode={authMode}
          onToggleMode={handleToggleMode}
          onLogin={handleLogin}
        />
      </div>
    </div>
  );
};

export default Index;
