'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DayMonthPickerProps {
    value: string; // "DD/MM"
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MONTHS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DayMonthPicker: React.FC<DayMonthPickerProps> = ({ value, onChange, placeholder = "JJ/MM", className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Parse initial value
    const [day, month] = value && value.includes('/') ? value.split('/').map(Number) : [null, null];
    
    const [selectedMonth, setSelectedMonth] = useState<number>(month ? month - 1 : new Date().getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(day);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 300) {
                setOpenUp(true);
            } else {
                setOpenUp(false);
            }
        }
    }, [isOpen]);

    const daysInMonth = (m: number) => {
        // Use a non-leap year (like 2023) to determine days in month
        return new Date(2023, m + 1, 0).getDate();
    };

    const handleDayClick = (d: number) => {
        setSelectedDay(d);
        const formattedDay = d.toString().padStart(2, '0');
        const formattedMonth = (selectedMonth + 1).toString().padStart(2, '0');
        onChange(`${formattedDay}/${formattedMonth}`);
        setIsOpen(false);
    };

    const nextMonth = () => setSelectedMonth((prev) => (prev + 1) % 12);
    const prevMonth = () => setSelectedMonth((prev) => (prev - 1 + 12) % 12);

    return (
        <div className="day-month-picker-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <div 
                className={className} 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(223, 185, 109, 0.3)',
                    background: 'white',
                    color: value ? '#1a1a1a' : '#999',
                    fontSize: '0.95rem'
                }}
            >
                <span>{value || placeholder}</span>
                <Calendar size={18} color="#DFB96D" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: openUp ? -10 : 10, x: '-50%', scale: 0.95 }}
                        animate={{ opacity: 1, y: openUp ? -5 : 5, x: '-50%', scale: 1 }}
                        exit={{ opacity: 0, y: openUp ? -10 : 10, x: '-50%', scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            bottom: openUp ? '100%' : 'auto',
                            top: openUp ? 'auto' : '100%',
                            left: '50%',
                            zIndex: 1000,
                            width: '320px',
                            background: 'rgba(248, 245, 240, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(223, 185, 109, 0.25)',
                            padding: '20px',
                            marginBottom: openUp ? '15px' : '0',
                            marginTop: openUp ? '0' : '15px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                <ChevronLeft size={20} color="#DFB96D" />
                            </button>
                            <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>{MONTHS[selectedMonth]}</span>
                            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                <ChevronRight size={20} color="#DFB96D" />
                            </button>
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(7, 1fr)', 
                            gap: '5px',
                            textAlign: 'center'
                        }}>
                            {Array.from({ length: daysInMonth(selectedMonth) }, (_, i) => i + 1).map((d) => {
                                const isSelected = selectedDay === d && (selectedMonth + 1) === Number(value.split('/')[1]);
                                return (
                                    <button
                                        key={d}
                                        onClick={() => handleDayClick(d)}
                                        style={{
                                            padding: '8px 0',
                                            border: 'none',
                                            background: isSelected ? '#DFB96D' : 'none',
                                            color: isSelected ? 'white' : '#1a1a1a',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: isSelected ? '600' : '400',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(223, 185, 109, 0.1)')}
                                        onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'none')}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DayMonthPicker;
