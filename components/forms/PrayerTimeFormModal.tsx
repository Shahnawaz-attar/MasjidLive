import { useState, useEffect, FormEvent } from 'react';
import { PrayerTime } from '../../types';
import { Modal, Button, Input, Label } from '../ui';
import { handleFormChange, InputChangeEvent, SelectChangeEvent, TextareaChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';
import { toast } from 'sonner';

interface PrayerTimeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: PrayerTime | null;
    onSave: () => void;
}

export const PrayerTimeFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: PrayerTimeFormModalProps) => {
    const [formData, setFormData] = useState<Omit<PrayerTime, 'id'>>({
        name: initialData?.name || 'Fajr',
        time: initialData?.time || '05:00',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Convert 12-hour format (01:30 PM) to 24-hour format (13:30) for HTML5 time input
    const convertTo24Hour = (time12h: string): string => {
        if (!time12h) return '00:00';
        
        // If already in 24-hour format (no AM/PM), return as is
        if (!time12h.includes('AM') && !time12h.includes('PM')) {
            return time12h;
        }
        
        const [time, modifier] = time12h.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours, 10);
        
        if (modifier === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (modifier === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    };

    // Convert 24-hour format (13:30) to 12-hour format (01:30 PM) for database storage
    const convertTo12Hour = (time24h: string): string => {
        if (!time24h) return '12:00 AM';
        
        const [hours, minutes] = time24h.split(':');
        const hour24 = parseInt(hours, 10);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const modifier = hour24 < 12 ? 'AM' : 'PM';
        
        return `${hour12.toString().padStart(2, '0')}:${minutes} ${modifier}`;
    };

    useEffect(() => {
        if (initialData) {
            setFormData({ 
                name: initialData.name, 
                time: convertTo24Hour(initialData.time) 
            });
        } else {
            setFormData({ name: 'Fajr', time: '05:00' });
        }
    }, [initialData]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Convert time back to 12-hour format for database storage
            const dataToSave = {
                ...formData,
                time: convertTo12Hour(formData.time)
            };

            if (initialData) {
                await dbService.updateDoc('prayerTimes', { ...initialData, ...dataToSave });
                toast.success('Prayer time updated successfully');
            } else {
                await dbService.addDoc(mosqueId, 'prayerTimes', dataToSave);
                toast.success('Prayer time added successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            console.error('Error saving prayer time:', err);
            
            // Handle specific errors with user-friendly messages
            if (err.message?.includes('duplicate key value violates unique constraint')) {
                toast.error(`${formData.name} prayer time already exists for this mosque`);
            } else if (err.message?.includes('prayer_times_mosque_id_name_key')) {
                toast.error(`${formData.name} prayer time already exists for this mosque`);
            } else {
                toast.error('Failed to save prayer time. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const prayerNames: PrayerTime['name'][] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Prayer Time' : 'Add Prayer Time'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Prayer Name</Label>
                    <select id="name" value={formData.name} onChange={handleChange} className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        {prayerNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={formData.time} onChange={handleChange} required />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                            ? 'Saving...' 
                            : initialData ? 'Save Changes' : 'Add Prayer Time'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
