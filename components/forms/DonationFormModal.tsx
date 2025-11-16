import { useState, useEffect, FormEvent } from 'react';
import { Donation } from '../../types';
import { Modal, Button, Input, Label, Textarea, DatePicker } from '../ui';
import { InputChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';
import { toast } from 'sonner';

interface DonationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: Donation | null;
    onSave: () => void;
}

export const DonationFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: DonationFormModalProps) => {
    const [formData, setFormData] = useState<Omit<Donation, 'id' | 'mosqueId'>>({
        donorName: initialData?.donorName || '',
        amount: initialData?.amount || 0,
        purpose: initialData?.purpose || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                donorName: initialData.donorName,
                amount: initialData.amount,
                purpose: initialData.purpose,
                date: initialData.date,
            });
        } else {
            setFormData({
                donorName: '',
                amount: 0,
                purpose: '',
                date: new Date().toISOString().split('T')[0],
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (initialData) {
                await dbService.updateDoc('donations', { ...initialData, ...formData, mosqueId });
                toast.success('Donation updated successfully');
            } else {
                await dbService.addDoc(mosqueId, 'donations', formData);
                toast.success('Donation recorded successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            const errorMessage = 'Failed to save donation. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Donation' : 'Add Donation'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="donorName">Donor Name *</Label>
                    <Input id="donorName" value={formData.donorName} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input id="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} required />
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

                <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Input id="purpose" value={formData.purpose} onChange={handleChange} required />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                            ? 'Saving...' 
                            : initialData ? 'Save Changes' : 'Add Donation'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
