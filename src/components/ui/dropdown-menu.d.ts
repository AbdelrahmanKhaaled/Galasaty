import * as React from "react";
interface DropdownMenuProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export declare function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps): import("react/jsx-runtime").JSX.Element;
interface DropdownMenuTriggerProps {
    asChild?: boolean;
    children: React.ReactNode;
}
export declare function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps): import("react/jsx-runtime").JSX.Element;
interface DropdownMenuContentProps {
    children: React.ReactNode;
    align?: "start" | "end" | "center";
    className?: string;
}
export declare function DropdownMenuContent({ children, align, className }: DropdownMenuContentProps): import("react/jsx-runtime").JSX.Element | null;
interface DropdownMenuItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}
export declare function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps): import("react/jsx-runtime").JSX.Element;
export {};
