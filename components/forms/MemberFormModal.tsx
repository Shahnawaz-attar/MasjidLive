import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Member, MemberRole, MemberEducation } from '../../types';
import { Modal, Button, Input, Label, Textarea } from '../ui';
import { handleFormChange, InputChangeEvent, SelectChangeEvent, TextareaChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';
import { generateAvatarUrl, isValidImageFile, fileToBase64 } from '../../lib/avatar';
import { toast } from 'sonner';

interface MemberFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mosqueId: string;
    initialData?: Member | null;
    onSave: () => void;
}

export const MemberFormModal = ({ isOpen, onClose, mosqueId, initialData, onSave }: MemberFormModalProps) => {
    const [formData, setFormData] = useState<Omit<Member, 'id' | 'mosqueId'>>({
        name: initialData?.name || '',
        role: initialData?.role || 'Volunteer',
        contact: initialData?.contact || '',
        background: initialData?.background || '',
        photo: initialData?.photo || '',
        education: initialData?.education || 'None'
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(initialData?.photo || '');
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                role: initialData.role,
                contact: initialData.contact,
                background: initialData.background,
                photo: initialData.photo,
                education: initialData.education || 'None'
            });
            setImagePreview(initialData.photo);
        } else {
            setFormData({ name: '', role: 'Volunteer', contact: '', background: '', photo: '', education: 'None' });
            setImagePreview('');
        }
        setImageFile(null);
        setError('');
    }, [initialData, isOpen]);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = isValidImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setImageFile(file);
        setError('');

        const base64 = await fileToBase64(file);
        setImagePreview(base64);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (isSubmitting) return; // Prevent double submission
        setIsSubmitting(true);

        try {
            let photoUrl = formData.photo;

            if (imageFile) {
                photoUrl = await fileToBase64(imageFile);
            } else if (!formData.photo) {
                photoUrl = generateAvatarUrl(formData.name);
            }

            // Remove education field before saving since it doesn't exist in the database
            const { education, ...dataToSave } = formData;

            if (initialData) {
                await dbService.updateDoc('members', { ...initialData, ...dataToSave, photo: photoUrl, mosqueId });
                toast.success('Member updated successfully');
            } else {
                await dbService.addDoc(mosqueId, 'members', { ...dataToSave, photo: photoUrl });
                toast.success('Member added successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            const errorMessage = 'Failed to save member. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const roles: MemberRole[] = ['Imam', 'Muazzin', 'Committee', 'Volunteer'];
    const shouldShowEducation = formData.role === 'Imam' || formData.role === 'Muazzin';
    const educationOptions: MemberEducation[] = ['None', 'Mufti', 'Hafiz', 'Talimuddin'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Member' : 'Add New Member'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <img
                            src={imagePreview || generateAvatarUrl(formData.name || 'Member')}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                        />
                        <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <span className="text-lg">📷</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Shahnawaz"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>

                    {shouldShowEducation && (
                        <div className="space-y-2">
                            <Label htmlFor="education">Education</Label>
                            <select
                                id="education"
                                value={formData.education || 'None'}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                {educationOptions.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact">Contact *</Label>
                    <Input
                        id="contact"
                        placeholder="e.g., +92-300-1234567"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="background">Background Information</Label>
                    <Textarea
                        id="background"
                        placeholder="e.g., Experience, qualifications, brief bio..."
                        value={formData.background}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                            ? 'Saving...' 
                            : initialData ? 'Save Changes' : 'Add Member'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
