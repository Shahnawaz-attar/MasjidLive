import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog, MemberRole } from './types';
import { DataTable, Column } from './components/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Textarea, Modal } from './components/ui';
import { PlusIcon, EditIcon, TrashIcon } from './components/icons';
import { Sheet } from './components/Sheet';
import { db } from './mockDb';

type Page = 'Dashboard' | 'Members' | 'Timings' | 'Announcements' | 'Donations' | 'Events' | 'Audit';

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [email, setEmail] = useState('admin@masjid.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Simulate network delay
        await new Promise(res => setTimeout(res, 500));
        if (email === 'admin@masjid.com' && password === 'password123') {
            onLoginSuccess();
        } else {
            setError('Invalid email or password.');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-background">
            <div className="w-full max-w-md mx-auto">
                 <Card>
                    <CardHeader>
                        <CardTitle>Login to Masjid Manager</CardTitle>
                        <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                     <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                         <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-gray-600">
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
                                <Button variant="outline" className="w-full" type="button">Login with Google</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const MosqueSelectionScreen = ({ onSelectMosque, onLogout }: { onSelectMosque: (mosque: Mosque) => void; onLogout: () => void; }) => {
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMosqueName, setNewMosqueName] = useState('');
    const [newMosqueAddress, setNewMosqueAddress] = useState('');

    useEffect(() => {
        const fetchMosques = async () => {
            setLoading(true);
            const mosquesData = await db.getMosques();
            setMosques(mosquesData);
            setLoading(false);
        };
        fetchMosques();
    }, []);

    const handleCreateMosque = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMosqueName.trim() || !newMosqueAddress.trim()) return;
        
        await db.createMosque({
            name: newMosqueName,
            address: newMosqueAddress,
        });

        setNewMosqueName('');
        setNewMosqueAddress('');
        setIsModalOpen(false);
        // Refetch mosques
        const mosquesData = await db.getMosques();
        setMosques(mosquesData);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading Mosques...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-background p-8">
            <h1 className="text-4xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">Select a Mosque</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Choose a mosque to manage or create a new one.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {mosques.map(mosque => (
                    <Card key={mosque.id} className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform" onClick={() => onSelectMosque(mosque)}>
                        <CardHeader className="flex-row items-center gap-4">
                           <img src={mosque.logoUrl} alt={mosque.name} className="w-16 h-16 rounded-lg" />
                           <div>
                                <CardTitle>{mosque.name}</CardTitle>
                                <CardDescription>{mosque.address}</CardDescription>
                           </div>
                        </CardHeader>
                    </Card>
                ))}
                 <Card className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700" onClick={() => setIsModalOpen(true)}>
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <PlusIcon className="w-12 h-12 mx-auto mb-2" />
                        <span className="font-semibold">Create New Mosque</span>
                    </div>
                </Card>
            </div>
            <div className="text-center mt-8">
                 <Button variant="ghost" onClick={onLogout}>Logout</Button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Mosque">
                <form onSubmit={handleCreateMosque} className="space-y-4">
                     <div>
                        <Label htmlFor="mosqueName">Mosque Name</Label>
                        <Input id="mosqueName" value={newMosqueName} onChange={e => setNewMosqueName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="mosqueAddress">Address</Label>
                        <Textarea id="mosqueAddress" value={newMosqueAddress} onChange={e => setNewMosqueAddress(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Create Mosque</Button>
                </form>
            </Modal>
        </div>
    );
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  
  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // UI States
  const [isMemberSheetOpen, setMemberSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [refreshData, setRefreshData] = useState(false);

  // Fetch data when a mosque is selected
  useEffect(() => {
    if (selectedMosque) {
      const fetchData = async () => {
        setLoading(true);
        const [membersData, prayerTimesData, announcementsData, donationsData, eventsData, auditLogsData] = await Promise.all([
          db.getCollection<Member>(selectedMosque.id, 'members'),
          db.getCollection<PrayerTime>(selectedMosque.id, 'prayerTimes'),
          db.getCollection<Announcement>(selectedMosque.id, 'announcements'),
          db.getCollection<Donation>(selectedMosque.id, 'donations'),
          db.getCollection<CommunityEvent>(selectedMosque.id, 'events'),
          db.getCollection<AuditLog>(selectedMosque.id, 'auditLogs'),
        ]);
        setMembers(membersData);
        setPrayerTimes(prayerTimesData);
        setAnnouncements(announcementsData);
        setDonations(donationsData);
        setEvents(eventsData);
        setAuditLogs(auditLogsData);
        setLoading(false);
      };
      fetchData();
    }
  }, [selectedMosque, refreshData]);

  const handleAddMember = async (memberData: Omit<Member, 'id' | 'mosqueId'>) => {
    if (!selectedMosque) return;
    await db.addDoc(selectedMosque.id, 'members', memberData);
    setMemberSheetOpen(false);
    setRefreshData(p => !p); // Trigger data refresh
  };

  const handleUpdateMember = async (memberData: Member) => {
    if (!selectedMosque || !editingMember) return;
    await db.updateDoc('members', memberData);
    setMemberSheetOpen(false);
    setEditingMember(null);
    setRefreshData(p => !p); // Trigger data refresh
  };
  
  const handleDeleteMember = async (memberId: string) => {
      if (!selectedMosque || !window.confirm("Are you sure you want to delete this member?")) return;
      await db.deleteDoc('members', memberId);
      setRefreshData(p => !p); // Trigger data refresh
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedMosque(null);
    setCurrentPage('Dashboard');
  };
  
  const renderPageContent = () => {
    if (!selectedMosque || loading) return <div className="p-6">Loading data...</div>;

    switch (currentPage) {
      case 'Dashboard':
        return <div className="text-gray-900 dark:text-gray-100">Welcome to the Dashboard for {selectedMosque.name}.</div>;
      case 'Members':
        const memberColumns: Column<Member>[] = [
            { header: 'Name', accessor: (item) => <div className="flex items-center"><img src={item.photo} alt={item.name} className="w-8 h-8 rounded-full mr-3" /><span>{item.name}</span></div> },
            { header: 'Role', accessor: (item) => item.role },
            { header: 'Contact', accessor: (item) => item.contact },
            { header: 'Actions', accessor: (item) => (
                <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingMember(item); setMemberSheetOpen(true); }}>
                        <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteMember(item.id); }}>
                        <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            )},
        ];
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Members</h1>
                    <Button onClick={() => { setEditingMember(null); setMemberSheetOpen(true); }}><PlusIcon className="w-4 h-4 mr-2" /> Add Member</Button>
                </div>
                <DataTable columns={memberColumns} data={members} onRowClick={(member) => {setEditingMember(member); setMemberSheetOpen(true);}} />
                <MemberFormSheet 
                    isOpen={isMemberSheetOpen}
                    onClose={() => { setMemberSheetOpen(false); setEditingMember(null); }}
                    onSubmit={editingMember ? handleUpdateMember : handleAddMember}
                    member={editingMember}
                />
            </div>
        );
      default:
        return <div>Page coming soon: {currentPage}</div>;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }
  
  if (!selectedMosque) {
    return <MosqueSelectionScreen onSelectMosque={setSelectedMosque} onLogout={handleLogout} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      theme={theme}
      setTheme={setTheme}
      selectedMosque={selectedMosque}
      onLogout={handleLogout}
      onSwitchMosque={() => setSelectedMosque(null)}
    >
      {renderPageContent()}
    </Layout>
  );
};

