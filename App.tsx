import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog } from './types';
import { db } from './mockDb';
import { MOCK_MOSQUES } from './constants';
import { DataTable, Column } from './components/DataTable';
import { Card, CardContent, CardHeader, CardTitle, Button } from './components/ui';
import { PlusIcon } from './components/icons';

const MembersPage = ({ mosque }: { mosque: Mosque }) => {
    const [members, setMembers] = useState<Member[]>([]);
    useEffect(() => {
        db.getCollection<Member>(mosque.id, 'members').then(setMembers);
    }, [mosque]);
    const columns: Column<Member>[] = [
        { header: 'Name', accessor: item => <div className="flex items-center space-x-3"><img src={item.photo} className="h-10 w-10 rounded-full" alt={item.name}/><span>{item.name}</span></div> },
        { header: 'Role', accessor: item => item.role },
        { header: 'Contact', accessor: item => item.contact },
    ];
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Members</h1>
                <Button><PlusIcon className="h-4 w-4 mr-2"/>Add Member</Button>
            </div>
            <DataTable columns={columns} data={members} />
        </div>
    );
};

const PrayerTimesPage = ({ mosque }: { mosque: Mosque }) => {
    const [times, setTimes] = useState<PrayerTime[]>([]);
    useEffect(() => {
        db.getCollection<PrayerTime>(mosque.id, 'prayerTimes').then(setTimes);
    }, [mosque]);
    return (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Prayer Times</h1>
                <Button variant="outline">Edit Times</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {times.map(pt => (
                    <Card key={pt.name}>
                        <CardHeader>
                            <CardTitle>{pt.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pt.time}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
};

const AnnouncementsPage = ({ mosque }: { mosque: Mosque }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    useEffect(() => {
        db.getCollection<Announcement>(mosque.id, 'announcements').then(setAnnouncements);
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
        db.getCollection<Donation>(mosque.id, 'donations').then(setDonations);
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
        db.getCollection<CommunityEvent>(mosque.id, 'events').then(setEvents);
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
        db.getCollection<AuditLog>(mosque.id, 'auditLogs').then(setLogs);
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

function App() {
  const [selectedMosque, setSelectedMosque] = useState<Mosque>(MOCK_MOSQUES[0]);
  const [currentPage, setCurrentPage] = useState('members'); // Default page

  const renderPage = () => {
    if (!selectedMosque) return <div>Loading...</div>;

    switch (currentPage) {
        case 'members':
            return <MembersPage mosque={selectedMosque} />;
        case 'prayer-times':
            return <PrayerTimesPage mosque={selectedMosque} />;
        case 'announcements':
            return <AnnouncementsPage mosque={selectedMosque} />;
        case 'donations':
            return <DonationsPage mosque={selectedMosque} />;
        case 'events':
            return <EventsPage mosque={selectedMosque} />;
        case 'audit-log':
            return <AuditLogPage mosque={selectedMosque} />;
        default:
            return <MembersPage mosque={selectedMosque} />;
    }
  }

  return (
    <Layout
      selectedMosque={selectedMosque}
      onMosqueChange={setSelectedMosque}
      onNavigate={setCurrentPage}
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
