import { Dialog } from '@headlessui/react';
import { useState } from 'react';

interface AddRecordDialogProps<T> {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (record: Omit<T, 'id'>) => void;
    columns: { header?: string; accessorKey: string }[];
}

type DataRow = {
    id: string;
    [key: string]: any;
};

export function AddRecordDialog<T extends DataRow>({
    isOpen,
    onClose,
    onAdd,
    columns
}: AddRecordDialogProps<T>) {
    console.log('columns', columns);
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    console.log('formValues', formValues);

    const handleSubmit = () => {
        console.log(formValues);
        onAdd(formValues as Omit<T, 'id'>);
        setFormValues({});
    };

    const handleInputChange = (fieldName: string, value: string) => {
        setFormValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed z-10 inset-0 overflow-y-auto"
        >
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />

                <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                        Add New Record
                    </Dialog.Title>

                    <div className="space-y-4">
                        {columns
                            .filter(column => column.accessorKey !== 'id') // Exclude ID field
                            .map(column => {
                                // Get the header from column definition
                                const headerLabel = typeof column.header === 'string'
                                    ? column.header
                                    : String(column.accessorKey);

                                // Use column id as the field name
                                const fieldName = String(column.accessorKey);

                                return (
                                    <div key={fieldName} className="space-y-1">
                                        <label
                                            htmlFor={fieldName}
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            {headerLabel}
                                        </label>
                                        <input
                                            type="text"
                                            id={fieldName}
                                            value={formValues[fieldName] || ''}
                                            onChange={e => handleInputChange(fieldName, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder={`Enter ${headerLabel.toLowerCase()}`}
                                        />
                                    </div>
                                );
                            })}
                    </div>

                    <div className="mt-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Add Record
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                setFormValues({});
                            }}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
} 