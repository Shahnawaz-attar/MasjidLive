import { useState, useEffect, FormEvent } from 'react';
import { Announcement } from '../../types';
import { Modal, Button, Input, Label, Textarea, DatePicker } from '../ui';
import { InputChangeEvent, SelectChangeEvent, TextareaChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';
import { toast } from 'sonner';

interface AnnouncementFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: Announcement | null;
    onSave: () => void;
}

export const AnnouncementFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: AnnouncementFormModalProps) => {
    const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'mosqueId'>>({
        title: initialData?.title || '',
        body: initialData?.body || '',
        audience: initialData?.audience || 'All',
        date: initialData?.date || new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                body: initialData.body,
                audience: initialData.audience,
                date: initialData.date,
            });
        } else {
            setFormData({
                title: '',
                body: '',
                audience: 'All',
                date: new Date().toISOString().split('T')[0],
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent | { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (initialData) {
                await dbService.updateDoc('announcements', { ...initialData, ...formData, mosqueId });
                toast.success('Announcement updated successfully');
            } else {
                await dbService.addDoc(mosqueId, 'announcements', formData);
                toast.success('Announcement created successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            const errorMessage = 'Failed to save announcement. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Announcement' : 'New Announcement'}>
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
                    <Label htmlFor="body">Body *</Label>
                    <Textarea id="body" value={formData.body} onChange={handleChange} rows={4} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="audience">Audience *</Label>
                        <select
                            id="audience"
                            value={formData.audience}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            required
                        >
                            <option value="All">All</option>
                            <option value="Members only">Members only</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <DatePicker 
                            id="date" 
                            value={formData.date} 
                            onChange={handleChange} 
                            placeholder="Select date"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                            ? 'Saving...' 
                            : initialData ? 'Save Changes' : 'Create Announcement'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
