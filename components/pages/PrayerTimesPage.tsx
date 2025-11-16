import { useState, MouseEvent } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { PrayerTimeFormModal } from '../forms/PrayerTimeFormModal';
import { usePrayerTimes } from '../../hooks/useData';
import { TableSkeleton } from '../Skeleton';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

export const PrayerTimesPage = ({ mosque }: { mosque: Mosque }) => {
    const { prayerTimes, isLoading, mutate } = usePrayerTimes(mosque.id);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPrayerTime, setEditingPrayerTime] = useState<PrayerTime | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    const handleEditClick = (prayerTime: PrayerTime) => {
        setEditingPrayerTime(prayerTime);
        setIsEditModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingPrayerTime(null);
        setIsEditModalOpen(true);
    };
    
    const handleSave = () => {
        mutate();
        setIsEditModalOpen(false);
    };

    // Initialize default prayer times
    const handleInitializeDefaults = async () => {
        setIsInitializing(true);
        const defaultPrayerTimes: Omit<PrayerTime, 'id' | 'mosqueId'>[] = [
            { name: 'Fajr', time: '05:30 AM' },
            { name: 'Dhuhr', time: '01:30 PM' },
            { name: 'Asr', time: '04:45 PM' },
            { name: 'Maghrib', time: '07:15 PM' },
            { name: 'Isha', time: '08:45 PM' }
        ];

        try {
            for (const prayer of defaultPrayerTimes) {
                await dbService.addDoc(mosque.id, 'prayerTimes', prayer);
            }
            mutate();
        } catch (error) {
            console.error('Error initializing prayer times:', error);
            alert('Failed to initialize prayer times');
        } finally {
            setIsInitializing(false);
        }
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
                    {prayerTimes.length === 0 && !isLoading && (
                        <Button onClick={handleInitializeDefaults} disabled={isInitializing} variant="outline">
                            {isInitializing ? 'Initializing...' : 'Add All 5 Prayers'}
                        </Button>
                    )}
                    <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Prayer Time</Button>
                </div>
            </div>
            {prayerTimes.length === 0 && !isLoading && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Quick Start:</strong> Click "Add All 5 Prayers" to quickly add default prayer times, or add them one by one.
                    </p>
                </div>
            )}
            {isLoading ? (
                <TableSkeleton rows={5} columns={3} />
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
        </div>
    );
};
