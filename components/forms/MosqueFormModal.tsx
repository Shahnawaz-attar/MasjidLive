import { useState, useEffect, FormEvent } from 'react';
import { Mosque } from '../../types';
import { Modal, Button, Input, Label, Textarea } from '../ui';
import { handleFormChange, InputChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';

interface MosqueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mosque: Mosque) => void;
    initialData?: Mosque | null;
}

export const MosqueFormModal = ({ isOpen, onClose, onSave, initialData }: MosqueFormModalProps) => {
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ name: initialData.name, address: initialData.address });
            } else {
                setFormData({ name: '', address: '' });
            }
            setError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: InputChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.address.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            if (initialData) {
                const updatedMosque = await dbService.updateMosque(initialData.id, formData);
                onSave(updatedMosque);
            } else {
                const newMosque = await dbService.createMosque(formData);
                onSave(newMosque);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || `Failed to ${initialData ? 'update' : 'create'} mosque. Please try again.`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Mosque' : 'Add New Mosque'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Mosque Name *</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Al-Rahma Masjid"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                        id="address"
                        placeholder="e.g., 123 Islamic Way, Muslim Town"
                        value={formData.address}
                        onChange={(e) => handleFormChange(setFormData, e)}
                        rows={3}
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Save Changes' : 'Create Mosque'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
