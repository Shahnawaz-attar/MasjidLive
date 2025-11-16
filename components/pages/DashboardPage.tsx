import { useState, useEffect } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui';
import { UsersIcon, CalendarIcon, DollarSignIcon, MegaphoneIcon } from '../icons';
import { useMembers, useEvents, usePrayerTimes, useAnnouncements, useDonations } from '../../hooks/useData';

// Enhanced Skeleton component with gradient animation
const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded ${className}`}></div>
);

const StatCard = ({ title, value, description, icon: Icon, isLoading, color = 'primary' }: { 
    title: string; 
    value: string | number; 
    description: string; 
    icon: React.FC<any>; 
    isLoading?: boolean;
    color?: string;
}) => {
    const colorClasses = {
        primary: 'from-blue-500/20 to-purple-600/20 border-blue-200/50 dark:border-blue-800/50',
        green: 'from-emerald-500/20 to-green-600/20 border-emerald-200/50 dark:border-emerald-800/50',
        orange: 'from-orange-500/20 to-amber-600/20 border-orange-200/50 dark:border-orange-800/50',
        purple: 'from-purple-500/20 to-pink-600/20 border-purple-200/50 dark:border-purple-800/50'
    };

    const iconColors = {
        primary: 'text-blue-600 dark:text-blue-400',
        green: 'text-emerald-600 dark:text-emerald-400',
        orange: 'text-orange-600 dark:text-orange-400',
        purple: 'text-purple-600 dark:text-purple-400'
    };

    return (
        <Card className={`group border-2 ${colorClasses[color as keyof typeof colorClasses]} bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden`}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-gray-800/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            <CardContent className="pt-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide uppercase">{title}</p>
                        </div>
                        {isLoading ? (
                            <>
                                <Skeleton className="h-12 w-28 mb-3" />
                                <Skeleton className="h-4 w-36" />
                            </>
                        ) : (
                            <>
                                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                                    {value}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{description}</p>
                            </>
                        )}
                    </div>
                    <div className={`ml-4 p-4 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`h-8 w-8 ${iconColors[color as keyof typeof iconColors]} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const DashboardPage = ({ mosque }: { mosque: Mosque }) => {
    const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);

    // Use SWR hooks for data fetching with automatic caching
    const { prayerTimes, isLoading: prayerTimesLoading } = usePrayerTimes(mosque.id);
    const { members, isLoading: membersLoading } = useMembers(mosque.id);
    const { events, isLoading: eventsLoading } = useEvents(mosque.id);
    const { announcements, isLoading: announcementsLoading } = useAnnouncements(mosque.id);
    const { donations, isLoading: donationsLoading } = useDonations(mosque.id);

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

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const now = new Date();
    const upcomingEvents = [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(e => new Date(e.date) >= now).slice(0, 4);
    const recentAnnouncements = [...announcements].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    const recentMembers = [...members].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/30 to-blue-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 space-y-10 p-6">
                {/* Enhanced Header Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-white/90 via-blue-50/90 to-indigo-50/90 dark:from-gray-900/90 dark:via-blue-900/50 dark:to-indigo-900/50 backdrop-blur-lg rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10">
                        <h1 className="text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4 tracking-tight">
                            {mosque.name}
                        </h1>
                        <p className="text-xl text-gray-700 dark:text-gray-300 flex items-center gap-3 font-medium mb-4">
                            <span className="text-2xl">📍</span> 
                            <span className="bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                                {mosque.address}
                            </span>
                        </p>
                        {prayerTimesLoading ? (
                            <div className="mt-4">
                                <Skeleton className="h-8 w-80" />
                            </div>
                        ) : nextPrayer ? (
                            <div className="flex items-center gap-4 mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                                <span className="text-3xl animate-pulse">⏰</span>
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                    Next Prayer: <span className="text-emerald-600 dark:text-emerald-400">{nextPrayer.name}</span> at{' '}
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{nextPrayer.time}</span>
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Total Members" 
                        value={members.length} 
                        description="Active community members" 
                        icon={UsersIcon} 
                        isLoading={membersLoading} 
                        color="green"
                    />
                    <StatCard 
                        title="Upcoming Events" 
                        value={events.length} 
                        description="Events scheduled" 
                        icon={CalendarIcon} 
                        isLoading={eventsLoading} 
                        color="orange"
                    />
                    <StatCard 
                        title="Total Donations" 
                        value={`$${totalDonations.toLocaleString()}`} 
                        description="Received this period" 
                        icon={DollarSignIcon} 
                        isLoading={donationsLoading} 
                        color="primary"
                    />
                    <StatCard 
                        title="Announcements" 
                        value={announcements.length} 
                        description="Recent announcements" 
                        icon={MegaphoneIcon} 
                        isLoading={announcementsLoading} 
                        color="purple"
                    />
                </div>

                {/* Enhanced Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Prayer Times Card */}
                        <Card className="group border-0 bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-900/90 dark:to-blue-900/30 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-blue-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                    <span className="text-3xl animate-pulse">🕌</span>
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Today's Prayer Times
                                    </span>
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                                    Prayer schedule for {mosque.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                {prayerTimesLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                                                <Skeleton className="h-5 w-20 mb-3" />
                                                <Skeleton className="h-10 w-24" />
                                            </div>
                                        ))}
                                    </div>
                                ) : prayerTimes.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {prayerTimes.map(pt => (
                                            <div
                                                key={pt.id}
                                                className={`group/prayer p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                                                    pt.id === nextPrayer?.id
                                                        ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/40 dark:to-blue-900/40 shadow-xl shadow-emerald-200/50'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600'
                                                }`}
                                            >
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                                                    {pt.name}
                                                </p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white group-hover/prayer:text-transparent group-hover/prayer:bg-gradient-to-r group-hover/prayer:from-blue-600 group-hover/prayer:to-indigo-600 group-hover/prayer:bg-clip-text transition-all duration-300">
                                                    {pt.time}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-lg">No prayer times set.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Members Card */}
                        <Card className="group border-0 bg-gradient-to-br from-white/90 to-emerald-50/90 dark:from-gray-900/90 dark:to-emerald-900/30 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-emerald-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                    <span className="text-3xl">👥</span>
                                    <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                        Recent Members
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                {membersLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
                                                <Skeleton className="w-14 h-14 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-5 w-40" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recentMembers.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentMembers.map(member => (
                                            <div key={member.id} className="group/member flex items-center gap-4 p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300 hover:scale-102 hover:shadow-lg">
                                                <div className="relative">
                                                    <img 
                                                        src={member.photo} 
                                                        alt={member.name} 
                                                        className="w-14 h-14 rounded-full object-cover border-3 border-emerald-200 dark:border-emerald-700 group-hover/member:border-emerald-400 transition-all duration-300 group-hover/member:scale-110" 
                                                    />
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-600/20 opacity-0 group-hover/member:opacity-100 transition-opacity duration-300"></div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-lg text-gray-900 dark:text-white group-hover/member:text-emerald-600 dark:group-hover/member:text-emerald-400 transition-colors duration-300">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-lg">No recent members.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Upcoming Events Card */}
                        <Card className="group border-0 bg-gradient-to-br from-white/90 to-orange-50/90 dark:from-gray-900/90 dark:to-orange-900/30 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-orange-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                    <span className="text-3xl animate-bounce">📅</span>
                                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                        Upcoming Events
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                               {eventsLoading ? (
                                   <div className="space-y-4">
                                       {[1, 2, 3, 4].map(i => (
                                           <div key={i} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                               <Skeleton className="h-6 w-36 mb-3" />
                                               <Skeleton className="h-5 w-28 mb-2" />
                                               <Skeleton className="h-4 w-20" />
                                           </div>
                                       ))}
                                   </div>
                               ) : upcomingEvents.length > 0 ? (
                                 <div className="space-y-4">
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className="group/event p-4 bg-gradient-to-r from-white/80 to-orange-50/80 dark:from-gray-800/80 dark:to-orange-900/20 border border-orange-200/60 dark:border-orange-700/60 rounded-2xl hover:border-orange-400/80 dark:hover:border-orange-500/80 transition-all duration-300 hover:scale-102 hover:shadow-lg">
                                            <p className="font-bold text-lg text-gray-900 dark:text-white group-hover/event:text-orange-600 dark:group-hover/event:text-orange-400 transition-colors duration-300">
                                                {event.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3 text-gray-600 dark:text-gray-400">
                                                <CalendarIcon className="h-5 w-5 text-orange-500"/>
                                                <span className="font-medium">{event.date}</span>
                                            </div>
                                            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-bold uppercase tracking-wide">
                                                {event.type}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                               ) : (
                                   <p className="text-gray-500 text-lg">No upcoming events.</p>
                               )}
                            </CardContent>
                        </Card>

                        {/* Recent Announcements Card */}
                        <Card className="group border-0 bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-900/90 dark:to-purple-900/30 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-purple-400/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                    <span className="text-3xl animate-pulse">📢</span>
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Announcements
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                {announcementsLoading ? (
                                    <ul className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <li key={i} className="p-3 border-l-4 border-gray-300 dark:border-gray-600 pl-4 rounded-r-xl">
                                                <Skeleton className="h-5 w-44 mb-3" />
                                                <Skeleton className="h-4 w-24" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : recentAnnouncements.length > 0 ? (
                                    <ul className="space-y-4">
                                        {recentAnnouncements.map(ann => (
                                            <li key={ann.id} className="group/announcement p-4 border-l-4 border-purple-400 bg-gradient-to-r from-purple-50/80 to-white/80 dark:from-purple-900/30 dark:to-gray-800/80 pl-5 rounded-r-2xl hover:border-purple-500 transition-all duration-300 hover:scale-102 hover:shadow-lg">
                                                <p className="font-bold text-lg text-gray-900 dark:text-white group-hover/announcement:text-purple-600 dark:group-hover/announcement:text-purple-400 transition-colors duration-300">
                                                    {ann.title}
                                                </p>
                                                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                                    {ann.date}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-lg">No recent announcements.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
