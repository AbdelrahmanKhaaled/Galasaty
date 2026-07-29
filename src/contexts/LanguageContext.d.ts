import { type ReactNode } from 'react';
interface LanguageContextType {
    language: 'en' | 'ar';
    changeLanguage: (lang: 'en' | 'ar') => void;
    isRTL: boolean;
}
export declare function LanguageProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useLanguage(): LanguageContextType;
export {};
