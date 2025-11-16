import { useState, useEffect } from 'react';
import { Mosque, AuditLog } from '../../types';
import { DataTable, Column } from '../DataTable';
import dbService from '../../database/clientService';

export const AuditLogPage = ({ mosque }: { mosque: Mosque }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    
    useEffect(() => {
        dbService.getCollection<'auditLogs'>(mosque.id, 'auditLogs').then(setLogs);
    }, [mosque]);
    
    const columns: Column<AuditLog>[] = [
        { header: 'User', accessor: item => item.user },
        { header: 'Action', accessor: item => item.action },
        { header: 'Details', accessor: item => item.details },
        { header: 'Date', accessor: item => item.date },
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Audit Log</h1>
            </div>
            <DataTable columns={columns} data={logs} />
        </div>
    );
};
