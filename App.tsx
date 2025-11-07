
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import { Card, Button, Badge, Input, Label, Modal, Textarea } from './components/ui';
import { DataTable, Column } from './components/DataTable';
import { Sheet } from './components/Sheet';
import {
  MOCK_MEMBERS, MOCK_PRAYER_TIMES, MOCK_ANNOUNCEMENTS, MOCK_EVENTS,
  MOCK_DONATIONS, MOCK_AUDIT_LOGS, MOCK_MOSQUES
} from './constants';
import { Member, MemberRole, PrayerTime, CommunityEvent, Mosque } from './types';
// FIX: Added missing CalendarIcon and DollarSignIcon imports to resolve 'Cannot find name' errors.
import { BuildingIcon, ClockIcon, EditIcon, GripVerticalIcon, PlusIcon, TrashIcon, UsersIcon, CalendarIcon, DollarSignIcon } from './components/icons';

type Page = 'Dashboard' | 'Members' | 'Timings' | 'Announcements' | 'Donations' | 'Events' | 'Audit';

// --- Helper Components ---
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="flex items-center">
        <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
        <div className="ml-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </Card>
);

const roleColors: Record<MemberRole, string> = {
    'Imam': 'bg-green-100 text-green-800',
    'Muazzin': 'bg-blue-100 text-blue-800',
    'Committee': 'bg-yellow-100 text-yellow-800',
    'Volunteer': 'bg-purple-100 text-purple-800',
};

// --- Page Components ---

const DashboardPage: React.FC<{ members: Member[], events: CommunityEvent[] }> = ({ members, events }) => {
    const defaultOrder = ['announcements', 'timings'];
    const [widgetOrder, setWidgetOrder] = useState(defaultOrder);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedItem(id);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        if (!draggedItem) return;

        const newOrder = [...widgetOrder];
        const draggedIndex = newOrder.indexOf(draggedItem);
        const targetIndex = newOrder.indexOf(targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            [newOrder[draggedIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[draggedIndex]];
            setWidgetOrder(newOrder);
        }
        setDraggedItem(null);
    };
    
    const widgets: Record<string, React.ReactNode> = {
        'announcements': (
            <Card className="col-span-1" key="announcements">
                <div className="flex justify-between items-center mb-4 cursor-move" draggable onDragStart={(e) => handleDragStart(e, 'announcements')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'announcements')}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Announcements</h3>
                    <GripVerticalIcon className="w-5 h-5 text-gray-400" />
                </div>
                <ul className="space-y-4">
                    {MOCK_ANNOUNCEMENTS.slice(0, 2).map(ann => (
                        <li key={ann.id} className="border-l-4 border-primary pl-4">
                            <p className="font-semibold">{ann.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{ann.body}</p>
                        </li>
                    ))}
                </ul>
            </Card>
        ),
        'timings': (
            <Card className="col-span-1" key="timings">
                <div className="flex justify-between items-center mb-4 cursor-move" draggable onDragStart={(e) => handleDragStart(e, 'timings')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'timings')}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Today's Prayer Times</h3>
                    <GripVerticalIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-2">
                    {MOCK_PRAYER_TIMES.map(pt => (
                        <div key={pt.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pt.name}</span>
                            <span className="font-semibold text-primary">{pt.time}</span>
                        </div>
                    ))}
                </div>
            </Card>
        ),
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Members" value={members.length.toString()} icon={<UsersIcon className="w-6 h-6 text-primary" />} />
                <StatCard title="Upcoming Events" value={events.length.toString()} icon={<CalendarIcon className="w-6 h-6 text-primary" />} />
                <StatCard title="Next Prayer" value="Asr" icon={<ClockIcon className="w-6 h-6 text-primary" />} />
                <StatCard title="Donations this Month" value={`$${MOCK_DONATIONS.reduce((sum, d) => sum + d.amount, 0)}`} icon={<DollarSignIcon className="w-6 h-6 text-primary" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {widgetOrder.map(id => widgets[id])}
            </div>
        </div>
    );
};

