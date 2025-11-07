import React, { useState } from 'react';
import { Mosque } from '../types';
import { MOCK_USER, MOCK_MOSQUES } from '../constants';
import { MosqueIcon, UsersIcon, ClockIcon, MegaphoneIcon, DollarSignIcon, CalendarIcon, FileTextIcon, ChevronDownIcon, LogOutIcon, MenuIcon, XIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
  selectedMosque: Mosque;
  onMosqueChange: (mosque: Mosque) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
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

const Layout: React.FC<LayoutProps> = ({ children, selectedMosque, onMosqueChange, onNavigate, currentPage }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'members', label: 'Members', icon: UsersIcon },
    { id: 'prayer-times', label: 'Prayer Times', icon: ClockIcon },
    { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon },
    { id: 'donations', label: 'Donations', icon: DollarSignIcon },
    { id: 'events', label: 'Events', icon: CalendarIcon },
    { id: 'audit-log', label: 'Audit Log', icon: FileTextIcon },
  ];
  
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700/50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <MosqueIcon className="h-8 w-8 text-primary"/>
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
                <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="h-10 w-10 rounded-full" />
                <div>
                    <p className="font-semibold text-sm">{MOCK_USER.name}</p>
                    <p className="text-xs text-gray-500">{MOCK_USER.email}</p>
                </div>
                <button className="ml-auto text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
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
        <header className="sticky top-0 z-10 bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between p-4">
          <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-primary"
              aria-label="Open sidebar"
          >
              <MenuIcon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 lg:hidden"></div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <img src={selectedMosque.logoUrl} alt={selectedMosque.name} className="h-8 w-8 rounded-md" />
              <div>
                <h2 className="text-lg font-bold">{selectedMosque.name}</h2>
                <p className="text-xs text-gray-500 hidden sm:block">{selectedMosque.address}</p>
              </div>
              <ChevronDownIcon className={`h-5 w-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute mt-2 w-72 bg-surface dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 right-0">
                {MOCK_MOSQUES.map(mosque => (
                  <button
                    key={mosque.id}
                    onClick={() => {
                      onMosqueChange(mosque);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3"
                  >
                    <img src={mosque.logoUrl} alt={mosque.name} className="h-8 w-8 rounded-md" />
                    <div>
                        <p className="font-semibold">{mosque.name}</p>
                        <p className="text-xs text-gray-500">{mosque.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
           <div className="flex-1 lg:hidden"></div>
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