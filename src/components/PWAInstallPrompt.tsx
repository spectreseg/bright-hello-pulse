import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  if (isIOS && !isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/3a3c3b4a-16c4-4156-b27c-44f006547e86.png" 
                alt="App Icon" 
                className="w-8 h-8 rounded"
              />
              <h3 className="font-semibold text-gray-900">Install Sewanee Food Share</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Add to your home screen for quick access. Tap the share button <span className="inline-block">📤</span> then "Add to Home Screen"
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/3a3c3b4a-16c4-4156-b27c-44f006547e86.png" 
                alt="App Icon" 
                className="w-8 h-8 rounded"
              />
              <h3 className="font-semibold text-gray-900">Install Sewanee Food Share</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Get the full app experience with offline access and notifications
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstallClick} size="sm">
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                Maybe Later
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;