const MembersPage: React.FC<{
    members: Member[];
    onAddMember: () => void;
    onEditMember: (member: Member) => void;
    onDeleteMember: (memberId: string) => void;
    onViewMember: (member: Member) => void;
}> = ({ members, onAddMember, onEditMember, onDeleteMember, onViewMember }) => {
    const columns: Column<Member>[] = [
        {
            header: 'Name',
            accessor: (member) => (
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={member.photo} alt={member.name} />
                    <div className="ml-4">
                        <div className="font-medium text-gray-800 dark:text-gray-100">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.contact}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Role',
            accessor: (member) => <Badge color={roleColors[member.role]}>{member.role}</Badge>,
        },
        {
            header: 'Actions',
            accessor: (member) => (
                <div className="space-x-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEditMember(member); }}>
                        <EditIcon className="w-4 h-4"/>
                    </Button>
                     <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={(e) => { e.stopPropagation(); onDeleteMember(member.id); }}>
                        <TrashIcon className="w-4 h-4"/>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Members</h2>
                <Button onClick={onAddMember}><PlusIcon className="w-5 h-5 mr-2" /> Add Member</Button>
            </div>
            <DataTable columns={columns} data={members} onRowClick={onViewMember}/>
        </div>
    );
};

const MemberDetailSheet: React.FC<{ member: Member | null, onClose: () => void }> = ({ member, onClose }) => {
    return (
        <Sheet isOpen={!!member} onClose={onClose} title="Member Details">
            {member && (
                <div className="space-y-6">
                    <div className="flex flex-col items-center">
                        <img className="h-24 w-24 rounded-full" src={member.photo} alt={member.name} />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{member.name}</h3>
                        <Badge color={roleColors[member.role]} className="mt-1">{member.role}</Badge>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Contact Information</h4>
                        <p className="text-gray-600 dark:text-gray-400">{member.contact}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Background</h4>
                        <p className="text-gray-600 dark:text-gray-400">{member.background}</p>
                    </div>
                </div>
            )}
        </Sheet>
    );
};

const MemberForm: React.FC<{
    member: Member | null;
    onSave: (member: Omit<Member, 'id' | 'mosqueId'> & { id?: string }) => void;
    onCancel: () => void;
}> = ({ member, onSave, onCancel }) => {
    const [name, setName] = useState(member?.name || '');
    const [role, setRole] = useState<MemberRole>(member?.role || 'Volunteer');
    const [contact, setContact] = useState(member?.contact || '');
    const [background, setBackground] = useState(member?.background || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(member && { id: member.id }),
            name,
            role,
            contact,
            background,
            photo: member?.photo || `https://i.pravatar.cc/150?u=${name}`
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="role">Role</Label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value as MemberRole)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <option>Imam</option>
                    <option>Muazzin</option>
                    <option>Committee</option>
                    <option>Volunteer</option>
                </select>
            </div>
            <div>
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="background">Background</Label>
                <Textarea id="background" value={background} onChange={(e) => setBackground(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Member</Button>
            </div>
        </form>
    );
};

const MosqueForm: React.FC<{
    mosque: Mosque | null;
    onSave: (mosque: Omit<Mosque, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}> = ({ mosque, onSave, onCancel }) => {
    const [name, setName] = useState(mosque?.name || '');
    const [address, setAddress] = useState(mosque?.address || '');
    const [logoUrl, setLogoUrl] = useState(mosque?.logoUrl || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(mosque && { id: mosque.id }),
            name,
            address,
            logoUrl: logoUrl || 'https://e7.pngegg.com/pngimages/724/24/png-clipart-al-masjid-an-nabawi-green-dome-mosque-islamic-green-and-brown-mosque-cdr-building-thumbnail.png',
        });
    };

    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="mosque-name">Mosque Name</Label>
                <Input id="mosque-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="mosque-address">Address</Label>
                <Input id="mosque-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
             <div>
                <Label htmlFor="mosque-logo">Logo URL</Label>
                <Input id="mosque-logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Mosque</Button>
            </div>
        </form>
    );
};


const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-gray-400">{title} - Coming Soon</h2>
    </div>
);

// --- Login & Mosque Selection Screens ---

const LoginScreen: React.FC<{ onLogin: (pass: boolean) => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === 'admin@masjid.com' && password === 'password123') {
            setError('');
            onLogin(true);
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
            <Card className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Masjid Manager Login</h2>
                </div>
                 {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@masjid.com" />
                    </div>
                     <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="password123" />
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </Card>
        </div>
    );
}

