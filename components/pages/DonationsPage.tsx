import { useState, useEffect, MouseEvent } from 'react';
import { Mosque, Donation } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { DonationFormModal } from '../forms/DonationFormModal';
import dbService from '../../database/clientService';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

export const DonationsPage = ({ mosque }: { mosque: Mosque }) => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

    const fetchDonations = () => {
        dbService.getCollection<'donations'>(mosque.id, 'donations').then(setDonations);
    };

    useEffect(() => {
        fetchDonations();
    }, [mosque]);

    const handleAddClick = () => {
        setEditingDonation(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (donation: Donation) => {
        setEditingDonation(donation);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (donationId: string) => {
        if (window.confirm("Are you sure you want to delete this donation?")) {
            await dbService.deleteDoc('donations', donationId);
            fetchDonations();
        }
    };

    const columns: Column<Donation>[] = [
        { header: 'Donor', accessor: item => item.donorName },
        { header: 'Amount', accessor: item => `$${item.amount.toFixed(2)}` },
        { header: 'Purpose', accessor: item => item.purpose },
        { header: 'Date', accessor: item => item.date },
        {
            header: 'Actions',
            accessor: item => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditClick(item))}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item.id))}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Donations</h1>
                <Button onClick={handleAddClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Donation</Button>
            </div>
            <DataTable columns={columns} data={donations} />
            <DonationFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mosqueId={mosque.id}
                initialData={editingDonation}
                onSave={fetchDonations}
            />
        </div>
    );
};
