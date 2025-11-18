import { useState, useEffect, FormEvent } from 'react';
import { Donation } from '../../types';
import { Modal, Button, Input, Label, DatePicker } from '../ui';
import { InputChangeEvent, SelectChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';
import { toast } from 'sonner';

interface DonationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: Donation | null;
    onSave: () => void;
}

// Map display names to backend enum values
const CATEGORY_OPTIONS = [
    { label: 'General Fund', value: 'general' },
    { label: 'Zakat', value: 'zakat' },
    { label: 'Sadaqah', value: 'sadaqah' },
    { label: 'Building Maintenance', value: 'building' },
    { label: 'Education', value: 'education' },
    { label: 'Emergency Relief', value: 'emergency' }
];

export const DonationFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: DonationFormModalProps) => {
    const [formData, setFormData] = useState({
        donorName: initialData?.donorName || '',
        amount: initialData?.amount || 0,
        category: initialData?.purpose || 'general', // Map purpose to category
        donationDate: initialData?.date || new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                donorName: initialData.donorName,
                amount: initialData.amount,
                category: initialData.purpose || 'general', // Map purpose to category
                donationDate: initialData.date || new Date().toISOString().split('T')[0],
            });
        } else {
            setFormData({
                donorName: '',
                amount: 0,
                category: 'general',
                donationDate: new Date().toISOString().split('T')[0],
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | { target: { id: string; value: string } }) => {
        const { id, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [id]: id === 'amount' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Prepare data for backend with correct field names
            const backendData = {
                mosqueId,
                donorName: formData.donorName,
                amount: formData.amount,
                category: formData.category,
                donationDate: formData.donationDate,
            };

            if (initialData) {
                await dbService.updateDoc('donations', { id: initialData.id, ...backendData });
                toast.success('Donation updated successfully');
            } else {
                await dbService.addDoc(mosqueId, 'donations', backendData);
                toast.success('Donation recorded successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            console.error('Error saving donation:', err);
            const errorMessage = err?.message || 'Failed to save donation. Please try again.';
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
                    <Input 
                        id="donorName" 
                        value={formData.donorName} 
                        onChange={handleChange} 
                        placeholder="Enter donor name"
                        required 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            step="0.01" 
                            min="0.01" 
                            value={formData.amount} 
                            onChange={handleChange} 
                            placeholder="0.00"
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="donationDate">Date *</Label>
                        <DatePicker 
                            id="donationDate" 
                            value={formData.donationDate} 
                            onChange={handleChange} 
                            placeholder="Select date"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        required
                    >
                        {CATEGORY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
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
