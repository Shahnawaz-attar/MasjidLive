import { useState, useEffect, MouseEvent } from 'react';
import { Mosque, Announcement } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { AnnouncementFormModal } from '../forms/AnnouncementFormModal';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

export const AnnouncementsPage = ({ mosque }: { mosque: Mosque }) => {
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
};
