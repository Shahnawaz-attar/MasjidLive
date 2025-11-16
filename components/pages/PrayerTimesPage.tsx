import { useState, useEffect, MouseEvent } from 'react';
import { Mosque, PrayerTime } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { PrayerTimeFormModal } from '../forms/PrayerTimeFormModal';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

export const PrayerTimesPage = ({ mosque }: { mosque: Mosque }) => {
    const [times, setTimes] = useState<PrayerTime[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPrayerTime, setEditingPrayerTime] = useState<PrayerTime | null>(null);

    const fetchPrayerTimes = () => {
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
    );
};
