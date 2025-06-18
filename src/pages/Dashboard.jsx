import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';


// --- NOUVEAU CALENDRIER INTERACTIF STYLE GOOGLE AGENDA ---

const ItemTypes = {
    EVENT: 'event',
};

// Fonctions utilitaires pour la gestion du temps
const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const totalMinutes = Math.max(0, minutes);
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;
    const h = Math.floor(roundedMinutes / 60);
    const m = roundedMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const DraggableResizableEvent = ({ event, onEventClick, onEventUpdate, colors }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.EVENT,
        item: { ...event },
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));
    
    const handleResizeStop = (e, { size }) => {
        const snapIncrement = 15;
        let newHeight = Math.round(size.height / snapIncrement) * snapIncrement;
        const maxDuration = (19 * 60) - timeToMinutes(event.startTime);
        newHeight = Math.min(newHeight, maxDuration);
        const durationInMinutes = Math.max(30, newHeight);
        const newEndTime = minutesToTime(timeToMinutes(event.startTime) + durationInMinutes);
        onEventUpdate(event.id, { endTime: newEndTime });
    };

    const top = timeToMinutes(event.startTime) - (8 * 60);
    const height = timeToMinutes(event.endTime) - timeToMinutes(event.startTime);
    
    const eventColor = event.type === 'success' ? colors.primary : colors.accent;

    return (
        <div 
            ref={drag}
            className="absolute w-[95%] z-10"
            style={{ top: `${top}px`, height: `${height}px`, left: '2.5%', opacity: isDragging ? 0.4 : 1 }}
        >
            <ResizableBox
                height={height}
                width={Infinity}
                onResizeStop={handleResizeStop}
                minConstraints={[Infinity, 30]}
                resizeHandles={['s']}
                handle={
                    <div 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute bottom-0 left-0 w-full h-4 flex justify-center items-end cursor-s-resize"
                    >
                        <div className="w-4 h-1 bg-white/50 rounded-full"></div>
                    </div>
                }
            >
                 <div onClick={() => onEventClick(event)} className="h-full p-2 rounded-lg text-white cursor-grab flex flex-col" style={{ backgroundColor: eventColor }}>
                    <p className="font-bold text-sm">{event.name}</p>
                    <p className="text-xs opacity-90">{event.client}</p>
                    <p className="text-xs opacity-80">{event.startTime} - {event.endTime}</p>
                 </div>
            </ResizableBox>
        </div>
    );
};

const DayColumn = ({ day, dayIndex, children, onDrop, setDropIndicator, dropIndicator, colors }) => {
    const dayRef = useRef(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.EVENT,
        hover(item, monitor) {
            if (!dayRef.current) return;
            const dropY = monitor.getClientOffset().y - dayRef.current.getBoundingClientRect().top;
            const top = Math.round(dropY / 15) * 15;
            const height = timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
            setDropIndicator({ dayIndex, top, height, type: item.type });
        },
        drop: (item, monitor) => {
            const dropY = monitor.getClientOffset().y - dayRef.current.getBoundingClientRect().top;
            const newStartMinutes = (8 * 60) + dropY;
            onDrop(item, day, minutesToTime(newStartMinutes));
        },
        collect: monitor => ({ isOver: !!monitor.isOver() }),
    }));
    
    return (
        <div ref={drop(dayRef)} className="relative h-full border-r border-gray-200">
            {children}
            {isOver && dropIndicator && dropIndicator.dayIndex === dayIndex && (
                <div className="absolute w-[95%] left-[2.5%] rounded-lg z-0 pointer-events-none" style={{ top: `${dropIndicator.top}px`, height: `${dropIndicator.height}px`, backgroundColor: dropIndicator.type === 'success' ? colors.primary : colors.accent, opacity: 0.5 }}></div>
            )}
        </div>
    );
};