// A form component for adding/editing members
const MemberFormSheet = ({ isOpen, onClose, onSubmit, member }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; member: Member | null; }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<MemberRole>('Volunteer');
    const [contact, setContact] = useState('');
    const [background, setBackground] = useState('');

    useEffect(() => {
        if (member) {
            setName(member.name);
            setRole(member.role);
            setContact(member.contact);
            setBackground(member.background);
        } else {
            setName('');
            setRole('Volunteer');
            setContact('');
            setBackground('');
        }
    }, [member]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...(member && { id: member.id, mosqueId: member.mosqueId }), // Keep id and mosqueId if editing
            name,
            role,
            contact,
            background,
            photo: member?.photo || `https://i.pravatar.cc/150?u=${contact}`,
        });
    };

    return (
         <Sheet isOpen={isOpen} onClose={onClose} title={member ? "Edit Member" : "Add New Member"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="role">Role</Label>
                    <select id="role" value={role} onChange={e => setRole(e.target.value as MemberRole)} className="w-full h-10 px-3 py-2 text-sm bg-transparent border border-gray-300 rounded-md dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary">
                        <option>Imam</option>
                        <option>Muazzin</option>
                        <option>Committee</option>
                        <option>Volunteer</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="contact">Contact (Email)</Label>
                    <Input id="contact" type="email" value={contact} onChange={e => setContact(e.target.value)} required />
                </div>
                 <div>
                    <Label htmlFor="background">Background Info</Label>
                    <Textarea id="background" value={background} onChange={e => setBackground(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">{member ? 'Save Changes' : 'Add Member'}</Button>
            </form>
        </Sheet>
    );
};

export default App;