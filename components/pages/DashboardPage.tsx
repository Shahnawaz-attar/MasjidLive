import { useState, useEffect } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui';
import { UsersIcon, CalendarIcon, DollarSignIcon, MegaphoneIcon } from '../icons';
import { useMembers, useEvents, usePrayerTimes, useAnnouncements, useDonations } from '../../hooks/useData';

// Skeleton component for loading states
const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
);

const StatCard = ({ title, value, description, icon: Icon, isLoading }: { title: string; value: string | number; description: string; icon: React.FC<any>; isLoading?: boolean }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="pt-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    </div>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-10 w-24 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </>
                    ) : (
                        <>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                        </>
                    )}
                </div>
                <div className="ml-4 p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </CardContent>
    </Card>
);

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
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 border border-primary/10">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{mosque.name}</h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <span>📍 {mosque.address}</span>
                </p>
                {prayerTimesLoading ? (
                    <div className="mt-3">
                        <Skeleton className="h-6 w-64" />
                    </div>
                ) : nextPrayer ? (
                    <p className="text-lg font-semibold text-primary mt-3 flex items-center gap-2">
                        ⏰ Next Prayer: <span className="text-gray-900 dark:text-white">{nextPrayer.name}</span> at <span className="font-bold">{nextPrayer.time}</span>
                    </p>
                ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Members" value={members.length} description="Active community members" icon={UsersIcon} isLoading={membersLoading} />
                <StatCard title="Upcoming Events" value={events.length} description="Events scheduled" icon={CalendarIcon} isLoading={eventsLoading} />
                <StatCard title="Total Donations" value={`$${totalDonations.toLocaleString()}`} description="Received this period" icon={DollarSignIcon} isLoading={donationsLoading} />
                <StatCard title="Announcements" value={announcements.length} description="Recent announcements" icon={MegaphoneIcon} isLoading={announcementsLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border-0">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                🕌 Today's Prayer Times
                            </CardTitle>
                            <CardDescription>Prayer schedule for {mosque.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {prayerTimesLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                                            <Skeleton className="h-4 w-16 mb-2" />
                                            <Skeleton className="h-8 w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : prayerTimes.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {prayerTimes.map(pt => (
                                        <div
                                            key={pt.id}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                pt.id === nextPrayer?.id
                                                    ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                                    : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{pt.name}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pt.time}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No prayer times set.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-0">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                👥 Recent Members
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {membersLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                                            <Skeleton className="w-10 h-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentMembers.length > 0 ? (
                                <div className="space-y-3">
                                    {recentMembers.map(member => (
                                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No recent members.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-md border-0">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                📅 Upcoming Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           {eventsLoading ? (
                               <div className="space-y-3">
                                   {[1, 2, 3, 4].map(i => (
                                       <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                           <Skeleton className="h-5 w-32 mb-2" />
                                           <Skeleton className="h-4 w-24 mb-1" />
                                           <Skeleton className="h-3 w-16" />
                                       </div>
                                   ))}
                               </div>
                           ) : upcomingEvents.length > 0 ? (
                             <div className="space-y-3">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg hover:border-primary/40 transition-colors">
                                        <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CalendarIcon className="h-4 w-4"/>
                                            <span>{event.date}</span>
                                        </div>
                                        <p className="text-xs text-primary mt-1 font-medium">{event.type}</p>
                                    </div>
                                ))}
                            </div>
                           ) : (
                               <p className="text-sm text-gray-500">No upcoming events.</p>
                           )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-0">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                📢 Recent Announcements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {announcementsLoading ? (
                                <ul className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <li key={i} className="p-2 border-l-4 border-gray-300 dark:border-gray-600 pl-3 rounded-r">
                                            <Skeleton className="h-4 w-40 mb-2" />
                                            <Skeleton className="h-3 w-20" />
                                        </li>
                                    ))}
                                </ul>
                            ) : recentAnnouncements.length > 0 ? (
                                <ul className="space-y-3">
                                    {recentAnnouncements.map(ann => (
                                        <li key={ann.id} className="text-sm p-2 border-l-4 border-primary bg-primary/5 pl-3 rounded-r">
                                            <p className="font-semibold text-gray-900 dark:text-white">{ann.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{ann.date}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No recent announcements.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
