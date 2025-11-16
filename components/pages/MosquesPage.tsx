import { useState, MouseEvent } from 'react';
import { Mosque } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { MosqueFormModal } from '../forms/MosqueFormModal';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

export const MosquesPage = ({ mosques, onMosqueChange, onRefresh, userRole }: { 
    mosques: Mosque[], 
    onMosqueChange: (mosque: Mosque) => void, 
    onRefresh: () => void,
    userRole: string
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMosque, setEditingMosque] = useState<Mosque | null>(null);
    
    const isReadOnly = userRole === 'Imam'; // Imam can only view mosques
    const handleAddClick = () => {
        setEditingMosque(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (mosque: Mosque) => {
        setEditingMosque(mosque);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (mosqueId: string) => {
        if (window.confirm("Are you sure you want to delete this mosque? This will also delete all associated data (members, prayer times, events, etc.).")) {
            try {
                await dbService.deleteMosque(mosqueId);
                onRefresh();
            } catch (err: any) {
                alert('Failed to delete mosque: ' + (err.message || 'Unknown error'));
            }
        }
    };

    const handleSave = (mosque: Mosque) => {
        onRefresh();
        if (editingMosque && editingMosque.id === mosque.id) {
            onMosqueChange(mosque);
        }
    };

    const columns: Column<Mosque>[] = [
        { 
            header: 'Mosque', 
            accessor: item => (
                <div className="flex items-center space-x-3">
                    <img src={item.logoUrl} alt={item.name} className="h-10 w-10 rounded-md" />
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.address}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: item => (
                <div className="flex space-x-2">
                    {!isReadOnly && (
                        <>
                            <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditClick(item))}>
                                <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item.id))}>
                                <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                        </>
                    )}
                    <Button variant="outline" size="sm" onClick={(e: MouseClickEvent) => handleClick(e, () => onMosqueChange(item))}>
                        Select
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Mosques</h1>
                {!isReadOnly && <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Mosque</Button>}
            </div>
            {isReadOnly && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">You have read-only access to view mosques.</p>
                </div>
            )}
            <DataTable columns={columns} data={mosques} />
            {!isReadOnly && (
                <MosqueFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingMosque}
                />
            )}
        </div>
    );
};
