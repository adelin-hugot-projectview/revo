import React, { useState, useMemo, useRef } from 'react';
import { CheckSquare, Plus, ChevronLeft, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';


import CalendarSiteCard from '../components/details/CalendarSiteCard.jsx';

// --- DÉFINITIONS POUR LE CALENDRIER ---
const ItemTypes = { EVENT: 'event' };
const timeToMinutes = (time) => { if (!time) return 0; const [hours, minutes] = time.split(':').map(Number); return hours * 60 + minutes; };
const minutesToTime = (minutes) => { const totalMinutes = Math.max(0, minutes); const roundedMinutes = Math.round(totalMinutes / 15) * 15; const h = Math.floor(roundedMinutes / 60); const m = roundedMinutes % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
const toYYYYMMDD = (date) => { const d = new Date(date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };

// --- FONCTION POUR CALCULER LE LAYOUT DES ÉVÉNEMENTS (GESTION DES CHEVAUCHEMENTS) ---
const calculateEventLayout = (events) => {
    // Trier les événements par heure de début
    events.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    const columns = []; // Représente les colonnes visuelles

    events.forEach(event => {
        const eventStart = timeToMinutes(event.startTime);
        const eventEnd = timeToMinutes(event.endTime);

        let placed = false;
        // Essayer de placer l'événement dans une colonne existante
        for (let i = 0; i < columns.length; i++) {
            let canPlaceInColumn = true;
            for (const existingEvent of columns[i]) {
                const existingStart = timeToMinutes(existingEvent.startTime);
                const existingEnd = timeToMinutes(existingEvent.endTime);

                // Vérifier le chevauchement
                if (!(eventEnd <= existingStart || eventStart >= existingEnd)) {
                    canPlaceInColumn = false;
                    break;
                }
            }
            if (canPlaceInColumn) {
                columns[i].push(event);
                event.column = i; // Stocker la colonne attribuée
                placed = true;
                break;
            }
        }

        // Si l'événement ne peut être placé dans aucune colonne existante, créer une nouvelle colonne
        if (!placed) {
            columns.push([event]);
            event.column = columns.length - 1;
        }
    });

    // Calculer la largeur et la position de chaque événement
    events.forEach(event => {
        const totalColumns = columns.length;
        event.width = 100 / totalColumns; // Largeur en pourcentage
        event.left = event.column * event.width; // Position en pourcentage
    });

    return events;
};

// --- COMPOSANT CALENDRIER INTERACTIF ---
const DraggableResizableEvent = ({ event, onEventClick, onEventUpdate, colors, currentDay }) => {
    const [{ isDragging }, drag] = useDrag(() => ({ 
        type: ItemTypes.EVENT, 
        item: () => ({ id: event.id, startTime: event.startTime, endTime: event.endTime, startDate: event.startDate, endDate: event.endDate, status: event.status }), 
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }), 
    }));

    // Calculer les heures de début et de fin réelles pour le jour courant
    const eventStartDateTime = new Date(`${event.startDate}T${event.startTime}`);
    const eventEndDateTime = new Date(`${event.endDate}T${event.endTime}`);
    const currentDayStart = new Date(currentDay);
    currentDayStart.setHours(0, 0, 0, 0);
    const currentDayEnd = new Date(currentDay);
    currentDayEnd.setHours(23, 59, 59, 999);

    // Déterminer le début et la fin de l'événement sur ce jour spécifique
    const displayStart = Math.max(eventStartDateTime.getTime(), currentDayStart.getTime());
    const displayEnd = Math.min(eventEndDateTime.getTime(), currentDayEnd.getTime(), new Date(currentDay).setHours(19, 0, 0, 0));

    // Convertir en minutes depuis 8h00 (début de la journée affichée)
    const startMinutesOfDay = 8 * 60;
    const top = (new Date(displayStart).getHours() * 60 + new Date(displayStart).getMinutes()) - startMinutesOfDay;
    const height = (new Date(displayEnd).getHours() * 60 + new Date(displayEnd).getMinutes()) - (new Date(displayStart).getHours() * 60 + new Date(displayStart).getMinutes());

    const calculatedLeft = event.left !== undefined ? `${event.left}%` : '2.5%';
    const calculatedWidth = event.width !== undefined ? `${event.width - 5}%` : '95%'; // -5% pour la marge
    
    console.log(`--- Event: ${event.name} on Day: ${currentDay.toISOString().split('T')[0]} ---`);
    console.log(`  Event Start Date/Time: ${event.startDate} ${event.startTime}`);
    console.log(`  Event End Date/Time: ${event.endDate} ${event.endTime}`);
    console.log(`  eventStartDateTime: ${eventStartDateTime}`);
    console.log(`  eventEndDateTime: ${eventEndDateTime}`);
    console.log(`  currentDayStart: ${currentDayStart}`);
    console.log(`  currentDayEnd: ${currentDayEnd}`);
    console.log(`  displayStart (timestamp): ${displayStart} (${new Date(displayStart)})`);
    console.log(`  displayEnd (timestamp): ${displayEnd} (${new Date(displayEnd)})`);
    console.log(`  Calculated Top: ${top}px`);
    console.log(`  Calculated Height: ${height}px`);
    console.log(`  Should render (height > 0): ${height > 0}`);

    // Ne pas rendre si l'événement n'est pas visible sur ce jour
    if (height <= 0) return null;

    const handleResizeStop = (e, direction, ref, d) => {
        const newHeightMinutes = d.height;
        let newEndMinutes = (new Date(displayStart).getHours() * 60 + new Date(displayStart).getMinutes()) + newHeightMinutes;
        // Limiter l'heure de fin à 19h00 (19 * 60 = 1140 minutes)
        newEndMinutes = Math.min(newEndMinutes, 19 * 60);
        const newEndTime = minutesToTime(newEndMinutes);
        onEventUpdate(event.id, { end_time: newEndTime });
    };

    return (
        <div ref={drag} className="absolute z-10" style={{ top: `${top}px`, height: `${height}px`, left: calculatedLeft, width: calculatedWidth, opacity: isDragging ? 0.4 : 1 }}>
            <ResizableBox height={height} width="100%" onResizeStop={handleResizeStop} minConstraints={[Infinity, 30]} resizeHandles={['s']} handle={<div onMouseDown={(e) => e.stopPropagation()} className="absolute bottom-0 left-0 w-full h-4 flex justify-center items-end cursor-s-resize"><div className="w-4 h-1 bg-white/50 rounded-full"></div></div>} >
                <CalendarSiteCard site={event} onSiteClick={onEventClick} colors={colors} />
            </ResizableBox>
        </div>
    );
};

const DayColumn = ({ day, dayIndex, children, onDrop, setDropIndicator, dropIndicator, colors }) => {
    const dayRef = useRef(null);
    const [{ isOver }, drop] = useDrop(() => ({ accept: ItemTypes.EVENT, hover(item, monitor) { if (!dayRef.current) return; const dropY = monitor.getClientOffset().y - dayRef.current.getBoundingClientRect().top; const top = Math.round(dropY / 15) * 15; const height = timeToMinutes(item.endTime) - timeToMinutes(item.startTime); setDropIndicator({ dayIndex, top, height, status: item.status }); }, drop: (item, monitor) => { const dropY = monitor.getClientOffset().y - dayRef.current.getBoundingClientRect().top; const newStartMinutes = (8 * 60) + dropY; onDrop(item, day, minutesToTime(newStartMinutes)); }, collect: monitor => ({ isOver: !!monitor.isOver() }), }));
    
    // --- MODIFICATION ICI ---
    // La couleur de l'indicateur de drop utilise aussi la couleur de la BDD.
    const indicatorColor = isOver && dropIndicator ? (dropIndicator.status?.color || '#374151') : 'transparent';
    
    return ( <div ref={drop(dayRef)} className="relative h-full border-r border-gray-200"> {children} {isOver && dropIndicator && dropIndicator.dayIndex === dayIndex && ( <div className="absolute w-[95%] left-[2.5%] rounded-lg z-0 pointer-events-none" style={{ top: `${dropIndicator.top}px`, height: `${dropIndicator.height}px`, backgroundColor: indicatorColor, opacity: 0.5 }}></div> )} </div> );
};

const PlanningCalendar = ({ sites, onSiteClick, colors, onUpdateSite, currentCalendarDate, setCurrentCalendarDate }) => {
    console.log("PlanningCalendar - Sites reçus:", sites);
    const containerRef = useRef(null); const [dropIndicator, setDropIndicator] = useState(null);
    const getWeekDays = (baseDate) => {
        const start = new Date(baseDate);
        if (isNaN(start.getTime())) {
            console.error("getWeekDays received an invalid baseDate:", baseDate);
            return []; // Retourne un tableau vide pour éviter les erreurs si la date est invalide
        }
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi comme premier jour
        start.setDate(diff);
        return Array.from({ length: 5 }).map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    };
    const weekDays = getWeekDays(currentCalendarDate); const hours = Array.from({ length: 11 }, (_, i) => i + 8);
    const changeWeek = (direction) => {
        setCurrentCalendarDate(prevDate => {
            if (!(prevDate instanceof Date) || isNaN(prevDate.getTime())) {
                console.error("Invalid prevDate in changeWeek:", prevDate);
                // Fallback to a valid date (today) to recover from invalid state
                return new Date(new Date().setDate(new Date().getDate() + (direction * 7)));
            }
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + (direction * 7));
            return newDate;
        });
    };
    const handleDrop = (item, newDate, newStartTime) => {
        const oldStartDate = new Date(item.startDate);
        const oldEndDate = new Date(item.endDate);
        const oldStartTimeMinutes = timeToMinutes(item.startTime);
        const oldEndTimeMinutes = timeToMinutes(item.endTime);

        // Calculer la durée totale du chantier en jours
        const durationDays = (oldEndDate.getTime() - oldStartDate.getTime()) / (1000 * 60 * 60 * 24);

        // Calculer la nouvelle date de début
        const newStartDate = new Date(newDate);
        newStartDate.setHours(0, 0, 0, 0);

        // Calculer la nouvelle date de fin en fonction de la durée
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + durationDays);

        // Les heures de début et de fin restent les mêmes que l'original
        const finalStartTime = newStartTime; // L'heure de début est celle où l'on a dropé
        const finalEndTime = minutesToTime(oldEndTimeMinutes - oldStartTimeMinutes + timeToMinutes(finalStartTime));

        onUpdateSite(item.id, {
            start_date: toYYYYMMDD(newStartDate),
            end_date: toYYYYMMDD(newEndDate),
            start_time: finalStartTime,
            end_time: finalEndTime
        });
        setDropIndicator(null);
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Planning de la semaine</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeWeek(-1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft size={16} /></button>
                    <button onClick={() => setCurrentCalendarDate(new Date())} className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Aujourd'hui</button>
                    <button onClick={() => changeWeek(1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight size={16} /></button>
                </div>
            </div>
            <div className="flex border-b border-gray-200" style={{ paddingRight: '1px' }}>
                <div className="w-16 shrink-0"></div>
                {weekDays.map(day => ( <div key={day.toISOString()} className="flex-1 text-center py-2 border-l"> <p className="text-xs text-gray-500 uppercase">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</p> <span className={`text-2xl font-light ${day.toDateString() === new Date().toDateString() ? `bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto` : ''}`}>{day.getDate()}</span> </div> ))}
            </div>
            <div className="flex-grow flex relative h-[660px] overflow-y-auto" ref={containerRef} onMouseLeave={() => setDropIndicator(null)}>
                <div className="w-16"> {hours.map(hour => <div key={hour} className="h-[60px] relative text-right pr-2 border-r border-b border-gray-200"><span className="text-xs text-gray-500 relative -top-2">{`${hour}:00`}</span></div>)} </div>
                <div className="flex-1 grid grid-cols-5"> {weekDays.map((day, dayIndex) => {
                    const sitesForDay = sites.filter(site => {
                        const siteStart = new Date(site.startDate);
                        const siteEnd = new Date(site.endDate);
                        const currentDay = new Date(day);
                        siteStart.setHours(0, 0, 0, 0);
                        siteEnd.setHours(0, 0, 0, 0);
                        currentDay.setHours(0, 0, 0, 0);
                        const isSiteActiveOnDay = currentDay >= siteStart && currentDay <= siteEnd;
                        return isSiteActiveOnDay;
                    });
                    const positionedSites = calculateEventLayout(sitesForDay);
                    return ( 
                        <DayColumn key={day.toISOString()} day={day} dayIndex={dayIndex} onDrop={handleDrop} setDropIndicator={setDropIndicator} dropIndicator={dropIndicator} colors={colors}> 
                            {hours.map(hour => <div key={hour} className="h-[60px] border-b border-gray-200"></div>)}
                            {positionedSites.map(site => <DraggableResizableEvent key={site.id} event={site} onEventClick={onSiteClick} onEventUpdate={onUpdateSite} colors={colors} currentDay={day} /> )}
                        </DayColumn> 
                    );
                })} </div>
            </div>
        </div>
    );
};

// --- COMPOSANT WIDGET "TO-DO LIST" ---
const TodoListWidget = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, newTodoText, setNewTodoText, colors, visibleSiteIds }) => {
    const filteredTodos = useMemo(() => {
        console.log('Todos bruts dans TodoListWidget:', todos);
        console.log('visibleSiteIds dans TodoListWidget:', visibleSiteIds);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const filtered = todos.filter(todo => {
            const isNotDoneOrRecent = !todo.done || (todo.completed_at && new Date(todo.completed_at) > threeDaysAgo);
            const isRelatedToVisibleSite = todo.site_id === null || (visibleSiteIds && visibleSiteIds.includes(todo.site_id));
            
            console.log(`Todo: ${todo.text}, done: ${todo.done}, completed_at: ${todo.completed_at}, site_id: ${todo.site_id}, isNotDoneOrRecent: ${isNotDoneOrRecent}, isRelatedToVisibleSite: ${isRelatedToVisibleSite}`);
            return isNotDoneOrRecent && isRelatedToVisibleSite;
        });
        console.log('Todos filtrés:', filtered);
        return filtered;
    }, [todos, visibleSiteIds]);
    const handleFormSubmit = (e) => { e.preventDefault(); if (newTodoText.trim() === '') return; onAddTodo(newTodoText); setNewTodoText(''); };
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ma to-do list</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {filteredTodos.map(todo => (
                        <li key={todo.id} className="flex items-center justify-between group">
                            <div onClick={() => onToggleTodo(todo.id, todo.done)} className="flex items-center cursor-pointer flex-grow">
                                <div className={`w-6 h-6 flex items-center justify-center rounded-md border-2 transition-colors flex-shrink-0 ${todo.done ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-green-400'}`}><CheckSquare size={16} className={`text-white transition-opacity ${todo.done ? 'opacity-100' : 'opacity-0'}`} /></div>
                                <span className={`ml-3 text-sm transition-colors ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.text}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteTodo(todo.id); }} className="ml-2 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-100" aria-label="Supprimer la tâche"><Trash2 size={16} /></button>
                        </li>
                    ))}
                </ul>
                <form onSubmit={handleFormSubmit} className="flex items-center mt-4 border-t pt-4">
                    <input type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="Nouvelle tâche..." className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1" style={{'--tw-ring-color': '#22C55E'}} autoComplete="off" name="newTodoInput"/>
                    <button type="submit" className="p-2 text-white rounded-r-md" style={{backgroundColor: '#22C55E'}}><Plus size={22} /></button>
                </form>
            </div>
        </div>
    );
};

import StatusPill from '../components/details/StatusPill.jsx';
// --- COMPOSANT WIDGET "CHANTIERS À VENIR" ---
const UpcomingSitesWidget = ({ sites, onSiteClick, colors }) => {
    const getEndOfThisWeek = () => { const today = new Date(); const endOfWeek = new Date(today); const dayOfWeek = today.getDay(); const diff = 7 - (dayOfWeek === 0 ? 7 : dayOfWeek); endOfWeek.setDate(today.getDate() + diff); endOfWeek.setHours(23, 59, 59, 999); return endOfWeek; };
    const futureSites = sites.filter(site => new Date(site.startDate) > getEndOfThisWeek());
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Chantiers à venir</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm max-h-96 overflow-y-auto">
                {futureSites.length > 0 ? (
                    <ul className="space-y-3">
                        {futureSites.map(site => (
                            <li key={site.id}>
                                <CalendarSiteCard site={site} onSiteClick={onSiteClick} colors={colors} />
                            </li>
                        ))}
                    </ul>
                ) : ( 
                    <p className="text-center text-gray-500 py-4">Aucun chantier programmé.</p>
                )}
            </div>
        </div>
    );
};


// --- COMPOSANT DASHBOARD PRINCIPAL ---
const Dashboard = ({ colors, sites, onSiteClick, todos, onAddTodo, onToggleTodo, onDeleteTodo, onAddSite, onUpdateSite, newTodoText, setNewTodoText }) => {
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

    const getWeekDays = (baseDate) => { 
        const start = new Date(baseDate);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi comme premier jour
        start.setDate(diff);
        return Array.from({ length: 5 }).map((_, i) => { // 5 jours ouvrés
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    };

    const weekDays = getWeekDays(currentCalendarDate);
    const visibleSiteIds = useMemo(() => {
        const visibleDates = weekDays.map(day => day.toDateString());
        return sites.filter(site => visibleDates.includes(new Date(site.startDate).toDateString())).map(site => site.id);
    }, [sites, weekDays]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <div className="flex justify-between items-center mb-8">
                     <h1 className="text-3xl font-bold" style={{color: '#374151', fontFamily: "'Poppins', sans-serif"}}>Dashboard</h1>
                     <button onClick={onAddSite} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: '#22C55E'}}>
                        <Plus size={20}/>
                        Nouveau chantier
                    </button>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                         <PlanningCalendar sites={sites} onSiteClick={onSiteClick} colors={colors} onUpdateSite={onUpdateSite} currentCalendarDate={currentCalendarDate} setCurrentCalendarDate={setCurrentCalendarDate} />
                    </div>
                    <div className="xl:col-span-1 space-y-8">
                        <TodoListWidget todos={todos} onAddTodo={onAddTodo} onToggleTodo={onToggleTodo} onDeleteTodo={onDeleteTodo} newTodoText={newTodoText} setNewTodoText={setNewTodoText} colors={colors} visibleSiteIds={visibleSiteIds} />
                        <UpcomingSitesWidget sites={sites} onSiteClick={onSiteClick} colors={colors} />
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default Dashboard;
