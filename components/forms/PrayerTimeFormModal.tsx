import { useState, useEffect, FormEvent } from 'react';
import { PrayerTime } from '../../types';
import { Modal, Button, Input, Label } from '../ui';
import { handleFormChange, InputChangeEvent, SelectChangeEvent, TextareaChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';

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
        time: initialData?.time || '00:00 AM',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({ name: initialData.name, time: initialData.time });
        } else {
            setFormData({ name: 'Fajr', time: '00:00 AM' });
        }
    }, [initialData]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (initialData) {
            await dbService.updateDoc('prayerTimes', { ...initialData, ...formData });
        } else {
            await dbService.addDoc(mosqueId, 'prayerTimes', formData);
        }
        onSave();
        onClose();
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
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : 'Add Prayer Time'}</Button>
                </div>
            </form>
        </Modal>
    );
};
