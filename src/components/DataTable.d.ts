interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
}
interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onToggle?: (item: T) => void;
    onView?: (item: T) => void;
    onAdd?: () => void;
    addLabel?: string;
    isLoading?: boolean;
    getItemId: (item: T) => string | number;
}
export declare function DataTable<T extends Record<string, any>>({ data, columns, onEdit, onDelete, onToggle, onView, onAdd, addLabel, isLoading, getItemId, }: DataTableProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
