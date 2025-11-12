import * as React from 'react';
import { useState, useEffect, ChangeEvent, FormEvent, MouseEvent } from 'react';
import Layout from './components/Layout';
import { Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog, User, MosqueSummary, MemberRole, UserWithoutPassword, MemberEducation } from './types';
import { DataTable, Column } from './components/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Modal, Textarea, Select } from './components/ui';
import { PlusIcon, MosqueIcon, ArrowRightIcon, UsersIcon, CalendarIcon, MegaphoneIcon, DollarSignIcon, EditIcon, TrashIcon } from './components/icons';
import dbService from './database/clientService';
import { generateAvatarUrl, isValidImageFile, fileToBase64 } from './lib/avatar';

// Event handler types
type InputChangeEvent = ChangeEvent<HTMLInputElement>;
type SelectChangeEvent = ChangeEvent<HTMLSelectElement>;
type TextareaChangeEvent = ChangeEvent<HTMLTextAreaElement>;
type FormSubmitEvent = FormEvent<HTMLFormElement>;
type MouseClickEvent = MouseEvent<HTMLButtonElement>;

// Function to handle type-safe form changes
const handleFormChange = <T extends Record<string, any>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent
) => {
    const { id, value } = e.target;
    setter(prev => ({ ...prev, [id]: value }));
};

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

// Component props types
interface MemberFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: Member | null;
    onSave: () => void;
}

interface PrayerTimeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: PrayerTime | null;
    onSave: () => void;
}

const DashboardPage = ({ mosque }: { mosque: Mosque }) => {
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
            // Fix: Specify the string literal type for the collection name and cast the result of Promise.all
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

            // Sort by date descending and take top 5
            setRecentMembers([...members].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5));
            setUpcomingEvents([...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(e => new Date(e.date) >= now).slice(0, 4));
            setRecentAnnouncements([...announcements].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3));
        };

        fetchDashboardData();
    }, [mosque]);
    
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

    const prayerTimesColumns: Column<PrayerTime>[] = [
        { header: 'Prayer', accessor: item => item.name, cellClassName: 'font-semibold' },
        { header: 'Time', accessor: item => item.time, cellClassName: 'font-bold text-lg' },
    ];

    const recentMembersColumns: Column<Member>[] = [
        { header: 'Name', accessor: item => <div className="flex items-center space-x-2"><img src={item.photo} className="h-8 w-8 rounded-full" alt={item.name}/><span>{item.name}</span></div> },
        { header: 'Role', accessor: item => item.role },
    ];


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

const MemberFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: MemberFormModalProps) => {
    const [formData, setFormData] = useState<Omit<Member, 'id' | 'mosqueId'>>({
        name: initialData?.name || '',
        role: initialData?.role || 'Volunteer',
        contact: initialData?.contact || '',
        background: initialData?.background || '',
        photo: initialData?.photo || '',
        education: initialData?.education || 'None'
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(initialData?.photo || '');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                role: initialData.role,
                contact: initialData.contact,
                background: initialData.background,
                photo: initialData.photo,
                education: initialData.education || 'None'
            });
            setImagePreview(initialData.photo);
        } else {
            setFormData({ name: '', role: 'Volunteer', contact: '', background: '', photo: '', education: 'None' });
            setImagePreview('');
        }
        setImageFile(null);
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = isValidImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setImageFile(file);
        setError('');

        const base64 = await fileToBase64(file);
        setImagePreview(base64);
    };

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        setError('');

        try {
            let photoUrl = formData.photo;

            if (imageFile) {
                photoUrl = await fileToBase64(imageFile);
            } else if (!formData.photo) {
                photoUrl = generateAvatarUrl(formData.name);
            }

            if (initialData) {
                await dbService.updateDoc('members', { ...initialData, ...formData, photo: photoUrl, mosqueId });
            } else {
                await dbService.addDoc(mosqueId, 'members', { ...formData, photo: photoUrl });
            }
            onSave();
            onClose();
        } catch (err) {
            setError('Failed to save member. Please try again.');
        }
    };

    const roles: MemberRole[] = ['Imam', 'Muazzin', 'Committee', 'Volunteer'];
    const shouldShowEducation = formData.role === 'Imam' || formData.role === 'Muazzin';
    const educationOptions: MemberEducation[] = ['None', 'Mufti', 'Hafiz', 'Talimuddin'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Member' : 'Add New Member'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <img
                            src={imagePreview || generateAvatarUrl(formData.name || 'Member')}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                        />
                        <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <span className="text-lg">📷</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Shahnawaz"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>

                    {shouldShowEducation && (
                        <div className="space-y-2">
                            <Label htmlFor="education">Education</Label>
                            <select
                                id="education"
                                value={formData.education || 'None'}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                {educationOptions.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact">Contact *</Label>
                    <Input
                        id="contact"
                        placeholder="e.g., +92-300-1234567"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="background">Background Information</Label>
                    <Textarea
                        id="background"
                        placeholder="e.g., Experience, qualifications, brief bio..."
                        value={formData.background}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Save Changes' : 'Add Member'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};


const MembersPage = ({ mosque }: { mosque: Mosque }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const fetchMembers = () => {
        // Fix: Specify the string literal type for the collection name
        dbService.getCollection<'members'>(mosque.id, 'members').then(setMembers);
    };

    useEffect(() => {
        fetchMembers();
    }, [mosque]);

    const handleAddMemberClick = () => {
        setEditingMember(null);
        setIsMemberModalOpen(true);
    };

    const handleEditMember = (member: Member) => {
        setEditingMember(member);
        setIsMemberModalOpen(true);
    };

    const handleDeleteMember = async (memberId: string) => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            await dbService.deleteDoc('members', memberId);
            fetchMembers();
        }
    };

    const columns: Column<Member>[] = [
        { header: 'Name', accessor: item => <div className="flex items-center space-x-3"><img src={item.photo} className="h-10 w-10 rounded-full" alt={item.name}/><span>{item.name}</span></div> },
        { header: 'Role', accessor: item => item.role },
        { header: 'Contact', accessor: item => item.contact },
        {
            header: 'Actions', 
            accessor: item => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditMember(item))}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteMember(item.id))}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    ];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Members</h1>
                <Button onClick={handleAddMemberClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Member</Button>
            </div>
            <DataTable columns={columns} data={members} />
            <MemberFormModal 
                isOpen={isMemberModalOpen} 
                onClose={() => setIsMemberModalOpen(false)} 
                mosqueId={mosque.id} 
                initialData={editingMember} 
                onSave={fetchMembers} 
            />
        </div>
    );
};


const PrayerTimeFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: PrayerTimeFormModalProps) => {
    const [formData, setFormData] = useState<Omit<PrayerTime, 'id'>>({
        name: initialData?.name || 'Fajr',
        time: initialData?.time || '00:00 AM',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({ name: initialData.name, time: initialData.time });
        } else {
            setFormData({ name: 'Fajr', time: '00:00 AM' });
        }
    }, [initialData]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        if (initialData) {
            await dbService.updateDoc('prayerTimes', { ...initialData, ...formData });
        } else {
            // This case might not be needed if we only edit existing prayer times, not add new ones.
            // But included for completeness for a typical form.
            await dbService.addDoc(mosqueId, 'prayerTimes', formData);
        }
        onSave();
        onClose();
    };

    const prayerNames: PrayerTime['name'][] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Prayer Time' : 'Add Prayer Time'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Prayer Name</Label>
                    <select id="name" value={formData.name} onChange={handleChange} className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        {prayerNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={formData.time} onChange={handleChange} required />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Add Prayer Time'}</Button>
                </div>
            </form>
        </Modal>
    );
};


