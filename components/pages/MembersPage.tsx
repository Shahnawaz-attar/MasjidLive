import { useState, MouseEvent } from 'react';
import { Mosque, Member } from '../../types';
import { Button } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import { DataTable, Column } from '../DataTable';
import { MemberFormModal } from '../forms/MemberFormModal';
import dbService from '../../database/clientService';
import { useMembers } from '../../hooks/useData';

type MouseClickEvent = MouseEvent<HTMLButtonElement>;

const handleClick = (e: MouseClickEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
};

export const MembersPage = ({ mosque, userRole }: { mosque: Mosque; userRole: string }) => {
    const { members, isLoading, mutate } = useMembers(mosque.id);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    
    const isReadOnly = userRole === 'Muazzin'; // Muazzin can only view members

    const handleAddMemberClick = () => {
        setEditingMember(null);
        setIsMemberModalOpen(true);
    };

    const handleEditMember = (member: Member) => {
        setEditingMember(member);
        setIsMemberModalOpen(true);
    };

    const handleDeleteMember = async (memberId: string) => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            await dbService.deleteDoc('members', memberId);
            mutate(); // Revalidate data after deletion
        }
    };
    
    const handleSave = () => {
        mutate(); // Revalidate data after save
        setIsMemberModalOpen(false);
    };

    const columns: Column<Member>[] = [
        { header: 'Name', accessor: item => <div className="flex items-center space-x-3"><img src={item.photo} className="h-10 w-10 rounded-full" alt={item.name}/><span>{item.name}</span></div> },
        { header: 'Role', accessor: item => item.role },
        { header: 'Contact', accessor: item => item.contact },
        ...(!isReadOnly ? [{
            header: 'Actions', 
            accessor: (item: Member) => (
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditMember(item))}>
                        <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteMember(item.id))}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )
        }] : []),
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Members</h1>
                {!isReadOnly && <Button onClick={handleAddMemberClick}><PlusIcon className="h-4 w-4 mr-2"/>Add Member</Button>}
            </div>
            {isReadOnly && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">You have read-only access to view members.</p>
                </div>
            )}
            {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading members...</div>
            ) : (
                <DataTable columns={columns} data={members} />
            )}
            {!isReadOnly && (
                <MemberFormModal 
                    isOpen={isMemberModalOpen} 
                    onClose={() => setIsMemberModalOpen(false)} 
                    mosqueId={mosque.id} 
                    initialData={editingMember} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};
