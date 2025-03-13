import { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    SortingState,
    PaginationState,
    AccessorColumnDef
} from '@tanstack/react-table';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { AddRecordDialog } from './AddRecordDialog';

interface DataTableProps<T> {
    tableName: string;
    columns: AccessorColumnDef<T, string>[];
}

type DataRow = {
    id: string;
    [key: string]: any;
};

// Helper function to get status badge styling
const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export function DataTable<T extends DataRow>({ tableName, columns }: DataTableProps<T>) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [editingRow, setEditingRow] = useState<T | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<T | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [newRecordOpen, setNewRecordOpen] = useState(false);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pagination.pageSize),
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: count } = await supabase
                .from(tableName)
                .select('count', { count: 'exact' });

            const { data: results, error } = await supabase
                .from(tableName)
                .select('*')
                .range(
                    pagination.pageIndex * pagination.pageSize,
                    (pagination.pageIndex + 1) * pagination.pageSize - 1
                );

            if (error) throw error;

            setData(results || []);
            setTotalCount(count?.[0]?.count || 0);
        } catch (error) {
            toast.error('Error fetching data');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Set up real-time subscription
        const subscription = supabase
            .channel(`${tableName}_changes`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                (_payload) => {
                    fetchData(); // Refresh data when changes occur
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [pagination.pageIndex, pagination.pageSize, tableName]);

    const handleEdit = async (row: T) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .update(editingRow)
                .eq('id', row.id);

            if (error) throw error;

            toast.success('Row updated successfully');
            setEditingRow(null);
            fetchData();
        } catch (error) {
            toast.error('Error updating row');
            console.error('Error:', error);
        }
    };

    const handleDelete = async () => {
        if (!rowToDelete) return;

        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', rowToDelete.id);

            if (error) throw error;

            toast.success('Row deleted successfully');
            setDeleteConfirmOpen(false);
            setRowToDelete(null);
            fetchData();
        } catch (error) {
            toast.error('Error deleting row');
            console.error('Error:', error);
        }
    };

    const handleAddNew = async (newRecord: Omit<T, 'id'>) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .insert([newRecord]);

            if (error) throw error;

            toast.success('Record added successfully');
            setNewRecordOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error adding record');
            console.error('Error:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Users Table</h2>
                <button
                    onClick={() => setNewRecordOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    New Record
                </button>
            </div>

            <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                {loading && (
                    <div className="flex justify-center my-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                )}

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        <span>
                                            {header.column.getIsSorted()
                                                ? header.column.getIsSorted() === 'desc'
                                                    ? ' ↓'
                                                    : ' ↑'
                                                : ''}
                                        </span>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => {
                            const isEditing = editingRow?.id === row.original.id;

                            return (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingRow[cell.column.id]}
                                                    onChange={e => setEditingRow({
                                                        ...editingRow,
                                                        [cell.column.id]: e.target.value
                                                    })}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                <>
                                                    {cell.column.id === 'status' ? (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(String(cell.getValue()))}`}>
                                                            {cell.getValue() as string}
                                                        </span>
                                                    ) : cell.column.id === 'id' ? (
                                                        <span className="font-mono text-xs text-gray-500">
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </span>
                                                    ) : (
                                                        flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {isEditing ? (
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => handleEdit(row.original as T)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingRow(null)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => setEditingRow(row.original as T)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setRowToDelete(row.original as T);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="py-3 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                                <span className="font-medium">{table.getPageCount()}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <AddRecordDialog
                isOpen={newRecordOpen}
                onClose={() => setNewRecordOpen(false)}
                onAdd={handleAddNew}
                columns={columns as { header?: string; accessorKey: string }[]}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                className="fixed z-10 inset-0 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen">
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

                    <div className="relative bg-white rounded max-w-lg w-full mx-4 p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <Dialog.Title className="text-lg leading-6 font-medium text-gray-900">
                                    Delete Row
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete this row? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                                onClick={() => setDeleteConfirmOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
} 