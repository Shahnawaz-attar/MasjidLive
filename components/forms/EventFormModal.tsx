import { useState, useEffect, FormEvent } from 'react';
import { CommunityEvent } from '../../types';
import { Modal, Button, Input, Label } from '../ui';
import { InputChangeEvent, SelectChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: CommunityEvent | null;
    onSave: () => void;
}

export const EventFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: EventFormModalProps) => {
    const [formData, setFormData] = useState<Omit<CommunityEvent, 'id' | 'mosqueId'>>({
        title: initialData?.title || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        type: initialData?.type || 'Event',
        capacity: initialData?.capacity || undefined,
        booked: initialData?.booked || 0,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                date: initialData.date,
                type: initialData.type,
                capacity: initialData.capacity,
                booked: initialData.booked || 0,
            });
        } else {
            setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                type: 'Event',
                capacity: undefined,
                booked: 0,
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent) => {
        const { id, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [id]: id === 'capacity' || id === 'booked' ? (value ? parseInt(value) : undefined) : value 
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            if (initialData) {
                await dbService.updateDoc('events', { ...initialData, ...formData, mosqueId });
            } else {
                await dbService.addDoc(mosqueId, 'events', formData);
            }
            onSave();
            onClose();
        } catch (err: any) {
            setError('Failed to save event. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Event' : 'Add Event'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type *</Label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            required
                        >
                            <option value="Event">Event</option>
                            <option value="Iftari Slot">Iftari Slot</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity (optional)</Label>
                        <Input id="capacity" type="number" min="0" value={formData.capacity || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="booked">Booked</Label>
                        <Input id="booked" type="number" min="0" value={formData.booked || 0} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Add Event'}</Button>
                </div>
            </form>
        </Modal>
    );
};
