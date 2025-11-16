// Reusable skeleton components for loading states

export const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <div className="space-y-3">
        {/* Table Header */}
        <div className="flex gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={`header-${i}`} className="h-4 flex-1" />
            ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1">
                        {colIndex === 0 && columns > 3 ? (
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ) : (
                            <Skeleton className="h-4 w-full" />
                        )}
                    </div>
                ))}
            </div>
        ))}
    </div>
);

export const CardSkeleton = () => (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
    </div>
);

export const StatCardSkeleton = () => (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-10 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
    </div>
);
