import React from 'react';
import { Button } from './ui';
import { XIcon } from './icons';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, title, description, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="sheet-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose} />

                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <div className="pointer-events-auto w-screen max-w-md">
                        <div className="flex h-full flex-col overflow-y-scroll bg-surface dark:bg-dark-surface shadow-xl">
                            <div className="px-4 sm:px-6 py-6 bg-surface dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100" id="sheet-title">
                                            {title}
                                        </h2>
                                        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
                                    </div>
                                    <div className="ml-3 flex h-7 items-center">
                                        <Button variant="ghost" size="icon" onClick={onClose}>
                                            <span className="sr-only">Close panel</span>
                                            <XIcon className="h-6 w-6" aria-hidden="true" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="relative flex-1 px-4 sm:px-6 py-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