const MosqueSelectionScreen: React.FC<{ 
    mosques: Mosque[]; 
    onSelectMosque: (mosque: Mosque) => void;
    onAddMosque: () => void;
    onEditMosque: (mosque: Mosque) => void;
    onDeleteMosque: (mosqueId: string) => void;
}> = ({ mosques, onSelectMosque, onAddMosque, onEditMosque, onDeleteMosque }) => {
    return (
        <div className="min-h-screen bg-background dark:bg-dark-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Select a Mosque to Manage</h1>
                    <Button onClick={onAddMosque}><PlusIcon className="mr-2"/> Add New Mosque</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mosques.map(mosque => (
                        <Card key={mosque.id} className="group relative cursor-pointer hover:shadow-lg hover:-translate-y-1">
                            <div onClick={() => onSelectMosque(mosque)}>
                                <div className="flex flex-col items-center text-center">
                                    <img src={mosque.logoUrl} alt={mosque.name} className="w-20 h-20 rounded-full object-cover mb-4" />
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{mosque.name}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{mosque.address}</p>
                                </div>
                            </div>
                            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => onEditMosque(mosque)}><EditIcon className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDeleteMosque(mosque.id)}><TrashIcon className="w-4 h-4"/></Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  // Data state
  const [mosques, setMosques] = useState<Mosque[]>(MOCK_MOSQUES);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);

  // Modal and Sheet state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isMosqueFormOpen, setIsMosqueFormOpen] = useState(false);
  const [editingMosque, setEditingMosque] = useState<Mosque | null>(null);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedMosque(null);
  };
  
  const handleSwitchMosque = () => setSelectedMosque(null);

  // Filtered data based on selected mosque
  const filteredMembers = members.filter(m => m.mosqueId === selectedMosque?.id);
  const filteredEvents = MOCK_EVENTS.filter(e => e.mosqueId === selectedMosque?.id);
  
  // --- CRUD Handlers ---
  const handleSaveMosque = (mosqueData: Omit<Mosque, 'id'> & { id?: string }) => {
    if (mosqueData.id) { // Edit
        setMosques(mosques.map(m => m.id === mosqueData.id ? { ...m, ...mosqueData } : m));
    } else { // Create
        const newMosque = { ...mosqueData, id: `mosque-${Date.now()}` };
        setMosques([...mosques, newMosque]);
    }
    setIsMosqueFormOpen(false);
    setEditingMosque(null);
  };
  
  const handleDeleteMosque = (mosqueId: string) => {
    if (window.confirm("Are you sure you want to delete this mosque and all its data?")) {
        setMosques(mosques.filter(m => m.id !== mosqueId));
        // Also delete associated members, events etc.
        setMembers(members.filter(m => m.mosqueId !== mosqueId));
    }
  };

  const handleSaveMember = (memberData: Omit<Member, 'id' | 'mosqueId'> & { id?: string }) => {
    if (!selectedMosque) return;
    if (memberData.id) { // Edit
        setMembers(members.map(m => m.id === memberData.id ? { ...m, ...memberData, mosqueId: selectedMosque.id } : m));
    } else { // Create
        const newMember = { ...memberData, id: `member-${Date.now()}`, mosqueId: selectedMosque.id };
        setMembers([...members, newMember]);
    }
    setIsMemberFormOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
     if (window.confirm("Are you sure you want to delete this member?")) {
        setMembers(members.filter(m => m.id !== memberId));
    }
  };
  
  // --- Render Logic ---
  if (!isAuthenticated) {
    return <LoginScreen onLogin={setIsAuthenticated} />;
  }

  if (!selectedMosque) {
    return (
        <>
            <MosqueSelectionScreen
                mosques={mosques}
                onSelectMosque={setSelectedMosque}
                onAddMosque={() => { setEditingMosque(null); setIsMosqueFormOpen(true); }}
                onEditMosque={(mosque) => { setEditingMosque(mosque); setIsMosqueFormOpen(true); }}
                onDeleteMosque={handleDeleteMosque}
            />
            <Modal isOpen={isMosqueFormOpen} onClose={() => setIsMosqueFormOpen(false)} title={editingMosque ? "Edit Mosque" : "Add New Mosque"}>
                <MosqueForm 
                    mosque={editingMosque}
                    onSave={handleSaveMosque}
                    onCancel={() => { setIsMosqueFormOpen(false); setEditingMosque(null); }}
                />
            </Modal>
        </>
    );
  }

  const pageContent = () => {
    switch (currentPage) {
      case 'Dashboard': return <DashboardPage members={filteredMembers} events={filteredEvents} />;
      case 'Members': return <MembersPage 
          members={filteredMembers} 
          onViewMember={setSelectedMember}
          onAddMember={() => { setEditingMember(null); setIsMemberFormOpen(true); }}
          onEditMember={(member) => { setEditingMember(member); setIsMemberFormOpen(true); }}
          onDeleteMember={handleDeleteMember}
      />;
      case 'Timings': return <PlaceholderPage title="Prayer Timings Management" />;
      case 'Announcements': return <PlaceholderPage title="Announcements Management" />;
      case 'Donations': return <PlaceholderPage title="Donations Management" />;
      case 'Events': return <PlaceholderPage title="Events Management" />;
      case 'Audit': return <PlaceholderPage title="Audit Log" />;
      default: return null;
    }
  };

  return (
    <>
      <Layout 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        theme={theme} 
        setTheme={setTheme}
        selectedMosque={selectedMosque}
        onLogout={handleLogout}
        onSwitchMosque={handleSwitchMosque}
      >
        {pageContent()}
      </Layout>
      <MemberDetailSheet member={selectedMember} onClose={() => setSelectedMember(null)} />
      <Modal isOpen={isMemberFormOpen} onClose={() => setIsMemberFormOpen(false)} title={editingMember ? "Edit Member" : "Add New Member"}>
          <MemberForm 
            member={editingMember} 
            onSave={handleSaveMember}
            onCancel={() => { setIsMemberFormOpen(false); setEditingMember(null); }}
          />
      </Modal>
    </>
  );
}

export default App;
