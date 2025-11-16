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
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = (e: InputChangeEvent) => setEmail(e.target.value);
    const handlePasswordChange = (e: InputChangeEvent) => setPassword(e.target.value);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        
        if (isLoading) return;
        setIsLoading(true);

        try {
            const user = await dbService.login(email, password);
            if (user) {
                onLoginSuccess(user);
            } else {
                setError('Invalid email or password.');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google login functionality
        console.log('Google login coming soon...');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
            {/* Animated background decorations */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.08]"></div>
            <div className="absolute top-10 left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-200/8 rounded-full blur-xl animate-pulse delay-500"></div>

            {/* Back button */}
            <Button 
                variant="ghost" 
                onClick={onBackToLanding}
                className="absolute top-6 left-6 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                ← Back to Home
            </Button>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg">
                            <MosqueIcon className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in to your MasjidLive account
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-xl font-semibold text-center text-gray-900 dark:text-white">
                            Sign In
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="h-11 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="h-11 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm backdrop-blur">
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google Sign In - Disabled for now */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={true}
                            className="w-full h-11 border-gray-200/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Continue with Google (Coming Soon)</span>
                            </div>
                        </Button>

                        {/* Register link */}
                        <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <button 
                                    onClick={onGoToRegister}
                                    className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                                >
                                    Create one here
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our terms of service and privacy policy
                </div>
            </div>
        </div>
    );
};
