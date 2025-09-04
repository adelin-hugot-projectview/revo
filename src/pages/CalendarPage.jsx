import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import CalendarSiteCard from '../components/details/CalendarSiteCard.jsx';

// --- COMPOSANT : Menu déroulant personnalisé ---
const CustomSelect = ({ options, selected, onSelect, colors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    const handleSelect = (option) => { onSelect(option); setIsOpen(false); };
    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 px-4 border border-gray-300 rounded-full text-sm font-semibold">
                <span>{selected}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border z-20 w-40">
                    <ul className="p-1">
                        {options.map(option => (
                            <li key={option} onClick={() => handleSelect(option)} className={`p-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 ${selected === option ? 'font-bold text-primary' : ''}`}>{option}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- VUE : Année, Semestre, Trimestre (réutilisent le même mini-calendrier) ---
const MonthCalendar = ({ year, month, sites, colors, onDayClick }) => {
    const date = new Date(year, month, 1);
    const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date);
    const days = [];
    const monthStartDay = (date.getDay() + 6) % 7;
    for (let i = 0; i < monthStartDay; i++) { days.push(<div key={`empty-start-${i}`} className="h-8"></div>); }
    while (date.getMonth() === month) {
        const day = new Date(date);
        const dayStr = day.toDateString();
        const isToday = dayStr === new Date().toDateString();
        const eventsOnDay = sites.filter(s => new Date(s.start_date).toDateString() === dayStr);
        const uniqueStatuses = [...new Set(eventsOnDay.map(e => e.status))];
        let dayClasses = "text-center text-xs p-1 rounded-full w-6 h-6 flex items-center justify-center transition-colors";
        if (isToday) { dayClasses += ' bg-primary text-white'; }
        else { dayClasses += ' hover:bg-gray-100'; }
        days.push(
            <div key={day} className="flex flex-col items-center cursor-pointer h-8" onClick={() => onDayClick(day)}>
                <div className={dayClasses}>{day.getDate()}</div>
                <div className="flex space-x-1 mt-1 h-1">
                    {uniqueStatuses.slice(0, 3).map(status => {
                        const statusColors = { 'Terminé': 'bg-primary', 'En cours': 'bg-success', 'À venir': 'bg-accent', 'Annulé': 'bg-danger', 'Problème': 'bg-danger' };
                        return <div key={status} className={`w-1.5 h-1.5 rounded-full ${statusColors[status] || 'bg-neutralDark'}`}></div>;
                    })}
                </div>
            </div>
        );
        date.setDate(date.getDate() + 1);
    }
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-center mb-2 capitalize">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
            <div className="grid grid-cols-7 gap-y-1 gap-x-2">{days}</div>
        </div>
    );
};

const MultiMonthView = ({ year, months, sites, colors, onDayClick }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {months.map(month => <MonthCalendar key={month} year={year} month={month} sites={sites} colors={colors} onDayClick={onDayClick} />)}
    </div>
);

// --- VUE : Mois ---
const MonthView = ({ currentDate, sites, colors, onSiteClick }) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const days = [];
    const monthStartDay = (date.getDay() + 6) % 7;
    for (let i = 0; i < monthStartDay; i++) { days.push(<div key={`empty-start-${i}`} className="border-r border-b"></div>); }
    while (date.getMonth() === currentDate.getMonth()) {
        const day = new Date(date);
        const eventsOnDay = sites.filter(s => new Date(s.start_date).toDateString() === day.toDateString());
        days.push(
            <div key={day} className="border-r border-b p-2 min-h-[120px] cursor-pointer hover:bg-gray-50">
                <p className="font-semibold">{day.getDate()}</p>
                <ul className="text-xs mt-1 space-y-1">
                    {eventsOnDay.map(event => <CalendarSiteCard key={event.id} site={event} onSiteClick={onSiteClick} colors={colors} />)}
                </ul>
            </div>
        );
        date.setDate(date.getDate() + 1);
    }
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-7 text-center font-semibold text-gray-600">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(d => <div key={d} className="p-2 border-r border-b">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">{days}</div>
        </div>
    );
};

// --- VUE : Semaine et Jour ---
const TimeView = ({ days, sites, colors, onSiteClick }) => {
    const hours = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    const timeToMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
    return (
        <div className="bg-white rounded-lg shadow-sm relative h-[70vh] flex flex-col">
            <div className={`flex pl-[53px] sticky top-0 bg-white z-10 grid grid-cols-${days.length}`}>
                {days.map(day => (
                    <div key={day.toISOString()} className="flex-1 p-2 text-center border-b border-l">
                        <p className="font-semibold text-gray-700">{day.toLocaleDateString('fr-FR', { weekday: 'long' })}</p>
                        <p className="text-gray-500 text-2xl font-light">{day.getDate()}</p>
                    </div>
                ))}
            </div>
            <div className="flex-grow flex relative overflow-y-auto">
                <div className="w-[53px] border-r">
                    {hours.map(hour => <div key={hour} className="h-[60px] relative"><span className="absolute -top-2 right-2 text-xs text-gray-400">{hour}</span></div>)}
                </div>
                <div className={`flex-grow grid grid-cols-${days.length}`}>
                    {days.map((day) => (
                        <div key={day.toISOString()} className="relative border-l">
                            {hours.map(hour => <div key={hour} className="h-[60px] border-t border-gray-200"><div className="h-1/2 border-b border-dashed border-gray-200"></div></div>)}
                            {sites.filter(event => new Date(event.start_date).toDateString() === day.toDateString())
                                 .map(event => {
                                    const top = timeToMinutes(event.startTime) - (8 * 60);
                                    const height = timeToMinutes(event.endTime) - timeToMinutes(event.startTime);
                                    return (
                                        <div key={event.id} style={{ position: 'absolute', top: `${top}px`, height: `${height}px`, width: 'calc(100% - 8px)', left: '4px' }} className="p-1 rounded-lg overflow-hidden cursor-pointer">
                                            <CalendarSiteCard site={event} onSiteClick={onSiteClick} colors={colors} />
                                        </div>
                                    );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Composant principal de la page Calendrier ---
const CalendarPage = ({ sites, colors, onSiteClick }) => {
    const [view, setView] = useState('Année');
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleDayClick = (day) => {
        const sitesOnDay = sites.filter(site => new Date(site.start_date).toDateString() === day.toDateString());
        if (sitesOnDay.length === 1) onSiteClick(sitesOnDay[0]);
    };

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (view === 'Année') newDate.setFullYear(newDate.getFullYear() - 1);
        if (view === 'Semestre') newDate.setMonth(newDate.getMonth() - 6);
        if (view === 'Trimestre') newDate.setMonth(newDate.getMonth() - 3);
        if (view === 'Mois') newDate.setMonth(newDate.getMonth() - 1);
        if (view === 'Semaine') newDate.setDate(newDate.getDate() - 7);
        if (view === 'Jour') newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };
    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'Année') newDate.setFullYear(newDate.getFullYear() + 1);
        if (view === 'Semestre') newDate.setMonth(newDate.getMonth() + 6);
        if (view === 'Trimestre') newDate.setMonth(newDate.getMonth() + 3);
        if (view === 'Mois') newDate.setMonth(newDate.getMonth() + 1);
        if (view === 'Semaine') newDate.setDate(newDate.getDate() + 7);
        if (view === 'Jour') newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };
    
    const getWeekDays = (baseDate) => { const start = new Date(baseDate); start.setDate(start.getDate() - (start.getDay() + 6) % 7); return Array.from({ length: 7 }).map((_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; }); };

    const renderView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        switch (view) {
            case 'Année':
                return <MultiMonthView year={year} months={Array.from({length: 12}, (_, i) => i)} sites={sites} colors={colors} onDayClick={handleDayClick} />;
            case 'Semestre':
                const startMonthSemester = Math.floor(month / 6) * 6;
                return <MultiMonthView year={year} months={Array.from({length: 6}, (_, i) => startMonthSemester + i)} sites={sites} colors={colors} onDayClick={handleDayClick} />;
            case 'Trimestre':
                const startMonthQuarter = Math.floor(month / 3) * 3;
                return <MultiMonthView year={year} months={Array.from({length: 3}, (_, i) => startMonthQuarter + i)} sites={sites} colors={colors} onDayClick={handleDayClick} />;
            case 'Mois':
                return <MonthView currentDate={currentDate} sites={sites} colors={colors} onSiteClick={onSiteClick} />;
            case 'Semaine':
                 return <TimeView days={getWeekDays(currentDate)} sites={sites} colors={colors} onSiteClick={onSiteClick} />;
            case 'Jour':
                 return <TimeView days={[currentDate]} sites={sites} colors={colors} onSiteClick={onSiteClick} />;
            default:
                return <div>Vue non reconnue</div>;
        }
    };
    
    const getHeaderText = () => {
        switch(view) {
            case 'Année': return currentDate.getFullYear();
            case 'Semestre': return `S${Math.floor(currentDate.getMonth()/6)+1} ${currentDate.getFullYear()}`;
            case 'Trimestre': return `T${Math.floor(currentDate.getMonth()/3)+1} ${currentDate.getFullYear()}`;
            case 'Mois': return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate);
            case 'Semaine': return `Semaine du ${getWeekDays(currentDate)[0].toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}`;
            case 'Jour': return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(currentDate);
            default: return '';
        }
    };
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold" style={{color: colors.neutralDark, fontFamily: "'Poppins', sans-serif"}}>Calendrier</h1>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                         <button onClick={handlePrev} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft/></button>
                         <span className="font-semibold text-lg w-48 text-center">{getHeaderText()}</span>
                         <button onClick={handleNext} className="p-2 rounded-md hover:bg-gray-100"><ChevronRight/></button>
                    </div>
                    <CustomSelect options={['Année', 'Semestre', 'Trimestre', 'Mois', 'Semaine', 'Jour']} selected={view} onSelect={setView} colors={colors}/>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {renderView()}
            </div>
        </div>
    );
};

export default CalendarPage;

