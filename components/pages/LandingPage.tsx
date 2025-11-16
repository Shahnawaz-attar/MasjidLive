import * as React from 'react';
import { useEffect } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { MosqueIcon, ArrowRightIcon, CalendarIcon, EmailIcon, PhoneIcon } from '../icons';
import { useMembers, useEvents, usePrayerTimes } from '../../hooks/useData';

// Skeleton component for loading states
const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
);

export const LandingPage = ({ mosques, onGoToLogin }: { mosques: Mosque[], onGoToLogin: () => void }) => {
    const [selectedId, setSelectedId] = React.useState<string | null>(mosques.length ? mosques[0].id : null);
    const [nextPrayer, setNextPrayer] = React.useState<PrayerTime | null>(null);

    // Use SWR hooks for data fetching with automatic caching
    const { members, isLoading: membersLoading } = useMembers(selectedId || '');
    const { events, isLoading: eventsLoading } = useEvents(selectedId || '');
    const { prayerTimes, isLoading: prayerTimesLoading } = usePrayerTimes(selectedId || '');

    const isLoading = membersLoading || eventsLoading || prayerTimesLoading;

    useEffect(() => {
        if (!selectedId && mosques.length) setSelectedId(mosques[0].id);
    }, [mosques]);

    useEffect(() => {
        if (prayerTimes.length > 0) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const timeToMinutes = (time: string) => {
                const [h, m] = time.match(/\d+/g) || ['0', '0'];
                let hours = parseInt(h, 10);
                const minutes = parseInt(m, 10);
                if (time.toLowerCase().includes('pm') && hours !== 12) hours += 12;
                if (time.toLowerCase().includes('am') && hours === 12) hours = 0;
                return hours * 60 + minutes;
            };
            const sortedTimes = [...prayerTimes].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
            const next = sortedTimes.find(p => timeToMinutes(p.time) > currentTime) || sortedTimes[0];
            setNextPrayer(next);
        } else {
            setNextPrayer(null);
        }
    }, [prayerTimes]);

    const selectedMosque = mosques.find(m => m.id === selectedId);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 dark:from-dark-background dark:to-primary/10">
            <header className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm p-4 border-b dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-sm">
                <div className="flex items-center space-x-3">
                    <MosqueIcon className="h-8 w-8 text-primary"/>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">City Masjid</h1>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    {mosques.length > 0 && (
                        <Select value={selectedId ?? ''} onValueChange={setSelectedId}>
                            <SelectTrigger className="h-10 min-w-[200px] bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Select a mosque" />
                            </SelectTrigger>
                            <SelectContent>
                                {mosques.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Button onClick={onGoToLogin} className="whitespace-nowrap">Login <ArrowRightIcon className="ml-2 h-4 w-4"/></Button>
                </div>
            </header>

            <main className="p-4 sm:p-8">
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">Welcome to Our Community of Mosques</h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                        {mosques.length > 0 
                            ? "Select a mosque from the dropdown to view public information including prayer times, upcoming events, and community members."
                            : "No mosques have been added yet. Please contact the administrator to add mosques to the system."
                        }
                    </p>
                </div>

                {mosques.length === 0 ? (
                    <div className="max-w-2xl mx-auto">
                        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-dark-surface/50">
                            <CardContent className="pt-12 pb-12 text-center">
                                <MosqueIcon className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No Mosques Available</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    The system is ready, but no mosques have been registered yet.
                                </p>
                                <Button onClick={onGoToLogin} variant="outline">
                                    Login as Admin to Add Mosques
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : selectedId && (
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Mosque header */}
                        {isLoading && !selectedMosque ? (
                            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-8 border border-primary/20 shadow-lg">
                                <div className="flex items-start gap-6">
                                    <Skeleton className="h-20 w-20 rounded-lg" />
                                    <div className="flex-1 space-y-3">
                                        <Skeleton className="h-10 w-2/3" />
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-16 w-64 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ) : selectedMosque && (
                            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-8 border border-primary/20 shadow-lg">
                                <div className="flex items-start gap-6">
                                    <img src={selectedMosque.logoUrl} alt={selectedMosque.name} className="h-20 w-20 rounded-lg shadow-md" />
                                    <div className="flex-1">
                                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{selectedMosque.name}</h1>
                                        <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-lg mb-4">
                                            <span>📍</span>
                                            <span>{selectedMosque.address}</span>
                                        </p>
                                        {nextPrayer && (
                                            <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 px-6 py-3 rounded-lg shadow-sm border border-primary/20">
                                                <span className="text-2xl">⏰</span>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Next Prayer</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                        {nextPrayer.name} <span className="text-primary">at {nextPrayer.time}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {isLoading ? (
                                <>
                                    {[1, 2, 3].map(i => (
                                        <Card key={i} className="border-l-4 border-l-gray-300">
                                            <CardHeader>
                                                <Skeleton className="h-6 w-32 mb-2" />
                                                <Skeleton className="h-4 w-40" />
                                            </CardHeader>
                                            <CardContent>
                                                <Skeleton className="h-12 w-20 mb-2" />
                                                <Skeleton className="h-4 w-32" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span className="text-2xl">👥</span>
                                                Members
                                            </CardTitle>
                                            <CardDescription>Active community members</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-4xl font-bold text-primary">{members.length}</div>
                                            <p className="text-sm text-gray-500 mt-2">Serving the community</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span className="text-2xl">📅</span>
                                                Upcoming Events
                                            </CardTitle>
                                            <CardDescription>Community gatherings</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-4xl font-bold text-green-600 dark:text-green-500">{events.length}</div>
                                            <p className="text-sm text-gray-500 mt-2 truncate">
                                                {events.length > 0 ? `Next: ${events[0]?.title}` : 'No events scheduled'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span className="text-2xl">🕌</span>
                                                Prayer Times
                                            </CardTitle>
                                            <CardDescription>Daily salah schedule</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-500">{prayerTimes.length}</div>
                                            <p className="text-sm text-gray-500 mt-2">Daily prayers</p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Upcoming Events Card */}
                                <Card className="shadow-md">
                                    <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20">
                                        <CardTitle className="flex items-center gap-2">
                                            <CalendarIcon className="h-5 w-5 text-green-600"/>
                                            Upcoming Events
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {eventsLoading ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <Skeleton className="h-6 w-2/3 mb-2" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : events.length ? (
                                            <div className="space-y-3">
                                                {events.slice(0,5).map(ev => (
                                                    <div key={ev.id} className="p-4 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30 hover:shadow-sm transition-shadow">
                                                        <div className="font-semibold text-gray-900 dark:text-white text-lg">{ev.title}</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                                            <span>📅 {ev.date}</span>
                                                            <span>•</span>
                                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium">{ev.type}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30"/>
                                                <p>No upcoming events scheduled.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Community Members Card */}
                                <Card className="shadow-md">
                                    <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
                                        <CardTitle className="flex items-center gap-2">
                                            <span className="text-xl">👥</span>
                                            Community Members
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {membersLoading ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[1, 2, 3, 4, 5, 6].map(i => (
                                                    <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                                        <Skeleton className="h-12 w-12 rounded-full" />
                                                        <div className="flex-1 space-y-2">
                                                            <Skeleton className="h-4 w-24" />
                                                            <Skeleton className="h-3 w-16" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : members.length ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {members.slice(0,6).map(mb => (
                                                    <div key={mb.id} className="p-3 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-center space-x-3 hover:shadow-sm transition-shadow">
                                                        <img src={mb.photo} className="h-12 w-12 rounded-full ring-2 ring-primary/20" alt={mb.name} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-gray-900 dark:text-white truncate">{mb.name}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">{mb.role}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <span className="text-4xl mb-3 block opacity-30">👥</span>
                                                <p>No members listed yet.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Prayer Times Card */}
                            <div>
                                <Card className="shadow-md sticky top-4">
                                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                                        <CardTitle className="flex items-center gap-2">
                                            <span className="text-xl">🕌</span>
                                            Prayer Times
                                        </CardTitle>
                                        <CardDescription>Today's schedule</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {prayerTimesLoading ? (
                                            <ul className="space-y-3">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <li key={i} className="flex justify-between items-center p-3 rounded-lg">
                                                        <Skeleton className="h-5 w-20" />
                                                        <Skeleton className="h-5 w-16" />
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : prayerTimes.length ? (
                                            <ul className="space-y-3">
                                                {prayerTimes.map(pt => {
                                                    const isNext = nextPrayer?.id === pt.id;
                                                    return (
                                                        <li key={pt.id} className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                                                            isNext 
                                                                ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}>
                                                            <span className={`font-medium ${isNext ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {pt.name}
                                                            </span>
                                                            <span className={`font-bold ${isNext ? 'text-primary text-lg' : 'text-gray-900 dark:text-white'}`}>
                                                                {pt.time}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <span className="text-4xl mb-3 block opacity-30">🕌</span>
                                                <p>No prayer times set.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* About Section */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <MosqueIcon className="h-8 w-8 text-primary"/>
                                <h3 className="text-xl font-bold">City Masjid</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                A comprehensive mosque management solution designed to strengthen community bonds and streamline administrative tasks.
                            </p>
                            <div className="flex space-x-4">
                                <button className="bg-primary/20 hover:bg-primary/30 p-2 rounded-lg transition-all duration-300 hover:scale-110">
                                    <span className="text-xl">📧</span>
                                </button>
                                <button className="bg-primary/20 hover:bg-primary/30 p-2 rounded-lg transition-all duration-300 hover:scale-110">
                                    <span className="text-xl">📱</span>
                                </button>
                                <button className="bg-primary/20 hover:bg-primary/30 p-2 rounded-lg transition-all duration-300 hover:scale-110">
                                    <span className="text-xl">🌐</span>
                                </button>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">Features</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                                    <span className="text-primary">•</span>
                                    <span>Prayer Times Management</span>
                                </li>
                                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                                    <span className="text-primary">•</span>
                                    <span>Community Events</span>
                                </li>
                                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                                    <span className="text-primary">•</span>
                                    <span>Member Directory</span>
                                </li>
                                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                                    <span className="text-primary">•</span>
                                    <span>Donation Tracking</span>
                                </li>
                                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                                    <span className="text-primary">•</span>
                                    <span>Announcements</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">Contact Developer</h3>
                            <div className="space-y-3">
                                <a 
                                    href="mailto:developer@masjidmanager.com" 
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                                >
                                    <EmailIcon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span>developer@masjidmanager.com</span>
                                </a>
                                <a 
                                    href="tel:+1234567890" 
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 group"
                                >
                                    <PhoneIcon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span>+1 (234) 567-8900</span>
                                </a>
                                <div className="pt-2">
                                    <p className="text-sm text-gray-400 mb-3">Need help or have suggestions?</p>
                                    <Button 
                                        variant="outline" 
                                        className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
                                        onClick={() => window.open('mailto:developer@masjidmanager.com?subject=Enquiry%20about%20Masjid%20Manager', '_blank')}
                                    >
                                        Send Enquiry
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-gray-700 mt-8 pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="text-gray-400 text-sm">
                                © 2024 City Masjid. Built with ❤️ for the Muslim community.
                            </div>
                            <div className="flex space-x-6 text-sm">
                                <button className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</button>
                                <button className="text-gray-400 hover:text-primary transition-colors">Terms of Service</button>
                                <button className="text-gray-400 hover:text-primary transition-colors">Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
