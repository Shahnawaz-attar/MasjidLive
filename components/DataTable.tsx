
import React from 'react';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({ columns, data, onRowClick }: DataTableProps<T>) {
  return (
    <div className="bg-surface dark:bg-dark-surface rounded-2xl shadow-material overflow-hidden border border-transparent dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <tr 
                key={item.id}
                className={`transition-colors duration-150 ${onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 ${col.cellClassName || ''}`}
                  >
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
