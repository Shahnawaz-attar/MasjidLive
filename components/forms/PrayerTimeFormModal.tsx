import { useState, useEffect, FormEvent } from 'react';
import { PrayerTime } from '../../types';
import { Modal, Button, Input, Label } from '../ui';
import { InputChangeEvent } from '../utils/formHelpers';
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
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        fajr: '05:30',
        dhuhr: '13:30',
        asr: '16:45',
        maghrib: '19:00',
        isha: '20:30',
        jumma: '13:00',
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: initialData.date,
                fajr: initialData.fajr,
                dhuhr: initialData.dhuhr,
                asr: initialData.asr,
                maghrib: initialData.maghrib,
                isha: initialData.isha,
                jumma: initialData.jumma || '12:30',
                isActive: initialData.isActive !== false
            });
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                fajr: '05:00',      // 5:00 AM - Fajr typically around 5-5:30 AM in India
                dhuhr: '12:30',     // 12:30 PM - Dhuhr around 12:30-1:00 PM
                asr: '16:00',       // 4:00 PM - Asr around 4:00-4:30 PM  
                maghrib: '18:30',   // 6:30 PM - Maghrib around 6:00-7:00 PM (varies by season)
                isha: '20:00',      // 8:00 PM - Isha around 7:30-8:30 PM
                jumma: '12:30',     // 12:30 PM - Jumma prayer time
                isActive: true
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent) => {
        const { id, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ 
            ...prev, 
            [id]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const dataToSave = {
                mosqueId,
                date: formData.date,
                fajr: formData.fajr,
                dhuhr: formData.dhuhr,
                asr: formData.asr,
                maghrib: formData.maghrib,
                isha: formData.isha,
                jumma: formData.jumma,
                isActive: formData.isActive
            };

            if (initialData) {
                await dbService.updateDoc('prayerTimes', { id: initialData.id, ...dataToSave });
                toast.success('Prayer times updated successfully');
            } else {
                await dbService.addDoc(mosqueId, 'prayerTimes', dataToSave);
                toast.success('Prayer times added successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            console.error('Error saving prayer times:', err);
            
            if (err.message?.includes('duplicate key value violates unique constraint') || 
                err.message?.includes('prayer_times_mosque_id_date_key')) {
                toast.error(`Prayer times for ${formData.date} already exist for this mosque`);
            } else {
                toast.error(`Failed to save prayer times: ${err.message || 'Please try again'}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Prayer Times' : 'Add Prayer Times'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                        id="date" 
                        type="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Prayer Times</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fajr">Fajr *</Label>
                            <Input 
                                id="fajr" 
                                type="time" 
                                value={formData.fajr} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dhuhr">Dhuhr *</Label>
                            <Input 
                                id="dhuhr" 
                                type="time" 
                                value={formData.dhuhr} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="asr">Asr *</Label>
                            <Input 
                                id="asr" 
                                type="time" 
                                value={formData.asr} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maghrib">Maghrib *</Label>
                            <Input 
                                id="maghrib" 
                                type="time" 
                                value={formData.maghrib} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="isha">Isha *</Label>
                            <Input 
                                id="isha" 
                                type="time" 
                                value={formData.isha} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jumma">Jumma (Optional)</Label>
                            <Input 
                                id="jumma" 
                                type="time" 
                                value={formData.jumma} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        id="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                            ? 'Saving...' 
                            : initialData ? 'Save Changes' : 'Add Prayer Times'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
