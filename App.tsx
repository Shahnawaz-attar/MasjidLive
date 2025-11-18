import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
    const navigate = useNavigate();
    const location = useLocation();
    
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

    const { mosques, mutate: mutateMosques } = useMosques();
    const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
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
        
        // Initialize default prayer times for the new mosque with Indian timings
        const today = new Date().toISOString().split('T')[0];
        const defaultPrayerTimes = {
            date: today,
            fajr: '05:00',      // 5:00 AM - Fajr typically around 5-5:30 AM in India
            dhuhr: '12:30',     // 12:30 PM - Dhuhr around 12:30-1:00 PM
            asr: '16:00',       // 4:00 PM - Asr around 4:00-4:30 PM  
            maghrib: '18:30',   // 6:30 PM - Maghrib around 6:00-7:00 PM (varies by season)
            isha: '20:00',      // 8:00 PM - Isha around 7:30-8:30 PM
            jumma: '12:30',     // 12:30 PM - Jumma prayer time
            isActive: true
        };

        try {
            await dbService.addDoc(newMosque.id, 'prayerTimes', defaultPrayerTimes);
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
        
        // Redirect to dashboard after login
        navigate('/dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setSelectedMosque(null);
        try { localStorage.removeItem('masjid_user'); } catch {}
        navigate('/');
    };

    // Navigation handler for Layout component
    const handleNavigate = (page: string) => {
        navigate(`/${page}`);
    };

    // Get current page from URL
    const getCurrentPage = () => {
        const path = location.pathname.slice(1); // Remove leading slash
        return path || 'dashboard';
    };

    const renderProtectedRoute = (element: React.ReactElement) => {
        if (!user) {
            return <Navigate to="/" replace />;
        }
        return element;
    };

    const renderAdminRoute = (element: React.ReactElement) => {
        if (!user) {
            return <Navigate to="/" replace />;
        }
        if (user.role !== 'Admin') {
            return <Navigate to="/dashboard" replace />;
        }
        return element;
    };

    // Admin can access all pages without needing a selected mosque
    const isAdmin = user?.role === 'Admin';
    const layoutMosque = selectedMosque || (mosques.length > 0 ? mosques[0] : null);
    
    if (user && !isAdmin && !layoutMosque && getCurrentPage() !== 'mosques') {
        return <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background text-lg font-semibold text-gray-700 dark:text-gray-300">Loading mosques...</div>
    }

    return (
        <>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={
                    user ? <Navigate to="/dashboard" replace /> : 
                    <LandingPage mosques={mosques} onGoToLogin={() => navigate('/login')} />
                } />
                
                {/* Public landing page accessible even when logged in */}
                <Route path="/home" element={
                    <LandingPage mosques={mosques} onGoToLogin={() => navigate('/login')} />
                } />
                
                <Route path="/login" element={
                    user ? <Navigate to="/dashboard" replace /> :
                    <LoginScreen 
                        onLoginSuccess={handleLogin} 
                        onBackToLanding={() => navigate('/')} 
                        onGoToRegister={() => navigate('/register')}
                    />
                } />
                <Route path="/register" element={
                    user ? <Navigate to="/dashboard" replace /> :
                    <RegistrationScreen
                        mosques={mosques}
                        onRegistrationSuccess={handleLogin}
                        onBackToLogin={() => navigate('/login')}
                    />
                } />

                {/* Protected routes */}
                <Route path="/dashboard" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        {!selectedMosque ? (
                            <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>
                        ) : (
                            <DashboardPage mosque={selectedMosque} />
                        )}
                    </Layout>
                )} />

                <Route path="/members" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        {!selectedMosque ? (
                            <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>
                        ) : (
                            <MembersPage mosque={selectedMosque} userRole={user?.role || 'Admin'} />
                        )}
                    </Layout>
                )} />

                <Route path="/prayer-times" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        {!selectedMosque ? (
                            <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>
                        ) : (
                            <PrayerTimesPage mosque={selectedMosque} />
                        )}
                    </Layout>
                )} />

                <Route path="/announcements" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        {!selectedMosque ? (
                            <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>
                        ) : (
                            <AnnouncementsPage mosque={selectedMosque} />
                        )}
                    </Layout>
                )} />

                <Route path="/donations" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        {!selectedMosque ? (
                            <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>
                        ) : (
                            <DonationsPage mosque={selectedMosque} />
                        )}
                    </Layout>
                )} />

                <Route path="/events" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        {!selectedMosque ? (
                            <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>
                        ) : (
                            <EventsPage mosque={selectedMosque} />
                        )}
                    </Layout>
                )} />

                <Route path="/mosques" element={renderAdminRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        <MosquesPage mosques={mosques} onMosqueChange={setSelectedMosque} onRefresh={mutateMosques} userRole={user?.role || 'Admin'} />
                    </Layout>
                )} />

                <Route path="/audit-log" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        {!selectedMosque ? (
                            <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>
                        ) : (
                            <AuditLogPage mosque={selectedMosque} />
                        )}
                    </Layout>
                )} />

                <Route path="/profile" element={renderProtectedRoute(
                    <Layout
                        user={user!}
                        mosques={mosques}
                        selectedMosque={layoutMosque || { id: '', name: 'No Mosque', address: '', logoUrl: '' }}
                        onMosqueChange={setSelectedMosque}
                        onNavigate={handleNavigate}
                        currentPage={getCurrentPage()}
                        onLogout={handleLogout}
                        onAddMosque={handleAddMosque}
                    >
                        <AdminProfilePage user={user!} onUserUpdate={setUser} />
                    </Layout>
                )} />

                {/* Catch all route - redirect to dashboard if logged in, landing if not */}
                <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
            </Routes>

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
