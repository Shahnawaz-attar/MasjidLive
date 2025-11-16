import { useState, useEffect, FormEvent } from 'react';
import { Mosque } from '../../types';
import { Modal, Button, Input, Label, Textarea } from '../ui';
import { handleFormChange, InputChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';
import { toast } from 'sonner';

interface MosqueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mosque: Mosque) => void;
    initialData?: Mosque | null;
}

export const MosqueFormModal = ({ isOpen, onClose, onSave, initialData }: MosqueFormModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        capacity: '',
        imamName: '',
        imamPhone: '',
        facilities: '',
        established: '',
        logoUrl: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    address: initialData.address,
                    description: initialData.description || '',
                    phone: initialData.phone || '',
                    email: initialData.email || '',
                    website: initialData.website || '',
                    capacity: initialData.capacity?.toString() || '',
                    imamName: initialData.imamName || '',
                    imamPhone: initialData.imamPhone || '',
                    facilities: initialData.facilities || '',
                    established: initialData.established || '',
                    logoUrl: initialData.logoUrl || ''
                });
                setImagePreview(initialData.logoUrl || null);
            } else {
                setFormData({
                    name: '',
                    address: '',
                    description: '',
                    phone: '',
                    email: '',
                    website: '',
                    capacity: '',
                    imamName: '',
                    imamPhone: '',
                    facilities: '',
                    established: '',
                    logoUrl: ''
                });
                setImagePreview(null);
            }
            setError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: InputChangeEvent) => {
        handleFormChange(setFormData, e);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setImagePreview(dataUrl);
                setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, logoUrl: '' }));
        // Reset file input
        const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (isSubmitting) return;

        if (!formData.name.trim() || !formData.address.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        // Validate email format if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Validate website URL if provided
        if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
            setError('Please enter a valid website URL (include http:// or https://).');
            return;
        }

        setIsSubmitting(true);

        try {
            const mosqueData = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                description: formData.description.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                email: formData.email.trim() || undefined,
                website: formData.website.trim() || undefined,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
                imamName: formData.imamName.trim() || undefined,
                imamPhone: formData.imamPhone.trim() || undefined,
                facilities: formData.facilities.trim() || undefined,
                established: formData.established.trim() || undefined,
                logoUrl: formData.logoUrl || 'https://e7.pngegg.com/pngimages/724/24/png-clipart-al-masjid-an-nabawi-green-dome-mosque-islamic-green-and-brown-mosque-cdr-building-thumbnail.png'
            };

            if (initialData) {
                const updatedMosque = await dbService.updateMosque(initialData.id, mosqueData);
                toast.success('Mosque updated successfully');
                onSave(updatedMosque);
            } else {
                const newMosque = await dbService.createMosque(mosqueData);
                toast.success('Mosque created successfully');
                onSave(newMosque);
            }
            onClose();
        } catch (err: any) {
            const errorMessage = err.message || `Failed to ${initialData ? 'update' : 'create'} mosque. Please try again.`;
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Mosque' : 'Add New Mosque'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Basic Information</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">Mosque Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Al-Rahma Masjid"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                            id="address"
                            placeholder="e.g., 123 Islamic Way, Muslim Town, State 12345"
                            value={formData.address}
                            onChange={(e) => handleFormChange(setFormData, e)}
                            rows={2}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of the mosque and its mission..."
                            value={formData.description}
                            onChange={(e) => handleFormChange(setFormData, e)}
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="(555) 123-4567"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="info@mosque.org"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="https://www.mosque.org"
                            value={formData.website}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Additional Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity (Number of people)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                placeholder="500"
                                min="1"
                                value={formData.capacity}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="established">Established Year</Label>
                            <Input
                                id="established"
                                type="text"
                                placeholder="1985"
                                value={formData.established}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="imamName">Imam Name</Label>
                            <Input
                                id="imamName"
                                placeholder="Sheikh Muhammad Ahmad"
                                value={formData.imamName}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imamPhone">Imam Contact</Label>
                            <Input
                                id="imamPhone"
                                type="tel"
                                placeholder="(555) 987-6543"
                                value={formData.imamPhone}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="facilities">Facilities & Amenities</Label>
                        <Textarea
                            id="facilities"
                            placeholder="e.g., Prayer hall, Wudu area, Parking, Library, Islamic school, Community hall..."
                            value={formData.facilities}
                            onChange={(e) => handleFormChange(setFormData, e)}
                            rows={2}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Mosque Image */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">Mosque Image</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="logoUpload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> mosque image</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                                </div>
                                <input 
                                    id="logoUpload" 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isSubmitting}
                                />
                            </label>
                        </div>

                        {imagePreview && (
                            <div className="relative inline-block">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="h-24 w-24 object-cover rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting 
                            ? 'Saving...' 
                            : initialData ? 'Save Changes' : 'Create Mosque'
                        }
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
