import { useState, FormEvent } from 'react';
import { UserWithoutPassword } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label } from '../ui';
import { MosqueIcon } from '../icons';
import { InputChangeEvent } from '../utils/formHelpers';
import dbService from '../../database/clientService';

export const LoginScreen = ({ onLoginSuccess, onBackToLanding, onGoToRegister }: { 
    onLoginSuccess: (user: UserWithoutPassword) => void, 
    onBackToLanding: () => void,
    onGoToRegister: () => void 
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = (e: InputChangeEvent) => setEmail(e.target.value);
    const handlePasswordChange = (e: InputChangeEvent) => setPassword(e.target.value);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const user = await dbService.login(email, password);
        if (user) {
            onLoginSuccess(user);
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-dark-background p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <MosqueIcon className="h-12 w-12 text-primary mx-auto"/>
                    <h1 className="text-3xl font-bold mt-2">Masjid Manager</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email or Username</Label>
                                <Input id="email" type="text" placeholder="admin or admin@masjid.com" required value={email} onChange={handleEmailChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required value={password} onChange={handlePasswordChange} placeholder="password123"/>
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="text-center mt-4">
                    <Button variant="link" onClick={onBackToLanding}>Back to Public View</Button>
                    <span className="mx-2 text-gray-400">|</span>
                    <Button variant="link" onClick={onGoToRegister}>Register</Button>
                </div>
            </div>
        </div>
    );
};
