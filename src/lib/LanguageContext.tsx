'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from './mock-data';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof TRANSLATIONS['fr']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');

    const t = (key: keyof typeof TRANSLATIONS['fr']) => {
        return TRANSLATIONS[language][key] || TRANSLATIONS['fr'][key];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
