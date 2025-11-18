import { useState, MouseEvent } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { PrayerTimeFormModal } from '../forms/PrayerTimeFormModal';
import { ConfirmationModal } from '../ConfirmationModal';
import { usePrayerTimes } from '../../hooks/useData';
import { TableSkeleton } from '../Skeleton';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

export const PrayerTimesPage = ({ mosque }: { mosque: Mosque }) => {
    const { prayerTimes, isLoading, mutate } = usePrayerTimes(mosque.id);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPrayerTime, setEditingPrayerTime] = useState<PrayerTime | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        prayerTimeId: string | null;
        date: string;
    }>({
        isOpen: false,
        prayerTimeId: null,
        date: '',
    });

    const handleEditClick = (prayerTime: PrayerTime) => {
        setEditingPrayerTime(prayerTime);
        setIsEditModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingPrayerTime(null);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (prayerTime: PrayerTime) => {
        setDeleteConfirmation({
            isOpen: true,
            prayerTimeId: prayerTime.id,
            date: prayerTime.date,
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.prayerTimeId) {
            await dbService.deleteDoc('prayerTimes', deleteConfirmation.prayerTimeId);
            mutate();
        }
        setDeleteConfirmation({
            isOpen: false,
            prayerTimeId: null,
            date: '',
        });
    };

    const cancelDelete = () => {
        setDeleteConfirmation({
            isOpen: false,
            prayerTimeId: null,
            date: '',
        });
    };
    
    const handleSave = () => {
        mutate();
        setIsEditModalOpen(false);
    };

    // Initialize default prayer times for today
    const handleInitializeDefaults = async () => {
        setIsInitializing(true);
        const today = new Date().toISOString().split('T')[0];
        const defaultPrayerTimes = {
            date: today,
            fajr: '05:00',      // 5:00 AM - Fajr typically around 5-5:30 AM in India
            dhuhr: '12:30',     // 12:30 PM - Dhuhr around 12:30-1:00 PM
            asr: '16:00',       // 4:00 PM - Asr around 4:00-4:30 PM  
            maghrib: '18:30',   // 6:30 PM - Maghrib around 6:00-7:00 PM (varies by season)
            isha: '20:00',      // 8:00 PM - Isha around 7:30-8:30 PM
            jumma: '12:30',     // 12:30 PM - Jumma prayer time
            isActive: true
        };

        try {
            await dbService.addDoc(mosque.id, 'prayerTimes', defaultPrayerTimes);
            mutate();
        } catch (error) {
            console.error('Error initializing prayer times:', error);
            alert('Failed to initialize prayer times');
        } finally {
            setIsInitializing(false);
        }
    };

    // Helper function to format time for display
    const formatTime = (time: string) => {
        if (!time) return '';
        // If time is already in 12-hour format, return as is
        if (time.includes('AM') || time.includes('PM')) return time;
        
        // Convert 24-hour to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours, 10);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const modifier = hour24 < 12 ? 'AM' : 'PM';
        return `${hour12.toString().padStart(2, '0')}:${minutes} ${modifier}`;
    };

    const columns: Column<PrayerTime>[] = [
        { header: 'Date', accessor: item => new Date(item.date).toLocaleDateString(), cellClassName: 'font-medium' },
        { header: 'Fajr', accessor: item => formatTime(item.fajr), cellClassName: 'text-sm' },
        { header: 'Dhuhr', accessor: item => formatTime(item.dhuhr), cellClassName: 'text-sm' },
        { header: 'Asr', accessor: item => formatTime(item.asr), cellClassName: 'text-sm' },
        { header: 'Maghrib', accessor: item => formatTime(item.maghrib), cellClassName: 'text-sm' },
        { header: 'Isha', accessor: item => formatTime(item.isha), cellClassName: 'text-sm' },
        { header: 'Status', accessor: item => item.isActive !== false ? '✅ Active' : '❌ Inactive' },
        {
            header: 'Actions',
            accessor: item => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => { e.stopPropagation(); handleEditClick(item); }}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => { e.stopPropagation(); handleDeleteClick(item); }}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        }
    ];

    return (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Prayer Times</h1>
                <div className="flex gap-2">
                    {prayerTimes.length === 0 && !isLoading && (
                        <Button onClick={handleInitializeDefaults} disabled={isInitializing} variant="outline">
                            {isInitializing ? 'Initializing...' : 'Add Today\'s Prayer Times'}
                        </Button>
                    )}
                    <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Prayer Times</Button>
                </div>
            </div>
            {prayerTimes.length === 0 && !isLoading && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Quick Start:</strong> Click "Add Today's Prayer Times" to add prayer times for today with default values, or manually add prayer times for specific dates.
                    </p>
                </div>
            )}
            {isLoading ? (
                <TableSkeleton rows={5} columns={8} />
            ) : (
                <DataTable columns={columns} data={prayerTimes} />
            )}
            <PrayerTimeFormModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                mosqueId={mosque.id} 
                initialData={editingPrayerTime} 
                onSave={handleSave} 
            />
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Prayer Times"
                description={`Are you sure you want to delete prayer times for ${deleteConfirmation.date}? This action cannot be undone.`}
                confirmText="Delete Prayer Times"
                cancelText="Cancel"
            />
        </div>
    );
};
