import { ChangeEvent } from 'react';

// Event handler types
export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
export type SelectChangeEvent = ChangeEvent<HTMLSelectElement>;
export type TextareaChangeEvent = ChangeEvent<HTMLTextAreaElement>;

// Function to handle type-safe form changes
export const handleFormChange = <T extends Record<string, any>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    e: InputChangeEvent | SelectChangeEvent | TextareaChangeEvent
) => {
    const { id, value } = e.target;
    setter(prev => ({ ...prev, [id]: value }));
};
