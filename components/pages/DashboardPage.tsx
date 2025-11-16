import { useState, useEffect } from 'react';
import { Mosque, PrayerTime, Member, CommunityEvent, Announcement, Donation } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui';
import { UsersIcon, CalendarIcon, DollarSignIcon, MegaphoneIcon } from '../icons';
import { Column } from '../DataTable';
import dbService from '../../database/clientService';

const StatCard = ({ title, value, description, icon: Icon }: { title: string; value: string | number; description: string; icon: React.FC<any> }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="pt-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <div className="ml-4 p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export const DashboardPage = ({ mosque }: { mosque: Mosque }) => {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
    const [stats, setStats] = useState({
        memberCount: 0,
        eventCount: 0,
        totalDonations: 0,
        announcementCount: 0,
    });
    const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
    const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
    const [recentMembers, setRecentMembers] = useState<Member[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const [pt, members, events, announcements, donations] = await Promise.all([
                dbService.getCollection<'prayerTimes'>(mosque.id, 'prayerTimes'),
                dbService.getCollection<'members'>(mosque.id, 'members'),
                dbService.getCollection<'events'>(mosque.id, 'events'),
                dbService.getCollection<'announcements'>(mosque.id, 'announcements'),
                dbService.getCollection<'donations'>(mosque.id, 'donations'),
            ]) as [PrayerTime[], Member[], CommunityEvent[], Announcement[], Donation[]];

            setPrayerTimes(pt);
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
            const sortedTimes = [...pt].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
            const next = sortedTimes.find(p => timeToMinutes(p.time) > currentTime) || sortedTimes[0];
            setNextPrayer(next);

            const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
            setStats({
                memberCount: members.length,
                eventCount: events.length,
                totalDonations: totalDonations,
                announcementCount: announcements.length,
            });

            setRecentMembers([...members].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5));
            setUpcomingEvents([...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(e => new Date(e.date) >= now).slice(0, 4));
            setRecentAnnouncements([...announcements].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3));
        };

        fetchDashboardData();
    }, [mosque]);

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 border border-primary/10">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{mosque.name}</h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <span>📍 {mosque.address}</span>
                </p>
                {nextPrayer && (
                    <p className="text-lg font-semibold text-primary mt-3 flex items-center gap-2">
                        ⏰ Next Prayer: <span className="text-gray-900 dark:text-white">{nextPrayer.name}</span> at <span className="font-bold">{nextPrayer.time}</span>
                    </p>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Members" value={stats.memberCount} description="Active community members" icon={UsersIcon} />
                <StatCard title="Upcoming Events" value={stats.eventCount} description="Events scheduled" icon={CalendarIcon} />
                <StatCard title="Total Donations" value={`$${stats.totalDonations.toLocaleString()}`} description="Received this period" icon={DollarSignIcon} />
                <StatCard title="Announcements" value={stats.announcementCount} description="Recent announcements" icon={MegaphoneIcon} />
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
                            {prayerTimes.length > 0 ? (
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
                            {recentMembers.length > 0 ? (
                                <div className="space-y-3">
                                    {recentMembers.map(member => (
                                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                                            </div>
                                            {member.education && member.education !== 'None' && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{member.education}</span>
                                            )}
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
                           {upcomingEvents.length > 0 ? (
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
                            {recentAnnouncements.length > 0 ? (
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
