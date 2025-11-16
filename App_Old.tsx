import * as React from 'react';
import { useState, useEffect, ChangeEvent, FormEvent, MouseEvent, useRef } from 'react';
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

    const handleAddClick = () => {
        setEditingPrayerTime(null);
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
                <div className="flex gap-2">
                    <Button variant="outline">Calculation Method</Button>
                    <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Prayer Time</Button>
                </div>
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

interface AnnouncementFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: Announcement | null;
    onSave: () => void;
}

const AnnouncementFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: AnnouncementFormModalProps) => {
    const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'mosqueId'>>({
        title: initialData?.title || '',
        body: initialData?.body || '',
        audience: initialData?.audience || 'All',
        date: initialData?.date || new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                body: initialData.body,
                audience: initialData.audience,
                date: initialData.date,
            });
        } else {
            setFormData({
                title: '',
                body: '',
                audience: 'All',
                date: new Date().toISOString().split('T')[0],
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (initialData) {
                await dbService.updateDoc('announcements', { ...initialData, ...formData, mosqueId });
            } else {
                await dbService.addDoc(mosqueId, 'announcements', formData);
            }
            onSave();
            onClose();
        } catch (err: any) {
            setError('Failed to save announcement. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Announcement' : 'New Announcement'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="body">Body *</Label>
                    <Textarea id="body" value={formData.body} onChange={handleChange} rows={4} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="audience">Audience *</Label>
                        <select
                            id="audience"
                            value={formData.audience}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            required
                        >
                            <option value="All">All</option>
                            <option value="Members only">Members only</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Create Announcement'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const AnnouncementsPage = ({ mosque }: { mosque: Mosque }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const fetchAnnouncements = () => {
        dbService.getCollection<'announcements'>(mosque.id, 'announcements').then(setAnnouncements);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [mosque]);

    const handleAddClick = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (announcementId: string) => {
        if (window.confirm("Are you sure you want to delete this announcement?")) {
            await dbService.deleteDoc('announcements', announcementId);
            fetchAnnouncements();
        }
    };

    const columns: Column<Announcement>[] = [
        { header: 'Title', accessor: item => item.title },
        { header: 'Date', accessor: item => item.date },
        { header: 'Audience', accessor: item => item.audience },
        {
            header: 'Actions',
            accessor: item => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditClick(item))}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item.id))}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    ];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Announcements</h1>
                <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>New Announcement</Button>
            </div>
            <DataTable columns={columns} data={announcements} />
            <AnnouncementFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mosqueId={mosque.id}
                initialData={editingAnnouncement}
                onSave={fetchAnnouncements}
            />
        </div>
    );
}

interface DonationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: Donation | null;
    onSave: () => void;
}

const DonationFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: DonationFormModalProps) => {
    const [formData, setFormData] = useState<Omit<Donation, 'id' | 'mosqueId'>>({
        donorName: initialData?.donorName || '',
        amount: initialData?.amount || 0,
        purpose: initialData?.purpose || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                donorName: initialData.donorName,
                amount: initialData.amount,
                purpose: initialData.purpose,
                date: initialData.date,
            });
        } else {
            setFormData({
                donorName: '',
                amount: 0,
                purpose: '',
                date: new Date().toISOString().split('T')[0],
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (initialData) {
                await dbService.updateDoc('donations', { ...initialData, ...formData, mosqueId });
            } else {
                await dbService.addDoc(mosqueId, 'donations', formData);
            }
            onSave();
            onClose();
        } catch (err: any) {
            setError('Failed to save donation. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Donation' : 'Add Donation'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="donorName">Donor Name *</Label>
                    <Input id="donorName" value={formData.donorName} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input id="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Input id="purpose" value={formData.purpose} onChange={handleChange} required />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Add Donation'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const DonationsPage = ({ mosque }: { mosque: Mosque }) => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

    const fetchDonations = () => {
        dbService.getCollection<'donations'>(mosque.id, 'donations').then(setDonations);
    };

    useEffect(() => {
        fetchDonations();
    }, [mosque]);

    const handleAddClick = () => {
        setEditingDonation(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (donation: Donation) => {
        setEditingDonation(donation);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (donationId: string) => {
        if (window.confirm("Are you sure you want to delete this donation?")) {
            await dbService.deleteDoc('donations', donationId);
            fetchDonations();
        }
    };

    const columns: Column<Donation>[] = [
        { header: 'Donor', accessor: item => item.donorName },
        { header: 'Amount', accessor: item => `$${item.amount.toFixed(2)}` },
        { header: 'Purpose', accessor: item => item.purpose },
        { header: 'Date', accessor: item => item.date },
        {
            header: 'Actions',
            accessor: item => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditClick(item))}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item.id))}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    ];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Donations</h1>
                <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Donation</Button>
            </div>
            <DataTable columns={columns} data={donations} />
            <DonationFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mosqueId={mosque.id}
                initialData={editingDonation}
                onSave={fetchDonations}
            />
        </div>
    );
};

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: CommunityEvent | null;
    onSave: () => void;
}

const EventFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: EventFormModalProps) => {
    const [formData, setFormData] = useState<Omit<CommunityEvent, 'id' | 'mosqueId'>>({
        title: initialData?.title || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        type: initialData?.type || 'Event',
        capacity: initialData?.capacity || undefined,
        booked: initialData?.booked || 0,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                date: initialData.date,
                type: initialData.type,
                capacity: initialData.capacity,
                booked: initialData.booked || 0,
            });
        } else {
            setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                type: 'Event',
                capacity: undefined,
                booked: 0,
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent) => {
        const { id, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [id]: id === 'capacity' || id === 'booked' ? (value ? parseInt(value) : undefined) : value 
        }));
    };

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (initialData) {
                await dbService.updateDoc('events', { ...initialData, ...formData, mosqueId });
            } else {
                await dbService.addDoc(mosqueId, 'events', formData);
            }
            onSave();
            onClose();
        } catch (err: any) {
            setError('Failed to save event. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Event' : 'Add Event'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type *</Label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            required
                        >
                            <option value="Event">Event</option>
                            <option value="Iftari Slot">Iftari Slot</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity (optional)</Label>
                        <Input id="capacity" type="number" min="0" value={formData.capacity || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="booked">Booked</Label>
                        <Input id="booked" type="number" min="0" value={formData.booked || 0} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Add Event'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const EventsPage = ({ mosque }: { mosque: Mosque }) => {
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);

    const fetchEvents = () => {
        dbService.getCollection<'events'>(mosque.id, 'events').then(setEvents);
    };

    useEffect(() => {
        fetchEvents();
    }, [mosque]);

    const handleAddClick = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (event: CommunityEvent) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (eventId: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            await dbService.deleteDoc('events', eventId);
            fetchEvents();
        }
    };

    const columns: Column<CommunityEvent>[] = [
        { header: 'Title', accessor: item => item.title },
        { header: 'Date', accessor: item => item.date },
        { header: 'Type', accessor: item => item.type },
        { header: 'Booking', accessor: item => item.capacity ? `${item.booked || 0}/${item.capacity}` : 'N/A' },
        {
            header: 'Actions',
            accessor: item => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditClick(item))}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item.id))}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    ];
     return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Community Events</h1>
                <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Event</Button>
            </div>
            <DataTable columns={columns} data={events} />
            <EventFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mosqueId={mosque.id}
                initialData={editingEvent}
                onSave={fetchEvents}
            />
        </div>
    );
};

