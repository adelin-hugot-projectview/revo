import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DateRangePicker = ({ onDateChange, colors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const wrapperRef = useRef(null);

    const formatDate = (date) => date ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date) : '';

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleDayClick = (day) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (day < startDate) {
                setEndDate(startDate);
                setStartDate(day);
            } else {
                setEndDate(day);
            }
        }
    };
    
    const confirmSelection = () => {
        onDateChange(startDate, endDate);
        setIsOpen(false);
    }

    const renderHeader = () => (
        <div className="flex justify-between items-center px-4 py-2">
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-sm">{new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentMonth)}</span>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight size={20} /></button>
        </div>
    );

    const renderDays = () => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const days = [];
        const monthStartDay = (date.getDay() + 6) % 7;

        for (let i = 0; i < monthStartDay; i++) {
            days.push(<div key={`empty-start-${i}`} className="text-center p-2"></div>);
        }

        while (date.getMonth() === currentMonth.getMonth()) {
            const day = new Date(date);
            const isSelectedStart = startDate && day.toDateString() === startDate.toDateString();
            const isSelectedEnd = endDate && day.toDateString() === endDate.toDateString();
            const isInRange = startDate && endDate && day > startDate && day < endDate;
            const isToday = day.toDateString() === new Date().toDateString();

            let classes = "text-center p-2 rounded-full cursor-pointer text-sm transition-colors";
            if (isSelectedStart || isSelectedEnd) {
                classes += ` bg-[${colors.primary}] text-white`;
            } else if (isInRange) {
                classes += ` bg-[${colors.secondary}]`;
            } else if (isToday) {
                 classes += ` border border-gray-300`;
            } else {
                classes += ' hover:bg-gray-100';
            }

            days.push(<div key={day} className={classes} onClick={() => handleDayClick(day)}>{day.getDate()}</div>);
            date.setDate(date.getDate() + 1);
        }

        return <div className="grid grid-cols-7 gap-1 p-2">{days}</div>;
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg text-sm">
                <Calendar size={20} className="text-gray-500"/>
                <span>{startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Sélectionner une plage'}</span>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border z-30 w-72">
                    {renderHeader()}
                    {renderDays()}
                    <div className="p-2 border-t flex justify-end">
                        <button onClick={confirmSelection} className="px-4 py-1 text-white text-sm rounded-lg" style={{backgroundColor: colors.primary}}>Confirmer</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
