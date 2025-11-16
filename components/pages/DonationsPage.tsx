import { useState, MouseEvent } from 'react';
import { Mosque, Donation } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { DonationFormModal } from '../forms/DonationFormModal';
import { ConfirmationModal } from '../ConfirmationModal';
import dbService from '../../database/clientService';
import { useDonations } from '../../hooks/useData';
import { TableSkeleton } from '../Skeleton';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

export const DonationsPage = ({ mosque }: { mosque: Mosque }) => {
    const { donations, isLoading, mutate } = useDonations(mosque.id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        donationId: string | null;
        donorName: string;
        amount: number;
    }>({
        isOpen: false,
        donationId: null,
        donorName: '',
        amount: 0,
    });

    const handleAddClick = () => {
        setEditingDonation(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (donation: Donation) => {
        setEditingDonation(donation);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (donation: Donation) => {
        setDeleteConfirmation({
            isOpen: true,
            donationId: donation.id,
            donorName: donation.donorName,
            amount: donation.amount,
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.donationId) {
            await dbService.deleteDoc('donations', deleteConfirmation.donationId);
            mutate();
        }
        setDeleteConfirmation({
            isOpen: false,
            donationId: null,
            donorName: '',
            amount: 0,
        });
    };

    const cancelDelete = () => {
        setDeleteConfirmation({
            isOpen: false,
            donationId: null,
            donorName: '',
            amount: 0,
        });
    };

    const handleSave = () => {
        mutate();
        setIsModalOpen(false);
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
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteClick(item))}>
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
            {isLoading ? (
                <TableSkeleton rows={5} columns={5} />
            ) : (
                <DataTable columns={columns} data={donations} />
            )}
            <DonationFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mosqueId={mosque.id}
                initialData={editingDonation}
                onSave={handleSave}
            />
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Donation"
                description={`Are you sure you want to delete the $${deleteConfirmation.amount} donation from "${deleteConfirmation.donorName}"? This action cannot be undone.`}
                confirmText="Delete Donation"
                cancelText="Cancel"
            />
        </div>
    );
};