const MosquesPage = ({ mosques, onMosqueChange, onRefresh }: { mosques: Mosque[], onMosqueChange: (mosque: Mosque) => void, onRefresh: () => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMosque, setEditingMosque] = useState<Mosque | null>(null);

    const handleAddClick = () => {
        setEditingMosque(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (mosque: Mosque) => {
        setEditingMosque(mosque);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (mosqueId: string) => {
        if (window.confirm("Are you sure you want to delete this mosque? This will also delete all associated data (members, prayer times, events, etc.).")) {
            try {
                await dbService.deleteMosque(mosqueId);
                onRefresh();
            } catch (err: any) {
                alert('Failed to delete mosque: ' + (err.message || 'Unknown error'));
            }
        }
    };

    const handleSave = (mosque: Mosque) => {
        onRefresh();
        if (editingMosque && editingMosque.id === mosque.id) {
            onMosqueChange(mosque);
        }
    };

    const columns: Column<Mosque>[] = [
        { 
            header: 'Mosque', 
            accessor: item => (
                <div className="flex items-center space-x-3">
                    <img src={item.logoUrl} alt={item.name} className="h-10 w-10 rounded-md" />
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.address}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: item => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditClick(item))}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item.id))}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e: MouseClickEvent) => handleClick(e, () => onMosqueChange(item))}>
                        Select
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Mosques</h1>
                <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Mosque</Button>
            </div>
            <DataTable columns={columns} data={mosques} />
            <MosqueFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingMosque}
            />
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

interface MosqueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mosque: Mosque) => void;
    initialData?: Mosque | null;
}

const MosqueFormModal = ({ isOpen, onClose, onSave, initialData }: MosqueFormModalProps) => {
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ name: initialData.name, address: initialData.address });
            } else {
                setFormData({ name: '', address: '' });
            }
            setError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: InputChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.address.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            if (initialData) {
                const updatedMosque = await dbService.updateMosque(initialData.id, formData);
                onSave(updatedMosque);
            } else {
                const newMosque = await dbService.createMosque(formData);
                onSave(newMosque);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || `Failed to ${initialData ? 'update' : 'create'} mosque. Please try again.`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Mosque' : 'Add New Mosque'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Mosque Name *</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Al-Rahma Masjid"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                        id="address"
                        placeholder="e.g., 123 Islamic Way, Muslim Town"
                        value={formData.address}
                        onChange={(e) => handleFormChange(setFormData, e)}
                        rows={3}
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Save Changes' : 'Create Mosque'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

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

                {/* Widgets for selected mosque (visible to non-auth users) */}
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
                        
                        {/* Next Prayer Card - Prominent Display */}
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

                {/* removed legacy simple gallery cards to show widgets only for landing page */}
            </main>
        </div>
    );
};

// --- Profile Page ---
const AdminProfilePage = ({ user, onUserUpdate }: { user: User, onUserUpdate: (u: User) => void }) => {
    const [formData, setFormData] = React.useState({ name: user.name, email: user.email, avatar: user.avatar || '' });
    const [editMode, setEditMode] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [showPwModal, setShowPwModal] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setFormData({ name: user.name, email: user.email, avatar: user.avatar || '' });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        try {
            const updated = await dbService.updateUser(user.id, formData);
            onUserUpdate({ ...user, ...updated });
            setSuccess('Profile updated!');
            setEditMode(false);
        } catch (err: any) {
            setError(err.message || 'Error updating profile.');
        } finally { setLoading(false); }
    };

    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your admin account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="relative group">
                        <img src={formData.avatar || generateAvatarUrl(formData.name)} alt="avatar" className="w-24 h-24 object-cover rounded-full border-4 border-primary/20 shadow"/>
                        {editMode && (<>
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange}/>
                          <button type="button" onClick={()=>fileInputRef.current?.click()} className="absolute inset-0 bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-semibold transition-opacity">Change</button>
                        </>)}
                    </div>
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} disabled={!editMode} className="mt-1"/>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email} onChange={handleChange} disabled={!editMode} className="mt-1"/>
                </div>
                {error && <div className="text-red-500 bg-red-100 rounded px-3 py-1 text-sm">{error}</div>}
                {success && <div className="text-green-600 bg-green-50 rounded px-3 py-1 text-sm">{success}</div>}
                <div className="flex gap-3 justify-end pt-2">
                   {editMode ? (
                     <>
                       <Button type="button" variant="outline" onClick={()=>{setEditMode(false); setFormData({name:user.name,email:user.email,avatar:user.avatar||''});}}>Cancel</Button>
                       <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                     </>
                   ) : (
                     <>
                       <Button type="button" onClick={()=>setShowPwModal(true)}>Change Password</Button>
                       <Button type="button" variant="outline" onClick={()=>setEditMode(true)}>Edit Profile</Button>
                     </>
                   )}
                </div>
            </form>
          </CardContent>
        </Card>
        <ChangePasswordModal userId={user.id} open={showPwModal} onClose={()=>setShowPwModal(false)}/>
      </div>
    );
};

