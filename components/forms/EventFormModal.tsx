import { useState, useEffect, FormEvent } from 'react';
import { CommunityEvent } from '../../types';
import { Modal, Button, Input, Label, Textarea, DatePicker } from '../ui';
import { InputChangeEvent, SelectChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';
import { toast } from 'sonner';

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
        description: initialData?.description || '',
        startDate: initialData?.startDate || initialData?.date || new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate || initialData?.date || new Date().toISOString().split('T')[0],
        date: initialData?.date || new Date().toISOString().split('T')[0],
        type: initialData?.type || 'Event',
        capacity: initialData?.capacity || undefined,
        booked: initialData?.booked || 0,
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                title: initialData.title,
                description: initialData.description || '',
                startDate: initialData.startDate || initialData.date || today,
                endDate: initialData.endDate || initialData.date || today,
                date: initialData.date || today,
                type: initialData.type,
                capacity: initialData.capacity,
                booked: initialData.booked || 0,
            });
        } else {
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                title: '',
                description: '',
                startDate: today,
                endDate: today,
                date: today,
                type: 'Event',
                capacity: undefined,
                booked: 0,
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        setFormData(prev => {
            const updated = { 
                ...prev, 
                [id]: id === 'capacity' || id === 'booked' ? (value ? parseInt(value) : undefined) : value 
            };
            // Keep date in sync with startDate for backward compatibility
            if (id === 'startDate') {
                updated.date = value;
                // Auto-set endDate to startDate if endDate is before startDate
                if (updated.endDate && updated.endDate < value) {
                    updated.endDate = value;
                }
            }
            return updated;
        });
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (isSubmitting) return; // Prevent double submission

        // Validate end date is after or equal to start date
        if (formData.endDate && formData.endDate < formData.startDate) {
            setError('End date must be on or after start date');
            return;
        }

        setIsSubmitting(true);

        // Clean the data - remove any fields that shouldn't be sent
        // and ensure all dates are proper strings
        const cleanData: any = {
            title: formData.title,
            description: formData.description || '',
            startDate: formData.startDate,
            endDate: formData.endDate,
            date: formData.date,
            type: formData.type,
            booked: formData.booked || 0,
        };

        // Only include capacity if it's a valid number
        if (formData.capacity !== undefined && formData.capacity !== null && formData.capacity > 0) {
            cleanData.capacity = formData.capacity;
        }

        console.log('Submitting clean data:', cleanData);

        try {
            if (initialData) {
                // For updates, merge with existing data
                const updatePayload = { id: initialData.id, mosqueId, ...cleanData };
                await dbService.updateDoc('events', updatePayload);
                toast.success('Event updated successfully');
            } else {
                // For new events, just send the clean data
                await dbService.addDoc(mosqueId, 'events', cleanData);
                toast.success('Event created successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            console.error('Error saving event:', err);
            const errorMessage = err?.message || 'Failed to save event. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
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

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={handleTextareaChange}
                        rows={3}
                        placeholder="Enter event description..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <DatePicker 
                            id="startDate" 
                            value={formData.startDate} 
                            onChange={handleChange} 
                            placeholder="Select start date"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <DatePicker 
                            id="endDate" 
                            value={formData.endDate || ''} 
                            onChange={handleChange} 
                            min={formData.startDate}
                            placeholder="Select end date"
                        />
                    </div>
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
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                            ? 'Saving...' 
                            : initialData ? 'Save Changes' : 'Add Event'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
