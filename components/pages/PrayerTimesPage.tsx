import { useState, MouseEvent } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { PrayerTimeFormModal } from '../forms/PrayerTimeFormModal';
import { usePrayerTimes } from '../../hooks/useData';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

export const PrayerTimesPage = ({ mosque }: { mosque: Mosque }) => {
    const { prayerTimes, isLoading, mutate } = usePrayerTimes(mosque.id);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPrayerTime, setEditingPrayerTime] = useState<PrayerTime | null>(null);

    const handleEditClick = (prayerTime: PrayerTime) => {
        setEditingPrayerTime(prayerTime);
        setIsEditModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingPrayerTime(null);
        setIsEditModalOpen(true);
    };
    
    const handleSave = () => {
        mutate(); // Revalidate data after save
        setIsEditModalOpen(false);
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
                <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Prayer Time</Button>
            </div>
            {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading prayer times...</div>
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