const ChangePasswordModal = ({ userId, open, onClose }: { userId: string, open: boolean, onClose: () => void }) => {
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = React.useState<{ type: 'success'|'error', text: string }|null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev=>({...prev,[e.target.name]:e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setLoading(true);
    if(form.newPassword!==form.confirm) {
      setMsg({type:'error',text:'Passwords do not match'}); setLoading(false); return;
    }
    try {
      await dbService.changePassword(userId, form.currentPassword, form.newPassword);
      setMsg({type:'success',text:'Password changed successfully.'});
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setMsg({type:'error',text:err.message||'Error changing password'});
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required value={form.currentPassword} onChange={handleChange} autoComplete="current-password" />
        </div>
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" name="newPassword" type="password" required value={form.newPassword} onChange={handleChange} autoComplete="new-password" minLength={6} />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input id="confirm" name="confirm" type="password" required value={form.confirm} onChange={handleChange} autoComplete="new-password" minLength={6} />
        </div>
        {msg && (
          <div className={msg.type==='error' ? 'text-red-500 bg-red-100 px-3 py-1 rounded':'text-green-600 bg-green-50 px-3 py-1 rounded'}>{msg.text}</div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading?'Saving...':'Change Password'}</Button>
        </div>
      </form>
    </Modal>
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
  const [isMosqueModalOpen, setIsMosqueModalOpen] = useState(false);

  const fetchMosques = () => {
    dbService.getMosques().then(data => {
        setMosques(data);
        if (data.length > 0 && !selectedMosque) {
            setSelectedMosque(data[0]);
        }
    });
  };

  useEffect(() => {
    fetchMosques();
  }, []);

  const handleAddMosque = () => {
    setIsMosqueModalOpen(true);
  };

  const handleMosqueCreated = async (newMosque: Mosque) => {
    setMosques([...mosques, newMosque]);
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
    setCurrentPage('dashboard'); // Default to dashboard after login
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setSelectedMosque(null); // Clear selected mosque on logout
    try { localStorage.removeItem('masjid_user'); } catch {}
  };

  const renderPage = () => {
    switch (currentPage) {
        case 'mosques': return <MosquesPage mosques={mosques} onMosqueChange={setSelectedMosque} onRefresh={fetchMosques} />;
        case 'dashboard': 
            if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
            return <DashboardPage mosque={selectedMosque} />;
        case 'members': 
            if (!selectedMosque) return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Select a mosque to begin.</div>;
            return <MembersPage mosque={selectedMosque} />;
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
      return <LoginScreen onLoginSuccess={handleLogin} onBackToLanding={() => setView('landing')} />;
    }
    return <LandingPage mosques={mosques} onGoToLogin={() => setView('login')} />;
  }
  
  // For mosques page, we don't need a selected mosque
  if (currentPage !== 'mosques' && !selectedMosque) {
    return <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background text-lg font-semibold text-gray-700 dark:text-gray-300">Loading mosques...</div>
  }

  // For mosques page, use first mosque as selected for layout (or create a dummy one)
  const layoutMosque = selectedMosque || (mosques.length > 0 ? mosques[0] : null);
  
  if (!layoutMosque && currentPage !== 'mosques') {
    return <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background text-lg font-semibold text-gray-700 dark:text-gray-300">No mosques available. Please create a mosque first.</div>
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
    </>
  );
}

export default App;