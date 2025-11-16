import { useState, useEffect, MouseEvent } from 'react';
import { Mosque, CommunityEvent } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { EventFormModal } from '../forms/EventFormModal';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

export const EventsPage = ({ mosque }: { mosque: Mosque }) => {
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
