import * as React from "react";
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}
export declare function Modal({ isOpen, onClose, title, children, size }: ModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
