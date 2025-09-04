import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: (mode: 'login' | 'register') => void;
  onLogin: () => void;
}
export default function AuthForm({
  mode,
  onToggleMode,
  onLogin
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    accountType: 'student'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "You've been successfully logged in.",
          });
          onLogin();
        }
      } else {
        // Redirect to onboarding flow instead of registering directly
        onToggleMode('register');
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="bg-white rounded-2xl shadow-2xl w-full relative overflow-visible mt-16 sm:mt-20 md:mt-24">
      {/* TigerBites Text */}
      <div className="absolute -top-20 sm:-top-24 md:-top-28 left-1/2 transform -translate-x-1/2 z-30">
        <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center tracking-wide drop-shadow-lg">
          TigerBites
        </h1>
      </div>
      
      {/* Logo Section - positioned to straddle background and form */}
      <div className="absolute -top-12 sm:-top-16 md:-top-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 relative">
          <img src="/lovable-uploads/00927cad-9b22-41ba-9858-efcf7069f623.png" alt="Tiger Logo" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mt-16 sm:mt-20 md:mt-24 rounded-t-2xl overflow-hidden">
        <button onClick={() => onToggleMode('login')} className={`flex-1 py-3 sm:py-4 md:py-5 px-3 sm:px-5 md:px-7 text-sm sm:text-base md:text-lg text-center font-medium transition-smooth ${mode === 'login' ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
          Login
        </button>
        <button onClick={() => onToggleMode('register')} className={`flex-1 py-3 sm:py-4 md:py-5 px-3 sm:px-5 md:px-7 text-sm sm:text-base md:text-lg text-center font-medium transition-smooth ${mode === 'register' ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
          Register
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-8 md:p-10">
        {mode === 'login' ? (
          <>
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800 mb-3">
                Welcome Back
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-normal">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 md:py-5 text-base sm:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-smooth bg-gray-50 text-gray-800 placeholder-gray-500 font-normal" required />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 md:py-5 text-base sm:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-smooth bg-gray-50 text-gray-800 placeholder-gray-500 font-normal" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Eye className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                  <span className="ml-3 text-sm sm:text-base text-gray-600 font-normal">Remember me</span>
                </label>
                <button type="button" className="text-sm sm:text-base text-purple-600 hover:text-purple-700 transition-colors font-normal">
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 sm:py-4 md:py-5 px-6 text-base sm:text-lg rounded-xl font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800 mb-3">
                Join TigerBites
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-normal">
                Let's get you set up with your new account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    name="firstName" 
                    placeholder="First Name" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 sm:py-4 md:py-5 text-base sm:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-smooth bg-gray-50 text-gray-800 placeholder-gray-500 font-normal" 
                    required 
                  />
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="Last Name" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 sm:py-4 md:py-5 text-base sm:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-smooth bg-gray-50 text-gray-800 placeholder-gray-500 font-normal" 
                    required 
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 md:py-5 text-base sm:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-smooth bg-gray-50 text-gray-800 placeholder-gray-500 font-normal" 
                  required 
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  placeholder="Create Password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 md:py-5 text-base sm:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-smooth bg-gray-50 text-gray-800 placeholder-gray-500 font-normal" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Eye className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-800">Account Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative">
                    <input 
                      type="radio" 
                      name="accountType" 
                      value="student" 
                      checked={formData.accountType === 'student'}
                      onChange={handleInputChange}
                      className="peer sr-only" 
                    />
                    <div className="p-4 border-2 border-gray-300 rounded-xl cursor-pointer transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:border-purple-400">
                      <div className="text-center">
                        <div className="text-lg mb-1">🎓</div>
                        <div className="font-medium text-gray-800">Student</div>
                        <div className="text-sm text-gray-600">Order food delivery</div>
                      </div>
                    </div>
                  </label>
                  <label className="relative">
                    <input 
                      type="radio" 
                      name="accountType" 
                      value="restaurant" 
                      checked={formData.accountType === 'restaurant'}
                      onChange={handleInputChange}
                      className="peer sr-only" 
                    />
                    <div className="p-4 border-2 border-gray-300 rounded-xl cursor-pointer transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:border-purple-400">
                      <div className="text-center">
                        <div className="text-lg mb-1">🍽️</div>
                        <div className="font-medium text-gray-800">Restaurant</div>
                        <div className="text-sm text-gray-600">Sell your food</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-start">
                <input type="checkbox" className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1" required />
                <span className="ml-3 text-sm sm:text-base text-gray-600 font-normal">
                  I agree to the <button type="button" className="text-purple-600 hover:text-purple-700 underline">Terms of Service</button> and <button type="button" className="text-purple-600 hover:text-purple-700 underline">Privacy Policy</button>
                </span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 sm:py-4 md:py-5 px-6 text-base sm:text-lg rounded-xl font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Decorative elements */}
      
    </div>;
}