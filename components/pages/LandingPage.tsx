import * as React from 'react';
import { useState, useEffect } from 'react';
import { Mosque, Member, CommunityEvent, PrayerTime, MosqueSummary } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Select } from '../ui';
import { MosqueIcon, ArrowRightIcon, CalendarIcon } from '../icons';
import dbService from '../../database/clientService';

export const LandingPage = ({ mosques, onGoToLogin }: { mosques: Mosque[], onGoToLogin: () => void }) => {
    const [selectedId, setSelectedId] = React.useState<string | null>(mosques.length ? mosques[0].id : null);
    const [summary, setSummary] = React.useState<MosqueSummary | null>(null);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [events, setEvents] = React.useState<CommunityEvent[]>([]);
    const [prayerTimes, setPrayerTimes] = React.useState<PrayerTime[]>([]);
    const [nextPrayer, setNextPrayer] = React.useState<PrayerTime | null>(null);

    useEffect(() => {
        if (!selectedId && mosques.length) setSelectedId(mosques[0].id);
    }, [mosques]);

    useEffect(() => {
        if (!selectedId) {
            setSummary(null);
            setMembers([]);
            setEvents([]);
            setPrayerTimes([]);
            return;
        }
        const fetch = async () => {
            const s = await dbService.getMosqueSummary(selectedId);
            setSummary(s);
            const members = await dbService.getCollection<'members'>(selectedId, 'members');
            const events = await dbService.getCollection<'events'>(selectedId, 'events');
            const pt = await dbService.getCollection<'prayerTimes'>(selectedId, 'prayerTimes');
            setMembers(members as Member[]);
            setEvents(events as CommunityEvent[]);
            setPrayerTimes(pt as PrayerTime[]);
        };
        fetch();
    }, [selectedId]);

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
        <div className="min-h-screen bg-background dark:bg-dark-background">
            <header className="p-4 border-b dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <MosqueIcon className="h-8 w-8 text-primary"/>
                    <h1 className="text-xl font-bold">Masjid Manager</h1>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <Select className="h-10 rounded-md border px-3" value={selectedId ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedId(e.target.value)}>
                        {mosques.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                    <Button onClick={onGoToLogin}>Admin Login <ArrowRightIcon className="ml-2 h-4 w-4"/></Button>
                </div>
            </header>

            <main className="p-4 sm:p-8">
                <div className="text-center max-w-3xl mx-auto mb-6">
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">Welcome to Our Community of Mosques</h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Select a mosque from the dropdown to view public widgets for that mosque.</p>
                </div>

                {selectedId && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        {selectedMosque && (
                            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 border border-primary/10">
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{selectedMosque.name}</h1>
                                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                    <span>📍 {selectedMosque.address}</span>
                                </p>
                                {nextPrayer && (
                                    <p className="text-lg font-semibold text-primary mt-3 flex items-center gap-2">
                                        ⏰ Next Prayer: <span className="text-gray-900 dark:text-white">{nextPrayer.name}</span> at <span className="font-bold">{nextPrayer.time}</span>
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {nextPrayer && (
                            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-lg">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Next Prayer</p>
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <span className="text-4xl">⏰</span>
                                            <div>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{nextPrayer.name}</p>
                                                <p className="text-2xl font-bold text-primary mt-1">{nextPrayer.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Members</CardTitle>
                                    <CardDescription>Total active members</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{members.length}</div>
                                    <p className="text-xs text-gray-500">Most recent members shown below</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Events</CardTitle>
                                    <CardDescription>Next events</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{events.length}</div>
                                    <p className="text-xs text-gray-500">Next: {events[0]?.title ?? '—'}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upcoming Events</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {events.length ? events.slice(0,5).map(ev => (
                                            <div key={ev.id} className="p-2 border-b last:border-b-0">
                                                <div className="font-semibold">{ev.title}</div>
                                                <div className="text-xs text-gray-500">{ev.date} • {ev.type}</div>
                                            </div>
                                        )) : <p className="text-sm text-gray-500">No upcoming events.</p>}
                                    </CardContent>
                                </Card>

                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle>Recent Members</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {members.length ? members.slice(0,6).map(mb => (
                                            <div key={mb.id} className="p-2 border-b last:border-b-0 flex items-center space-x-3">
                                                <img src={mb.photo} className="h-10 w-10 rounded-full" alt={mb.name} />
                                                <div>
                                                    <div className="font-semibold">{mb.name}</div>
                                                    <div className="text-xs text-gray-500">{mb.role}</div>
                                                </div>
                                            </div>
                                        )) : <p className="text-sm text-gray-500">No members found.</p>}
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Prayer Times</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {prayerTimes.length ? (
                                            <ul className="space-y-2">
                                                {prayerTimes.map(pt => (
                                                    <li key={pt.id} className="flex justify-between">
                                                        <span>{pt.name}</span>
                                                        <span className="font-semibold">{pt.time}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">No prayer times set.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
