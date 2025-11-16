import { useState, useEffect, MouseEvent } from 'react';
import { Mosque, CommunityEvent } from '../../types';
import { Button, Skeleton, TableSkeleton } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { EventFormModal } from '../forms/EventFormModal';
import { useEvents } from '../../hooks/useData';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

// Helper to check if event is expired
const isEventExpired = (eventDate: string): boolean => {
    const eventDateTime = new Date(eventDate).getTime();
    const now = Date.now();
    return eventDateTime < now;
};

// Helper to check if event should still show (within 1 week of expiry)
const shouldShowExpiredEvent = (eventDate: string): boolean => {
    const eventDateTime = new Date(eventDate).getTime();
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    return (now - eventDateTime) <= oneWeekInMs;
};

export const EventsPage = ({ mosque }: { mosque: Mosque }) => {
    const { events, isLoading, isError, mutate } = useEvents(mosque.id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);

    // Filter events: show active events + expired events within 1 week
    const visibleEvents = events?.filter(event => 
        !isEventExpired(event.date) || shouldShowExpiredEvent(event.date)
    ) || [];

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
            mutate();
        }
    };

    const columns: Column<CommunityEvent>[] = [
        { 
            header: 'Title', 
            accessor: item => (
                <div className="flex items-center gap-2">
                    <span>{item.title}</span>
                    {isEventExpired(item.date) && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            Expired
                        </span>
                    )}
                </div>
            )
        },
        { 
            header: 'Date', 
            accessor: item => {
                const date = new Date(item.date);
                const isExpired = isEventExpired(item.date);
                return (
                    <span className={isExpired ? 'text-gray-400 line-through' : ''}>
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                );
            }
        },
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
            
            {isLoading ? (
                <TableSkeleton rows={5} columns={5} />
            ) : isError ? (
                <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
                    Error loading events. Please try again.
                </div>
            ) : (
                <DataTable columns={columns} data={visibleEvents} />
            )}
            
            <EventFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mosqueId={mosque.id}
                initialData={editingEvent}
                onSave={() => mutate()}
            />
        </div>
    );
};
