import React, { useState } from 'react';
import { Camera, ArrowLeft, MapPin, Users, Clock, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { LocationPicker } from '@/components/LocationPicker';
import { useIsMobile } from '@/hooks/use-mobile';

// @ts-ignore - HEIC convert library  
import heic2any from 'heic2any';

export default function ShareFood() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    coordinates: null as { lat: number; lng: number } | null,
    servings: '',
    availableUntil: null as Date | null
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    setFormData(prev => ({ 
      ...prev, 
      location,
      coordinates: coordinates || null
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    handleInputChange('description', textarea.value);
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      console.log('Converting HEIC file:', file.name, file.type);
      
      // Create a canvas to convert the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Create image element
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const newFileName = file.name.replace(/\.(heic|HEIC)$/i, '.jpg');
                const convertedFile = new File([blob], newFileName, {
                  type: 'image/jpeg',
                });
                console.log('HEIC conversion successful:', convertedFile.name);
                resolve(convertedFile);
              } else {
                reject(new Error('Canvas conversion failed'));
              }
            }, 'image/jpeg', 0.8);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load HEIC image'));
        };
        
        // Convert file to blob URL for the image
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      // Return original file if conversion fails
      console.log('Falling back to original file');
      return file;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);
    setIsUploading(true);
    
    try {
      let processedFile = file;
      
      // Check if file is HEIC and convert it
      const isHeic = file.type === 'image/heic' || 
                     file.type === 'image/HEIC' || 
                     file.name.toLowerCase().endsWith('.heic') ||
                     file.name.toLowerCase().endsWith('.HEIC');
      
      if (isHeic) {
        console.log('Detected HEIC file, converting...');
        try {
          processedFile = await convertHeicToJpeg(file);
        } catch (conversionError) {
          console.warn('HEIC conversion failed, using original file:', conversionError);
          // Use original file if conversion fails
          processedFile = file;
        }
      }
      
      setImageFile(processedFile);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(processedFile);
      setImagePreview(previewUrl);
      console.log('Image processing complete, preview created');
    } catch (error) {
      console.error('Error processing image:', error);
      alert(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.availableUntil) {
      alert('Please select an available until date and time');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to share food');
        return;
      }

      console.log('Starting food post submission for user:', user.id);
      let finalImageUrl = null;

      // Upload image to Supabase Storage if an image was selected
      if (imageFile) {
        console.log('Uploading image to storage...');
        
        // Create a unique filename
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `food-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to food-images bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          alert('Failed to upload image. Please try again.');
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('food-images')
          .getPublicUrl(uploadData.path);

        finalImageUrl = publicUrl;
        console.log('Image uploaded successfully:', finalImageUrl);
      }

      // Create the food post with proper user_id and image URL
      console.log('Creating food post with data:', {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        servings: formData.servings,
        image_url: finalImageUrl,
        expires_at: formData.availableUntil.toISOString()
      });

      // Prepare location data - keep location string clean, store coordinates separately
      const postData: any = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        servings: formData.servings,
        image_url: finalImageUrl,
        expires_at: formData.availableUntil.toISOString()
      };

      // Add coordinates if available
      if (formData.coordinates) {
        postData.latitude = formData.coordinates.lat;
        postData.longitude = formData.coordinates.lng;
        console.log('Storing coordinates:', formData.coordinates);
      }

      const { error } = await supabase
        .from('food_posts')
        .insert([postData]);

      if (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
        return;
      }

      console.log('Food post created successfully');
      // Redirect to dashboard immediately
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content with Back Button */}
      <main className="w-full px-6 py-6 pb-20">
        <div className={`${isMobile ? 'flex flex-col' : 'flex gap-8'} max-w-6xl mx-auto`}>
          {/* Back Button - Left Side */}
          <div className={`${isMobile ? 'w-full mb-4' : 'flex-shrink-0 pt-16'}`}>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className={`flex items-center gap-3 text-foreground hover:text-foreground transition-all duration-200 px-6 py-3 rounded-lg h-12 text-lg font-inter font-bold hover:scale-105 ${isMobile ? 'w-full justify-center' : ''}`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-bold">Dashboard</span>
            </Button>
          </div>

          {/* Form Container */}
          <div className={`${isMobile ? 'w-full' : 'flex-1 max-w-2xl'}`}>
            <Card className="bg-white border-border/20 shadow-2xl rounded-3xl overflow-hidden ring-4 ring-purple-400/40 shadow-purple-500/30">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  {/* Tiger Image - Bigger with minimal gap */}
                  <div className="flex justify-center">
                    <div className="w-40 h-40 animate-fade-in">
                      <img 
                        src="/lovable-uploads/3a3c3b4a-16c4-4156-b27c-44f006547e86.png" 
                        alt="Monte Tiger" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-playfair font-bold text-foreground mb-3 tracking-wide animate-fade-in">
                    Share Food
                  </h2>
                  <p className="text-muted-foreground font-inter text-lg leading-relaxed animate-fade-in max-w-md mx-auto">
                    You&apos;re making Sewanee better
                  </p>
                </div>

              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in"
                    style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label className="text-lg font-inter font-bold text-foreground">
                    Photo <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*,.heic,.HEIC"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <div className="w-40 h-32 border-3 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 group shadow-lg hover:shadow-xl">
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-2"></div>
                              <div className="text-foreground text-sm font-semibold">Processing...</div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <Camera className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors mb-2" />
                              <div className="text-foreground text-sm font-semibold">
                                Click to upload
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                    <div className="flex-1">
                      {imagePreview ? (
                        <div className="bg-gradient-to-br from-muted/10 to-muted/20 rounded-xl p-4 h-32 flex items-center justify-center border-2 border-border/10 shadow-inner">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                          />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-muted/10 to-muted/20 rounded-xl p-4 h-32 flex items-center justify-center border-2 border-border/10">
                          <span className="text-muted-foreground font-inter text-lg">Preview will appear here</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Food Title */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-lg font-inter font-bold text-foreground">
                    Food Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Pizza from event, Leftover sandwiches"
                    required
                    className="h-12 text-lg font-inter bg-white border-2 border-border/30 focus:border-primary rounded-xl shadow-sm focus:shadow-md transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-inter font-bold text-foreground">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe the food, any allergens, pickup instructions..."
                    required
                    rows={1}
                    className="text-lg font-inter bg-white border-2 border-border/30 focus:border-primary resize-none rounded-xl shadow-sm focus:shadow-md transition-all duration-200 p-4 min-h-[48px] placeholder:text-base"
                    style={{ overflow: 'hidden' }}
                  />
                </div>

                {/* Pickup Location */}
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-lg font-inter font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Pickup Location <span className="text-destructive">*</span>
                  </Label>
                  <LocationPicker
                    value={formData.location}
                    onChange={handleLocationChange}
                    placeholder="e.g., Gailor Hall lobby, McClurg dining hall"
                  />
                  {formData.coordinates && (
                    <div className="text-xs text-muted-foreground">
                      📍 Coordinates: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of Servings */}
                  <div className="space-y-3">
                    <Label htmlFor="servings" className="text-lg font-inter font-bold text-foreground flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Number of Servings <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="servings"
                      value={formData.servings}
                      onChange={(e) => handleInputChange('servings', e.target.value)}
                      placeholder="e.g., 5 servings"
                      required
                      className="h-12 text-lg font-inter bg-white border-2 border-border/30 focus:border-primary rounded-xl shadow-sm focus:shadow-md transition-all duration-200"
                    />
                  </div>

                  {/* Available Until */}
                  <div className="space-y-3">
                    <Label className="text-lg font-inter font-bold text-foreground flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Available Until <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 text-lg font-inter bg-white border-2 border-purple-300 focus:border-purple-600 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 text-purple-700 justify-start text-left",
                            !formData.availableUntil && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {formData.availableUntil ? (
                              format(formData.availableUntil, "MMM d, yyyy 'at' h:mm a")
                            ) : (
                              "Pick date and time"
                            )}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.availableUntil}
                          onSelect={(date) => {
                            if (date) {
                              // Set default time to current hour + 1
                              const now = new Date();
                              date.setHours(now.getHours() + 1, 0, 0, 0);
                              handleInputChange('availableUntil', date);
                            } else {
                              handleInputChange('availableUntil', null);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0); // Start of today
                            return date < today;
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                        {formData.availableUntil && (
                          <div className="p-4 border-t bg-muted/20">
                            <Label className="text-sm font-medium text-purple-700 mb-2 block">Set Time</Label>
                            <div className="flex gap-2 items-center">
                              <select
                                value={formData.availableUntil.getHours() % 12 || 12}
                                onChange={(e) => {
                                  const newDate = new Date(formData.availableUntil!);
                                  const hour12 = parseInt(e.target.value);
                                  const isPM = formData.availableUntil!.getHours() >= 12;
                                  const hour24 = isPM ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
                                  newDate.setHours(hour24);
                                  handleInputChange('availableUntil', newDate);
                                }}
                                className="px-3 py-2 border border-purple-300 rounded-lg text-sm font-medium focus:border-purple-600 focus:outline-none"
                              >
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                              <span className="text-purple-700 font-bold">:</span>
                              <select
                                value={formData.availableUntil.getMinutes()}
                                onChange={(e) => {
                                  const newDate = new Date(formData.availableUntil!);
                                  newDate.setMinutes(parseInt(e.target.value));
                                  handleInputChange('availableUntil', newDate);
                                }}
                                className="px-3 py-2 border border-purple-300 rounded-lg text-sm font-medium focus:border-purple-600 focus:outline-none"
                              >
                                {[0, 15, 30, 45].map((minute) => (
                                  <option key={minute} value={minute}>
                                    {minute.toString().padStart(2, '0')}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={formData.availableUntil.getHours() >= 12 ? 'PM' : 'AM'}
                                onChange={(e) => {
                                  const newDate = new Date(formData.availableUntil!);
                                  const currentHour = newDate.getHours();
                                  const isPM = e.target.value === 'PM';
                                  const hour12 = currentHour % 12 || 12;
                                  const hour24 = isPM ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
                                  newDate.setHours(hour24);
                                  handleInputChange('availableUntil', newDate);
                                }}
                                className="px-3 py-2 border border-purple-300 rounded-lg text-sm font-medium focus:border-purple-600 focus:outline-none"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 h-12 text-lg font-inter font-bold rounded-xl border-2 hover:bg-muted/50 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 font-inter font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover-scale"
                  >
                    Share Food
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
  );
}