const GoogleStyleCalendar = ({ sites, setSites, onSiteClick, colors }) => {
    const [currentDate] = useState(new Date("2025-06-16T14:01:00"));
    const containerRef = useRef(null);
    const [dropIndicator, setDropIndicator] = useState(null);

    const getWeekDays = (baseDate) => {
        const start = new Date(baseDate);
        const dayOfWeek = baseDate.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        start.setDate(diff);
        return Array.from({ length: 5 }).map((_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
    };

    const weekDays = getWeekDays(currentDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);
    
    const handleDrop = (item, newDate, newStartTime) => {
        const duration = timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
        let newStartMinutes = timeToMinutes(newStartTime);
        const maxStartMinutes = (19 * 60) - duration;
        newStartMinutes = Math.min(newStartMinutes, maxStartMinutes);
        
        const finalStartTime = minutesToTime(newStartMinutes);
        const finalEndTime = minutesToTime(newStartMinutes + duration);
        
        setSites(currentSites =>
            currentSites.map(site => 
                site.id === item.id 
                ? { ...site, date: newDate.toISOString().split('T')[0], startTime: finalStartTime, endTime: finalEndTime } 
                : site
            )
        );
        setDropIndicator(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="flex border-b border-gray-200" style={{ paddingRight: '1px' }}>
                <div className="w-16 shrink-0 text-xs text-gray-500 text-center py-2 border-r">GMT+02</div>
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="flex-1 text-center py-2 border-r">
                        <p className="text-xs text-gray-500 uppercase">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                        <span className={`text-2xl font-light ${day.toDateString() === new Date().toDateString() ? `bg-[${colors.primary}] text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto` : ''}`}>{day.getDate()}</span>
                    </div>
                ))}
            </div>
            <div className="flex-grow flex relative" ref={containerRef} onMouseLeave={() => setDropIndicator(null)}>
                <div className="w-16">
                    {hours.map(hour => <div key={hour} className="h-[60px] relative text-right pr-2 border-r border-b border-gray-200"><span className="text-xs text-gray-500 relative -top-2">{`${hour}:00`}</span></div>)}
                </div>
                <div className="flex-1 grid grid-cols-5">
                    {weekDays.map((day, dayIndex) => (
                        <DayColumn key={day.toISOString()} day={day} dayIndex={dayIndex} onDrop={handleDrop} setDropIndicator={setDropIndicator} dropIndicator={dropIndicator} colors={colors}>
                             {hours.map(hour => <div key={hour} className="h-[60px] border-b border-gray-200"></div>)}
                             {sites.filter(site => new Date(site.date).toDateString() === day.toDateString()).map(site => 
                                <DraggableResizableEvent key={site.id} event={site} onEventClick={onSiteClick} onEventUpdate={(id, updates) => setSites(s => s.map(site => site.id === id ? {...site, ...updates} : site))} colors={colors} />
                            )}
                        </DayColumn>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- COMPOSANT DASHBOARD PRINCIPAL ---
const Dashboard = ({ colors, sites, setSites, onSiteClick, todos, setTodos, onAddSite }) => {
    const [newTodoText, setNewTodoText] = useState('');
    const toggleTodo = (id) => setTodos(currentTodos => currentTodos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo));
    const addTodo = () => {
        if (newTodoText.trim() === '') return;
        setTodos([...todos, { id: Date.now(), text: newTodoText, done: false }]);
        setNewTodoText('');
    };
    const getWeekDays = (baseDate) => {
        const start = new Date(baseDate);
        const dayOfWeek = baseDate.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        start.setDate(diff);
        return Array.from({ length: 5 }).map((_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
    };
    const weekDays = getWeekDays(new Date("2025-06-16T14:01:00"));
    const lastDayOfWeek = weekDays[4];
    
    const futureSites = sites.filter(site => new Date(site.date) > lastDayOfWeek);
    
    const StatusPill = ({ status }) => {
        const style = {
            'À venir': `bg-[${colors.accent}] bg-opacity-20 text-yellow-800`,
            'En cours': `bg-[${colors.success}] bg-opacity-20 text-green-800`,
            'Terminé': `bg-gray-200 text-gray-700`,
            'Problème': `bg-[${colors.danger}] bg-opacity-20 text-red-800`,
            'Annulé': `bg-red-100 text-red-700`,
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${style[status] || 'bg-gray-200 text-gray-700'}`}>{status}</span>;
    };

    return (
      <DndProvider backend={HTML5Backend}>
        <div>
            <div className="flex justify-between items-center mb-8">
                 <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins']">Dashboard</h1>
                 <button onClick={onAddSite} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                    <Plus size={20}/>
                    Nouveau chantier
                </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <h2 className="text-xl font-semibold text-[${colors.neutralDark}] mb-4">Planning de la semaine</h2>
                    <GoogleStyleCalendar sites={sites} setSites={setSites} onSiteClick={onSiteClick} colors={colors} />
                </div>
                <div className="xl:col-span-1 space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold text-[${colors.neutralDark}] mb-4">Ma to-do list</h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                             <ul className="space-y-4">
                                {todos.map(todo => (
                                    <li key={todo.id} className="flex items-center" onClick={() => toggleTodo(todo.id)}>
                                        <div className={`w-6 h-6 flex items-center justify-center rounded-md cursor-pointer border-2 ${todo.done ? `bg-[${colors.primary}] border-[${colors.primary}]` : `border-gray-300`}`}><CheckSquare size={16} className={`text-white ${todo.done ? 'opacity-100' : 'opacity-0'}`} /></div>
                                        <span className={`ml-3 text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <form onSubmit={(e) => { e.preventDefault(); addTodo(); }} className="flex items-center mt-4 border-t pt-4">
                                <input type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="Nouvelle tâche..." className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                                <button type="submit" className={`p-2 bg-[${colors.primary}] text-white rounded-r-md hover:bg-opacity-90 transition-colors`}><Plus size={22} /></button>
                            </form>
                        </div>
                    </div>
                     <div>
                        <h2 className="text-xl font-semibold text-[${colors.neutralDark}] mb-4">Chantiers à venir</h2>
                        <div className="bg-white p-4 rounded-xl shadow-sm max-h-60 overflow-y-auto">
                            {futureSites.length > 0 ? (
                                <ul className="space-y-3">
                                    {futureSites.map(site => (
                                        <li key={site.id} onClick={() => onSiteClick(site)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                            <div>
                                                <p className="font-semibold text-gray-800">{site.name}</p>
                                                <p className="text-sm text-gray-500">{site.client}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <p className="text-sm font-medium text-gray-600">{new Date(site.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</p>
                                                <StatusPill status={site.status} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-center text-gray-500 py-4">Aucun chantier programmé.</p>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </DndProvider>
    );
};

export default Dashboard;
