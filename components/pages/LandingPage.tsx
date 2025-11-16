import * as React from 'react';
import { useEffect } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { MosqueIcon, ArrowRightIcon, CalendarIcon, EmailIcon, PhoneIcon, UsersIcon } from '../icons';
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

    const upcomingEventsCount = events.length;
    const nextEvent = events.length > 0 ? events[0]?.title : null;

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
                            <div className="bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-2xl p-8 border border-primary/20 shadow-xl backdrop-blur-sm">
                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    <Skeleton className="h-32 w-32 lg:h-40 lg:w-40 rounded-2xl shadow-lg" />
                                    <div className="flex-1 space-y-4 text-center lg:text-left">
                                        <Skeleton className="h-12 w-2/3 mx-auto lg:mx-0" />
                                        <Skeleton className="h-6 w-1/2 mx-auto lg:mx-0" />
                                        <Skeleton className="h-20 w-80 mx-auto lg:mx-0 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ) : selectedMosque && (
                            <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-2xl p-8 border border-primary/20 shadow-xl backdrop-blur-sm overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full transform translate-x-32 -translate-y-32"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full transform -translate-x-24 translate-y-24"></div>
                                </div>
                                
                                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                                    {/* Mosque Image - Much Larger and More Prominent */}
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl">
                                            <img 
                                                src={selectedMosque.logoUrl} 
                                                alt={selectedMosque.name} 
                                                className="h-32 w-32 lg:h-40 lg:w-40 rounded-xl object-cover shadow-lg transform group-hover:scale-105 transition duration-300" 
                                            />
                                        </div>
                                        {/* Decorative Islamic Pattern */}
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full opacity-60 animate-pulse"></div>
                                        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-500 rounded-full opacity-60 animate-pulse delay-300"></div>
                                    </div>
                                    
                                    {/* Mosque Information */}
                                    <div className="flex-1 text-center lg:text-left">
                                        <div className="mb-6">
                                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                                {selectedMosque.name}
                                            </h1>
                                            <div className="flex items-center justify-center lg:justify-start gap-3 text-lg text-gray-600 dark:text-gray-300 mb-6">
                                                <span className="text-2xl">📍</span>
                                                <span className="font-medium">{selectedMosque.address}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Next Prayer Highlight */}
                                        {nextPrayer && (
                                            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 px-8 py-4 rounded-xl shadow-lg border border-primary/30 backdrop-blur-sm">
                                                <div className="relative">
                                                    <span className="text-3xl">⏰</span>
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">Next Prayer</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {nextPrayer.name} 
                                                        <span className="text-primary ml-2 font-black">
                                                            {nextPrayer.time}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Quick Stats */}
                                        <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                                            <div className="bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-primary/20">
                                                <div className="text-2xl font-bold text-primary">{members.length}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Members</div>
                                            </div>
                                            <div className="bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-green-500/20">
                                                <div className="text-2xl font-bold text-green-600">{events.length}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Events</div>
                                            </div>
                                            <div className="bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-blue-500/20">
                                                <div className="text-2xl font-bold text-blue-600">{prayerTimes.length}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Prayers</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Members Card */}
                            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-blue-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-bl-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-4 bg-blue-500 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <UsersIcon className="h-8 w-8" />
                                        </div>
                                        <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{members.length}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Members</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Active community members serving the ummah</p>
                                </div>
                            </div>

                            {/* Events Card */}
                            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-green-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-bl-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-4 bg-green-500 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <CalendarIcon className="h-8 w-8" />
                                        </div>
                                        <span className="text-4xl font-black text-green-600 dark:text-green-400">{upcomingEventsCount}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upcoming Events</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {nextEvent ? `Next: ${nextEvent}` : 'Community gatherings and activities'}
                                    </p>
                                </div>
                            </div>

                            {/* Prayer Times Card */}
                            <div className="group relative bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-amber-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-bl-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-4 bg-amber-500 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-2xl">🕌</span>
                                        </div>
                                        <span className="text-4xl font-black text-amber-600 dark:text-amber-400">{prayerTimes.length}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Prayer Times</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Daily salah schedule and timings</p>
                                </div>
                            </div>
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
