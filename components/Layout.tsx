import React, { useState, useEffect, useRef } from 'react';
import { Mosque, User } from '../types';
import { MosqueIcon, UsersIcon, ClockIcon, MegaphoneIcon, DollarSignIcon, CalendarIcon, FileTextIcon, ChevronDownIcon, LogOutIcon, MenuIcon, XIcon, HomeIcon, PlusIcon, ExternalLinkIcon } from './icons';
import { generateAvatarUrl } from '../lib/avatar';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  mosques: Mosque[];
  selectedMosque: Mosque;
  onMosqueChange: (mosque: Mosque) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
  onAddMosque?: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      isActive
        ? 'bg-primary/10 text-primary dark:bg-primary/20'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, user, mosques, selectedMosque, onMosqueChange, onNavigate, currentPage, onLogout, onAddMosque }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['Admin', 'Imam', 'Muazzin'] },
    { id: 'mosques', label: 'Mosques', icon: MosqueIcon, roles: ['Admin'] },
    { id: 'members', label: 'Members', icon: UsersIcon, roles: ['Admin', 'Imam', 'Muazzin'] },
    { id: 'prayer-times', label: 'Prayer Times', icon: ClockIcon, roles: ['Admin', 'Imam', 'Muazzin'] },
    { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon, roles: ['Admin', 'Imam', 'Muazzin'] },
    { id: 'donations', label: 'Donations', icon: DollarSignIcon, roles: ['Admin', 'Imam', 'Muazzin'] },
    { id: 'events', label: 'Events', icon: CalendarIcon, roles: ['Admin', 'Imam', 'Muazzin'] },
    { id: 'audit-log', label: 'Audit Log', icon: FileTextIcon, roles: ['Admin', 'Imam'] },
    { id: 'profile', label: 'Profile', icon: UsersIcon, roles: ['Admin', 'Imam', 'Muazzin'] },
  ];
  
  // Filter navigation items based on user role
  // Default to Admin if role is not set (for backward compatibility)
  const userRole = user.role || 'Admin';
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));
  
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700/50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <img src="https://e7.pngegg.com/pngimages/724/24/png-clipart-al-masjid-an-nabawi-green-dome-mosque-islamic-green-and-brown-mosque-cdr-building-thumbnail.png" alt="Masjid Logo" className="h-8 w-8 text-primary"/>
            <h1 className="text-xl font-bold">Masjid Admin</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsSidebarOpen(false); // Close sidebar on mobile nav
              }}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
                <img 
                    src={user.avatar || generateAvatarUrl(user.name)} 
                    alt={user.name} 
                    className="h-10 w-10 rounded-full object-cover border-2 border-primary/20" 
                />
                <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button onClick={onLogout} className="ml-auto text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <LogOutIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between p-4 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200"
                aria-label="Open sidebar"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            
            {/* Landing Page Link */}
            <button 
                onClick={() => {
                    // Open landing page in new tab
                    window.open('/home', '_blank');
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                title="View Public Landing Page"
            >
                <ExternalLinkIcon className="h-4 w-4" />
                <span>Home</span>
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            {/* Only show dropdown for Admin users */}
            {(!user.role || user.role === 'Admin') ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <img src={selectedMosque.logoUrl} alt={selectedMosque.name} className="h-8 w-8 rounded-md transition-transform duration-200 hover:scale-105" />
                  <div className="hidden sm:block text-left">
                    <h2 className="text-lg font-bold">{selectedMosque.name}</h2>
                    <p className="text-xs text-gray-500">{selectedMosque.address}</p>
                  </div>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute mt-2 w-72 bg-surface dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 right-0 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[70vh] overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      {mosques.map(mosque => (
                        <button
                          key={mosque.id}
                          onClick={() => {
                            onMosqueChange(mosque);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 transition-all duration-200 first:rounded-t-lg ${
                            selectedMosque.id === mosque.id ? 'bg-primary/5 dark:bg-primary/10' : ''
                          }`}
                        >
                          <img src={mosque.logoUrl} alt={mosque.name} className="h-8 w-8 rounded-md transition-transform duration-200 hover:scale-105" />
                          <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{mosque.name}</p>
                              <p className="text-xs text-gray-500 truncate">{mosque.address}</p>
                          </div>
                          {selectedMosque.id === mosque.id && (
                            <svg className="h-5 w-5 text-primary flex-shrink-0 animate-in fade-in duration-200" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    {onAddMosque && (
                      <button
                        onClick={() => {
                          onAddMosque();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 border-t border-gray-200 dark:border-gray-700 transition-all duration-200 rounded-b-lg"
                      >
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center transition-all duration-200 hover:bg-primary/20">
                          <PlusIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-primary">Add New Mosque</p>
                            <p className="text-xs text-gray-500">Create a new masjid</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* For Imam and Muazzin, just show their mosque name without dropdown */
              <div className="flex items-center space-x-2 p-2">
                <img src={selectedMosque.logoUrl} alt={selectedMosque.name} className="h-8 w-8 rounded-md transition-transform duration-200 hover:scale-105" />
                <div className="hidden sm:block">
                  <h2 className="text-lg font-bold">{selectedMosque.name}</h2>
                  <p className="text-xs text-gray-500">{selectedMosque.address}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;