import { useState, MouseEvent } from 'react';
import { Mosque, Announcement } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { AnnouncementFormModal } from '../forms/AnnouncementFormModal';
import { ConfirmationModal } from '../ConfirmationModal';
import dbService from '../../database/clientService';
import { useAnnouncements } from '../../hooks/useData';
import { TableSkeleton } from '../Skeleton';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

export const AnnouncementsPage = ({ mosque }: { mosque: Mosque }) => {
    const { announcements, isLoading, mutate } = useAnnouncements(mosque.id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        announcementId: string | null;
        announcementTitle: string;
    }>({
        isOpen: false,
        announcementId: null,
        announcementTitle: '',
    });

    const handleAddClick = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (announcement: Announcement) => {
        setDeleteConfirmation({
            isOpen: true,
            announcementId: announcement.id,
            announcementTitle: announcement.title,
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.announcementId) {
            await dbService.deleteDoc('announcements', deleteConfirmation.announcementId);
            mutate(); // Revalidate data
        }
        setDeleteConfirmation({
            isOpen: false,
            announcementId: null,
            announcementTitle: '',
        });
    };

    const cancelDelete = () => {
        setDeleteConfirmation({
            isOpen: false,
            announcementId: null,
            announcementTitle: '',
        });
    };

    const handleSave = () => {
        mutate(); // Revalidate data after save
        setIsModalOpen(false);
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
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item))}>
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
            {isLoading ? (
                <TableSkeleton rows={5} columns={4} />
            ) : (
                <DataTable columns={columns} data={announcements} />
            )}
            <AnnouncementFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mosqueId={mosque.id}
                initialData={editingAnnouncement}
                onSave={handleSave}
            />
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Announcement"
                description={`Are you sure you want to delete "${deleteConfirmation.announcementTitle}"? This action cannot be undone.`}
                confirmText="Delete Announcement"
                cancelText="Cancel"
            />
        </div>
    );
};
