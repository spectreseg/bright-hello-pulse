import React from 'react';
import { TrendingUp, Map, Plus, Bell, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavProps {
  unreadCount?: number;
  onMyPosts?: () => void;
  showMyPosts?: boolean;
}

export function MobileNav({ unreadCount = 0, onMyPosts, showMyPosts = false }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      icon: TrendingUp, 
      label: 'My Posts', 
      action: onMyPosts,
      isActive: showMyPosts
    },
    { 
      icon: Map, 
      label: 'Find Food', 
      action: () => navigate('/find-food'),
      isActive: location.pathname === '/find-food'
    },
    { 
      icon: Plus, 
      label: 'New Post', 
      action: () => navigate('/share-food'),
      isActive: location.pathname === '/share-food',
      primary: true 
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      action: () => navigate('/notifications'),
      isActive: location.pathname === '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      action: () => {},
      isActive: false
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative ${
              item.primary 
                ? 'bg-black dark:bg-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                : item.isActive
                  ? 'bg-purple-100 dark:bg-purple-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="relative">
              <item.icon 
                className={`h-6 w-6 ${
                  item.primary 
                    ? 'text-white dark:text-black' 
                    : item.isActive
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`} 
              />
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-5"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </div>
            <span 
              className={`text-xs font-medium ${
                item.primary 
                  ? 'text-white dark:text-black' 
                  : item.isActive
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
