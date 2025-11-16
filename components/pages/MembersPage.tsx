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
    
    // Check if a member is a system user (linked to users table)
    const isSystemUser = (member: Member) => !!member.userId;

    const handleAddMemberClick = () => {
        setEditingMember(null);
        setIsMemberModalOpen(true);
    };

    const handleEditMember = (member: Member) => {
        if (isSystemUser(member)) {
            alert('This member is a system user and cannot be edited from here. They can update their profile from the Profile page.');
            return;
        }
        setEditingMember(member);
        setIsMemberModalOpen(true);
    };

    const handleDeleteMember = async (memberId: string, member: Member) => {
        if (isSystemUser(member)) {
            alert('This member is a system user and cannot be deleted. System users (Imam, Muazzin, Admin) must be managed separately.');
            return;
        }
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
        { 
            header: 'Name', 
            accessor: item => (
                <div className="flex items-center space-x-3">
                    <img src={item.photo} className="h-10 w-10 rounded-full" alt={item.name}/>
                    <div>
                        <span>{item.name}</span>
                        {isSystemUser(item) && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">System User</span>
                        )}
                    </div>
                </div>
            )
        },
        { header: 'Role', accessor: item => item.role },
        { header: 'Contact', accessor: item => item.contact },
        ...(!isReadOnly ? [{
            header: 'Actions', 
            accessor: (item: Member) => {
                const isLinkedUser = isSystemUser(item);
                return (
                    <div className="flex space-x-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e: MouseClickEvent) => handleClick(e, () => handleEditMember(item))}
                            disabled={isLinkedUser}
                            title={isLinkedUser ? 'System users cannot be edited from here' : 'Edit member'}
                        >
                            <EditIcon className={`h-4 w-4 ${isLinkedUser ? 'text-gray-400' : ''}`} />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e: MouseClickEvent) => handleClick(e, () => handleDeleteMember(item.id, item))}
                            disabled={isLinkedUser}
                            title={isLinkedUser ? 'System users cannot be deleted' : 'Delete member'}
                        >
                            <TrashIcon className={`h-4 w-4 ${isLinkedUser ? 'text-gray-400' : 'text-red-500'}`} />
                        </Button>
                    </div>
                );
            }
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
            {!isReadOnly && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Note:</strong> Members marked as "System User" are also registered users (Imam, Muazzin, Admin) and cannot be edited or deleted from here. They can update their information from the Profile page.
                    </p>
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
