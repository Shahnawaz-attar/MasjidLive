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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50/40 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
            <div className="absolute top-20 right-20 w-28 h-28 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute bottom-20 left-20 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1500"></div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-6 animate-in fade-in slide-in-from-top duration-700">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
                        <MosqueIcon className="h-14 w-14 text-primary mx-auto relative z-10 drop-shadow-lg"/>
                    </div>
                    <h1 className="text-3xl font-bold mt-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        City Masjid
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Register as Imam or Muazzin</p>
                </div>
                
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/30 shadow-2xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                    <CardHeader className="text-center pb-3">
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Create Account</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">Register to manage your mosque</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</Label>
                                    <Input 
                                        id="name" 
                                        name="name"
                                        type="text" 
                                        placeholder="John Doe" 
                                        required 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        disabled={isSubmitting}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-600/50"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username *</Label>
                                    <Input 
                                        id="username" 
                                        name="username"
                                        type="text" 
                                        placeholder="johndoe" 
                                        required 
                                        value={formData.username} 
                                        onChange={handleChange}
                                        minLength={3}
                                        disabled={isSubmitting}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-600/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</Label>
                                <Input 
                                    id="email" 
                                    name="email"
                                    type="email" 
                                    placeholder="john@example.com" 
                                    value={formData.email} 
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-600/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Role *</Label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-200/80 dark:border-gray-600/50 rounded-md bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                                    >
                                        <option value="Muazzin">Muazzin</option>
                                        <option value="Imam">Imam</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mosque_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mosque *</Label>
                                    <select
                                        id="mosque_id"
                                        name="mosque_id"
                                        value={formData.mosque_id}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-200/80 dark:border-gray-600/50 rounded-md bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Address (Optional)</Label>
                                <Input 
                                    id="address" 
                                    name="address"
                                    type="text" 
                                    placeholder="123 Main St, City, State" 
                                    value={formData.address} 
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-600/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password *</Label>
                                    <Input 
                                        id="password" 
                                        name="password"
                                        type="password" 
                                        required 
                                        value={formData.password} 
                                        onChange={handleChange}
                                        minLength={8}
                                        disabled={isSubmitting}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-600/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password *</Label>
                                    <Input 
                                        id="confirmPassword" 
                                        name="confirmPassword"
                                        type="password" 
                                        required 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange}
                                        minLength={8}
                                        disabled={isSubmitting}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-600/50"
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 p-2 rounded-lg border border-gray-200/50 dark:border-gray-700/30">
                                <p>• Username must be unique, minimum 3 characters</p>
                                <p>• Password must be at least 8 characters long</p>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 animate-in fade-in slide-in-from-top duration-300">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                            
                            <Button 
                                type="submit" 
                                className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
                                disabled={isSubmitting || mosques.length === 0}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                
                <div className="text-center mt-5 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
                    <Button 
                        variant="link" 
                        onClick={onBackToLogin} 
                        disabled={isSubmitting}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors duration-200 text-sm"
                    >
                        ← Already have an account? Sign in
                    </Button>
                </div>
            </div>
        </div>
    );
};