const PrayerTimesPage = ({ mosque }: { mosque: Mosque }) => {
    const [times, setTimes] = useState<PrayerTime[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPrayerTime, setEditingPrayerTime] = useState<PrayerTime | null>(null);

    const fetchPrayerTimes = () => {
        // Fix: Specify the string literal type for the collection name
        dbService.getCollection<'prayerTimes'>(mosque.id, 'prayerTimes').then(setTimes);
    };

    useEffect(() => {
        fetchPrayerTimes();
    }, [mosque]);

    const handleEditClick = (prayerTime: PrayerTime) => {
        setEditingPrayerTime(prayerTime);
        setIsEditModalOpen(true);
    };

    const columns: Column<PrayerTime>[] = [
        { header: 'Prayer', accessor: item => item.name, cellClassName: 'font-semibold' },
        { header: 'Time', accessor: item => item.time, cellClassName: 'text-lg font-bold' },
        {
            header: 'Actions',
            accessor: item => (
                <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => { e.stopPropagation(); handleEditClick(item); }}>
                    <EditIcon className="h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Prayer Times</h1>
                <Button variant="outline">Calculation Method</Button>
            </div>
            <DataTable columns={columns} data={times} />
            <PrayerTimeFormModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                mosqueId={mosque.id} 
                initialData={editingPrayerTime} 
                onSave={fetchPrayerTimes} 
            />
        </div>
    )
};

const AnnouncementsPage = ({ mosque }: { mosque: Mosque }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    useEffect(() => {
        // Fix: Specify the string literal type for the collection name
        dbService.getCollection<'announcements'>(mosque.id, 'announcements').then(setAnnouncements);
    }, [mosque]);
    const columns: Column<Announcement>[] = [
        { header: 'Title', accessor: item => item.title },
        { header: 'Date', accessor: item => item.date },
        { header: 'Audience', accessor: item => item.audience },
    ];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Announcements</h1>
                <Button><PlusIcon className="h-4 w-4 mr-2"/>New Announcement</Button>
            </div>
            <DataTable columns={columns} data={announcements} />
        </div>
    );
}

const DonationsPage = ({ mosque }: { mosque: Mosque }) => {
    const [donations, setDonations] = useState<Donation[]>([]);
    useEffect(() => {
        // Fix: Specify the string literal type for the collection name
        dbService.getCollection<'donations'>(mosque.id, 'donations').then(setDonations);
    }, [mosque]);
    const columns: Column<Donation>[] = [
        { header: 'Donor', accessor: item => item.donorName },
        { header: 'Amount', accessor: item => `$${item.amount.toFixed(2)}` },
        { header: 'Purpose', accessor: item => item.purpose },
        { header: 'Date', accessor: item => item.date },
    ];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Donations</h1>
                <Button><PlusIcon className="h-4 w-4 mr-2"/>Add Donation</Button>
            </div>
            <DataTable columns={columns} data={donations} />
        </div>
    );
};

const EventsPage = ({ mosque }: { mosque: Mosque }) => {
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    useEffect(() => {
        // Fix: Specify the string literal type for the collection name
        dbService.getCollection<'events'>(mosque.id, 'events').then(setEvents);
    }, [mosque]);
    const columns: Column<CommunityEvent>[] = [
        { header: 'Title', accessor: item => item.title },
        { header: 'Date', accessor: item => item.date },
        { header: 'Type', accessor: item => item.type },
        { header: 'Booking', accessor: item => item.capacity ? `${item.booked}/${item.capacity}` : 'N/A' },
    ];
     return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Community Events</h1>
                <Button><PlusIcon className="h-4 w-4 mr-2"/>Add Event</Button>
            </div>
            <DataTable columns={columns} data={events} />
        </div>
    );
};

const AuditLogPage = ({ mosque }: { mosque: Mosque }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    useEffect(() => {
        // Fix: Specify the string literal type for the collection name
        dbService.getCollection<'auditLogs'>(mosque.id, 'auditLogs').then(setLogs);
    }, [mosque]);
    const columns: Column<AuditLog>[] = [
        { header: 'User', accessor: item => item.user },
        { header: 'Action', accessor: item => item.action },
        { header: 'Details', accessor: item => item.details },
        { header: 'Date', accessor: item => item.date },
    ];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Audit Log</h1>
            </div>
            <DataTable columns={columns} data={logs} />
        </div>
    );
}

