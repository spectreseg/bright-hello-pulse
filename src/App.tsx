import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ShareFood from "./pages/ShareFood";
import Notifications from "./pages/Notifications";
import FindFood from "./pages/FindFood";

const queryClient = new QueryClient();

const App = () => {
  // Load Google Maps globally once
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('App: Google Maps loading check:', { 
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'Missing',
      alreadyLoaded: !!(window as any).google?.maps,
      existingScripts: Array.from(document.querySelectorAll('script[src*="maps.googleapis.com"]')).length
    });
    
    if (!apiKey) {
      console.error('❌ App: VITE_GOOGLE_MAPS_API_KEY is missing!');
      return;
    }
    
    if ((window as any).google?.maps) {
      console.log('✅ App: Google Maps already loaded');
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('App: Google Maps script already exists, waiting for it to load...');
      return;
    }

    console.log('App: Creating Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.onload = () => {
      console.log('✅ App: Google Maps API loaded successfully');
      (window as any).googleMapsLoaded = true;
      console.log('App: Google Maps object available:', !!(window as any).google?.maps);
    };
    script.onerror = (error) => {
      console.error('❌ App: Failed to load Google Maps API', error);
    };
    
    console.log('App: Appending script to document head...');
    document.head.appendChild(script);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/share-food" element={<ShareFood />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/find-food" element={<FindFood />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
