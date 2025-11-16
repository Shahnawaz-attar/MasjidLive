import { Mosque } from '../../types';
import { DataTable, Column } from '../DataTable';
import { useAuditLogs } from '../../hooks/useData';
import { TableSkeleton } from '../Skeleton';

export const AuditLogPage = ({ mosque }: { mosque: Mosque }) => {
    const { auditLogs, isLoading } = useAuditLogs(mosque.id);
    
    const columns: Column<any>[] = [
        { header: 'User', accessor: item => item.userName || item.user },
        { header: 'Action', accessor: item => item.action },
        { header: 'Details', accessor: item => item.details },
        { header: 'Date', accessor: item => item.date },
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Audit Log</h1>
            </div>
            {isLoading ? (
                <TableSkeleton rows={8} columns={4} />
            ) : (
                <DataTable columns={columns} data={auditLogs} />
            )}
        </div>
    );
};