const LoginScreen = ({ onLoginSuccess, onBackToLanding }: { onLoginSuccess: (user: UserWithoutPassword) => void, onBackToLanding: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = (e: InputChangeEvent) => setEmail(e.target.value);
    const handlePasswordChange = (e: InputChangeEvent) => setPassword(e.target.value);

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        setError('');
        const user = await dbService.login(email, password);
        if (user) {
            onLoginSuccess(user);
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-dark-background p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <MosqueIcon className="h-12 w-12 text-primary mx-auto"/>
                    <h1 className="text-3xl font-bold mt-2">Masjid Manager</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Login</CardTitle>
                        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="admin@masjid.com" required value={email} onChange={handleEmailChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required value={password} onChange={handlePasswordChange} placeholder="password123"/>
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="text-center mt-4">
                    <Button variant="link" onClick={onBackToLanding}>Back to Public View</Button>
                </div>
            </div>
        </div>
    );
};

const LandingPage = ({ mosques, onGoToLogin }: { mosques: Mosque[], onGoToLogin: () => void }) => {
    const [selectedId, setSelectedId] = React.useState<string | null>(mosques.length ? mosques[0].id : null);
    const [summary, setSummary] = React.useState<MosqueSummary | null>(null);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [events, setEvents] = React.useState<CommunityEvent[]>([]);
    const [prayerTimes, setPrayerTimes] = React.useState<PrayerTime[]>([]);

    useEffect(() => {
        if (!selectedId && mosques.length) setSelectedId(mosques[0].id);
    }, [mosques]);

    useEffect(() => {
        if (!selectedId) return;
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

                {/* Widgets for selected mosque (visible to non-auth users) */}
                {selectedId && (
                    <div className="max-w-5xl mx-auto space-y-6">
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

                            <Card>
                                <CardHeader>
                                    <CardTitle>Next Prayer</CardTitle>
                                    <CardDescription>Upcoming prayer time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{summary?.nextPrayer?.time ?? 'N/A'}</div>
                                    <p className="text-xs text-gray-500">{summary?.nextPrayer?.name ?? ''}</p>
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

                {/* removed legacy simple gallery cards to show widgets only for landing page */}
            </main>
        </div>
    );
};


function App() {
    // Client app should not run server-side DB initialization (better-sqlite3 / fs).
    // database initialization happens server-side or via scripts.
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
          // user no longer valid on server, force logout
          handleLogout();
        }
      } catch (err) {
        // on any error, logout to be safe
        if (mounted) handleLogout();
      }
    };
    validate();
    return () => { mounted = false; };
  }, [user]);
  const [view, setView] = useState('landing'); // 'landing' or 'login'
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    dbService.getMosques().then(data => {
        setMosques(data);
        if (data.length > 0 && !selectedMosque) {
            setSelectedMosque(data[0]);
        }
    });
  }, []);

  const handleLogin = (loggedInUser: UserWithoutPassword) => {
    const asUser = loggedInUser as User;
    setUser(asUser);
    try { localStorage.setItem('masjid_user', JSON.stringify(asUser)); } catch {}
    setCurrentPage('dashboard'); // Default to dashboard after login
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setSelectedMosque(null); // Clear selected mosque on logout
    try { localStorage.removeItem('masjid_user'); } catch {}
  };

  const renderPage = () => {
    if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;

    switch (currentPage) {
        case 'dashboard': return <DashboardPage mosque={selectedMosque} />;
        case 'members': return <MembersPage mosque={selectedMosque} />;
        case 'prayer-times': return <PrayerTimesPage mosque={selectedMosque} />;
        case 'announcements': return <AnnouncementsPage mosque={selectedMosque} />;
        case 'donations': return <DonationsPage mosque={selectedMosque} />;
        case 'events': return <EventsPage mosque={selectedMosque} />;
        case 'audit-log': return <AuditLogPage mosque={selectedMosque} />;
        default: return <DashboardPage mosque={selectedMosque} />;
    }
  }
  
  if (!user) {
    if (view === 'login') {
      return <LoginScreen onLoginSuccess={handleLogin} onBackToLanding={() => setView('landing')} />;
    }
    return <LandingPage mosques={mosques} onGoToLogin={() => setView('login')} />;
  }
  
  if (!selectedMosque) {
    return <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background text-lg font-semibold text-gray-700 dark:text-gray-300">Loading mosques...</div>
  }

  return (
    <Layout
      user={user}
      mosques={mosques}
      selectedMosque={selectedMosque}
      onMosqueChange={setSelectedMosque}
      onNavigate={setCurrentPage}
      currentPage={currentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;