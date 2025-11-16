import { useState, FormEvent } from 'react';
import { UserWithoutPassword, Mosque } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label } from '../ui';
import { MosqueIcon } from '../icons';
import { InputChangeEvent, SelectChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';

interface RegistrationScreenProps {
    mosques: Mosque[];
    onRegistrationSuccess: (user: UserWithoutPassword) => void;
    onBackToLogin: () => void;
}

export const RegistrationScreen = ({ mosques, onRegistrationSuccess, onBackToLogin }: RegistrationScreenProps) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Muazzin' as 'Imam' | 'Muazzin',
        mosque_id: mosques.length > 0 ? mosques[0].id : '',
        address: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: InputChangeEvent | SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }

        if (!formData.mosque_id) {
            setError('Please select a mosque');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await dbService.register({
                name: formData.name,
                username: formData.username,
                password: formData.password,
                email: formData.email || undefined,
                role: formData.role,
                mosque_id: formData.mosque_id,
                address: formData.address || undefined
            });

            if (result.success && result.user) {
                onRegistrationSuccess(result.user);
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-dark-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <MosqueIcon className="h-12 w-12 text-primary mx-auto"/>
                    <h1 className="text-3xl font-bold mt-2">City Masjid</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Register as Imam or Muazzin</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Account</CardTitle>
                        <CardDescription>Register to manage your mosque</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input 
                                    id="name" 
                                    name="name"
                                    type="text" 
                                    placeholder="John Doe" 
                                    required 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input 
                                    id="username" 
                                    name="username"
                                    type="text" 
                                    placeholder="johndoe" 
                                    required 
                                    value={formData.username} 
                                    onChange={handleChange}
                                    minLength={3}
                                />
                                <p className="text-xs text-gray-500">Must be unique, minimum 3 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input 
                                    id="email" 
                                    name="email"
                                    type="email" 
                                    placeholder="john@example.com" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="Muazzin">Muazzin</option>
                                    <option value="Imam">Imam</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mosque_id">Mosque *</Label>
                                <select
                                    id="mosque_id"
                                    name="mosque_id"
                                    value={formData.mosque_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    {mosques.length === 0 ? (
                                        <option value="">No mosques available</option>
                                    ) : (
                                        mosques.map(mosque => (
                                            <option key={mosque.id} value={mosque.id}>
                                                {mosque.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Input 
                                    id="address" 
                                    name="address"
                                    type="text" 
                                    placeholder="123 Main St, City, State" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input 
                                    id="password" 
                                    name="password"
                                    type="password" 
                                    required 
                                    value={formData.password} 
                                    onChange={handleChange}
                                    minLength={8}
                                />
                                <p className="text-xs text-gray-500">Minimum 8 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <Input 
                                    id="confirmPassword" 
                                    name="confirmPassword"
                                    type="password" 
                                    required 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange}
                                    minLength={8}
                                />
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}
                            
                            <Button type="submit" className="w-full" disabled={isSubmitting || mosques.length === 0}>
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="loading-spinner w-4 h-4"></div>
                                        <span>Registering...</span>
                                    </div>
                                ) : (
                                    'Register'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="text-center mt-4 space-x-4">
                    <Button variant="link" onClick={onBackToLogin} disabled={isSubmitting}>Already have an account? Login</Button>
                </div>
            </div>
        </div>
    );
};
