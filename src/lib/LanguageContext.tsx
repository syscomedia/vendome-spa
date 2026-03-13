'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from './mock-data';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof TRANSLATIONS['fr'], vars?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');

    const t = (key: keyof typeof TRANSLATIONS['fr'], vars?: Record<string, any>) => {
        const currentLangTranslations = TRANSLATIONS[language] as Record<keyof typeof TRANSLATIONS['fr'], string>;
        let text = currentLangTranslations[key] || TRANSLATIONS['fr'][key];
        if (vars) {
            Object.keys(vars).forEach(v => {
                text = text.replace(`{${v}}`, vars[v]);
            });
        }
        return text;
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
