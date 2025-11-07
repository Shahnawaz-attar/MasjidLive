
import React, { useState, ReactNode, useEffect } from 'react';
import {
  DashboardIcon, UsersIcon, ClockIcon, MegaphoneIcon, DollarSignIcon, CalendarIcon, ListIcon, LogOutIcon, SunIcon, MoonIcon, ChevronDownIcon, SearchIcon
} from './icons';
import { MOCK_USER } from '../constants';
import { Mosque } from '../types';
import { Button } from './ui';

type Page = 'Dashboard' | 'Members' | 'Timings' | 'Announcements' | 'Donations' | 'Events' | 'Audit';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  selectedMosque: Mosque | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isCollapsed, setIsCollapsed, selectedMosque }) => {
  const navItems = [
    { name: 'Dashboard', icon: DashboardIcon },
    { name: 'Members', icon: UsersIcon },
    { name: 'Timings', icon: ClockIcon },
    { name: 'Announcements', icon: MegaphoneIcon },
    { name: 'Donations', icon: DollarSignIcon },
    { name: 'Events', icon: CalendarIcon },
    { name: 'Audit', icon: ListIcon },
  ] as const;

  return (
    <aside className={`flex flex-col bg-surface dark:bg-dark-surface text-gray-800 dark:text-gray-200 shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <span className="text-xl font-bold text-primary">Masjid Manager</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
           {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="flex items-center p-4 mt-2">
         {selectedMosque && (
            <>
                <img src={selectedMosque.logoUrl} alt="Mosque Logo" className={`rounded-md transition-all ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`} />
                {!isCollapsed && (
                    <div className="ml-3">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{selectedMosque.name}</p>
                    </div>
                )}
            </>
         )}
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2">
        {navItems.map(item => (
          <a
            key={item.name}
            href="#"
            onClick={(e) => { e.preventDefault(); onPageChange(item.name); }}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${currentPage === item.name ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <item.icon className={`h-6 w-6 ${currentPage === item.name ? 'text-primary' : ''}`} />
            {!isCollapsed && <span className="ml-4 font-medium">{item.name}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
};

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onLogout: () => void;
    onSwitchMosque: () => void;
    selectedMosque: Mosque | null;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onLogout, onSwitchMosque, selectedMosque }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-surface dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{selectedMosque?.name || 'Admin Dashboard'}</h1>
                 <Button variant="ghost" className="ml-4" onClick={onSwitchMosque}>Switch Mosque</Button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2">
                        <img className="h-9 w-9 rounded-full" src={MOCK_USER.avatar} alt="User avatar" />
                        <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">{MOCK_USER.name}</span>
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface dark:bg-dark-surface rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-10">
                            <div className="px-4 py-2 border-b dark:border-gray-600">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{MOCK_USER.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{MOCK_USER.email}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                                    {theme === 'light' ? <MoonIcon className="w-5 h-5 mr-3" /> : <SunIcon className="w-5 h-5 mr-3" />}
                                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                                </button>
                                <button onClick={onLogout} className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                                    <LogOutIcon className="w-5 h-5 mr-3" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  selectedMosque: Mosque | null;
  onLogout: () => void;
  onSwitchMosque: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, theme, setTheme, selectedMosque, onLogout, onSwitchMosque }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen bg-background dark:bg-dark-background">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={onPageChange}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        selectedMosque={selectedMosque}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header theme={theme} setTheme={setTheme} onLogout={onLogout} onSwitchMosque={onSwitchMosque} selectedMosque={selectedMosque} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;