import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Mosque, User, PrayerTime, UserWithoutPassword } from './types';
import dbService from './database/clientService';
import { MosqueFormModal } from './components/forms';
import { useMosques } from './hooks/useData';
import { Toaster } from './components/ui';
import {
    DashboardPage,
    MembersPage,
    PrayerTimesPage,
    AnnouncementsPage,
    DonationsPage,
    EventsPage,
    MosquesPage,
    AuditLogPage,
    LoginScreen,
    RegistrationScreen,
    LandingPage,
    AdminProfilePage
} from './components/pages';

function App() {
    useEffect(() => {}, []);

    const [user, setUser] = useState<User | null>(() => {
        try {
            const raw = localStorage.getItem('masjid_user');
            return raw ? JSON.parse(raw) as User : null;
        } catch {
            return null;
        }
    });

    // Validate persisted user session on mount and whenever user changes
    useEffect(() => {
        let mounted = true;
        const validate = async () => {
            if (!user) return;
            try {
                const remote = await dbService.getUserById(user.id);
                if (!remote && mounted) {
                    handleLogout();
                }
            } catch (err) {
                if (mounted) handleLogout();
            }
        };
        validate();
        return () => { mounted = false; };
    }, [user]);

    const [view, setView] = useState('landing');
    const { mosques, mutate: mutateMosques } = useMosques();
    const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isMosqueModalOpen, setIsMosqueModalOpen] = useState(false);

    // Auto-select mosque when mosques load or user changes
    useEffect(() => {
        if (mosques.length > 0 && !selectedMosque) {
            // Admin should not be tied to any specific mosque - they can manage all
            if (user && user.role === 'Admin') {
                setSelectedMosque(mosques[0]); // Default to first mosque for display
                return;
            }
            
            // If user has a mosque_id (Imam or Muazzin), set their specific mosque
            if (user && user.mosque_id) {
                const userMosque = mosques.find(m => m.id === user.mosque_id);
                if (userMosque) {
                    setSelectedMosque(userMosque);
                    return;
                }
            }
            
            // Fallback to first mosque
            setSelectedMosque(mosques[0]);
        }
    }, [mosques, user, selectedMosque]);

    const handleAddMosque = () => {
        setIsMosqueModalOpen(true);
    };

    const handleMosqueCreated = async (newMosque: Mosque) => {
        await mutateMosques(); // Revalidate mosques list
        setSelectedMosque(newMosque);
        
        // Initialize default prayer times for the new mosque
        const defaultPrayerTimes: Omit<PrayerTime, 'id'>[] = [
            { name: 'Fajr', time: '05:30 AM' },
            { name: 'Dhuhr', time: '01:30 PM' },
            { name: 'Asr', time: '04:45 PM' },
            { name: 'Maghrib', time: '07:15 PM' },
            { name: 'Isha', time: '08:45 PM' }
        ];

        try {
            for (const prayer of defaultPrayerTimes) {
                await dbService.addDoc(newMosque.id, 'prayerTimes', prayer);
            }
        } catch (err) {
            console.error('Error initializing prayer times:', err);
        }
    };

    const handleLogin = (loggedInUser: UserWithoutPassword) => {
        const asUser = loggedInUser as User;
        setUser(asUser);
        try { localStorage.setItem('masjid_user', JSON.stringify(asUser)); } catch {}
        
        // Only set specific mosque for non-admin users
        if (asUser.mosque_id && asUser.role !== 'Admin') {
            const userMosque = mosques.find(m => m.id === asUser.mosque_id);
            if (userMosque) {
                setSelectedMosque(userMosque);
            }
        }
        
        // Set proper initial view based on user type
        if (asUser.role === 'Admin') {
            setView('dashboard'); // Admin goes to dashboard, can manage all mosques
        } else {
            setView('dashboard'); // Other roles go to dashboard for their assigned mosque
        }
        
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setView('landing');
        setSelectedMosque(null);
        setCurrentPage('dashboard');
        try { localStorage.removeItem('masjid_user'); } catch {}
    };

    const renderPage = () => {
        // Default to Admin if role is not set (for backward compatibility with old users)
        const userRole = user?.role || 'Admin';
        
        switch (currentPage) {
            case 'mosques': 
                return <MosquesPage mosques={mosques} onMosqueChange={setSelectedMosque} onRefresh={mutateMosques} userRole={userRole} />;
            case 'dashboard': 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <DashboardPage mosque={selectedMosque} />;
            case 'members': 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <MembersPage mosque={selectedMosque} userRole={userRole} />;
            case 'prayer-times': 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <PrayerTimesPage mosque={selectedMosque} />;
            case 'announcements': 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <AnnouncementsPage mosque={selectedMosque} />;
            case 'donations': 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <DonationsPage mosque={selectedMosque} />;
            case 'events': 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <EventsPage mosque={selectedMosque} />;
            case 'audit-log': 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <AuditLogPage mosque={selectedMosque} />;
            case 'profile':
                return <AdminProfilePage user={user!} onUserUpdate={setUser} />;
            default: 
                if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
                return <DashboardPage mosque={selectedMosque} />;
        }
    }
    
    if (!user) {
        if (view === 'login') {
            return <LoginScreen 
                onLoginSuccess={handleLogin} 
                onBackToLanding={() => setView('landing')} 
                onGoToRegister={() => setView('register')}
            />;
        }
        if (view === 'register') {
            return <RegistrationScreen
                mosques={mosques}
                onRegistrationSuccess={handleLogin}
                onBackToLogin={() => setView('login')}
            />;
        }
        return <LandingPage mosques={mosques} onGoToLogin={() => setView('login')} />;
    }

    // Admin can access all pages without needing a selected mosque
    const isAdmin = user.role === 'Admin';
    if (!isAdmin && currentPage !== 'mosques' && !selectedMosque) {
        return <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background text-lg font-semibold text-gray-700 dark:text-gray-300">Loading mosques...</div>
    }

    const layoutMosque = selectedMosque || (mosques.length > 0 ? mosques[0] : null);
    
    if (!isAdmin && !layoutMosque && currentPage !== 'mosques') {
        return <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background text-lg font-semibold text-gray-700 dark:text-gray-300">No mosques available. Please contact administrator.</div>
    }

    return (
        <>
            <Layout
                user={user}
                mosques={mosques}
                selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                onMosqueChange={setSelectedMosque}
                onNavigate={setCurrentPage}
                currentPage={currentPage}
                onLogout={handleLogout}
                onAddMosque={handleAddMosque}
            >
                {renderPage()}
            </Layout>
            <MosqueFormModal
                isOpen={isMosqueModalOpen}
                onClose={() => setIsMosqueModalOpen(false)}
                onSave={handleMosqueCreated}
            />
            <Toaster />
        </>
    );
}

export default App;
