import React, { useState, useRef } from 'react';
import { Plus, GripVertical, Info, Settings } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = { SITE_CARD: 'siteCard' };

// Composant de carte de chantier draggable et droppable
const DraggableSiteCard = ({ site, index, onSiteClick, colors, moveSite }) => {
    const ref = useRef(null);

    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.SITE_CARD,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;

            // Ne pas remplacer les éléments par eux-mêmes
            if (dragIndex === hoverIndex) return;

            // Déterminer le rectangle survolé
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Déterminer le milieu vertical
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Déterminer la position du pointeur
            const clientOffset = monitor.getClientOffset();

            // Obtenir les pixels du haut
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // Effectuer le déplacement uniquement lorsque le pointeur a dépassé la moitié de la hauteur de l'élément
            // Lors du glissement vers le bas, déplacez uniquement lorsque l'élément de glissement passe la moitié de la hauteur de l'élément survolé
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;

            // Lors du glissement vers le haut, déplacez uniquement lorsque l'élément de glissement passe la moitié de la hauteur de l'élément survolé
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            // Temps d'exécution de l'action
            moveSite(item.id, site.status_id, dragIndex, hoverIndex);

            // Remarque : l'index de l'élément de glissement est modifié ici pour éviter des calculs coûteux
            // dans la fonction hover suivante
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.SITE_CARD,
        item: () => ({ id: site.id, index, status_id: site.status_id }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return (
        <div
            ref={ref}
            style={{ opacity }}
            className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out"
            data-handler-id={handlerId}
        >
            <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-800 mb-2">{site.name}</p>
                <GripVertical className="text-gray-400" size={16} />
            </div>
            <p className="text-sm text-gray-500 mb-3">{site.client}</p>
            <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">{new Date(site.startDate).toLocaleDateString('fr-FR')}</p>
                <button
                    onClick={() => onSiteClick(site)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="Voir les informations du chantier"
                >
                    <Info size={16} />
                </button>
            </div>
        </div>
    );
};

// Colonne du Kanban pour un statut donné
const KanbanColumn = ({ status, sites, onSiteClick, colors, moveSite, onDropColumn }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.SITE_CARD,
        drop: (item, monitor) => {
            // Si l'élément est déposé dans une colonne vide ou à la fin
            if (sites.length === 0 || monitor.isOver({ shallow: true })) {
                onDropColumn(item.id, status.id);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const isActive = isOver && canDrop;
    let backgroundColor = 'bg-gray-50';
    if (isActive) {
        backgroundColor = 'bg-green-100'; // Couleur quand on survole la colonne
    } else if (canDrop) {
        backgroundColor = 'bg-gray-50';
    }

    return (
        <div
            ref={drop}
            className={`flex-shrink-0 w-80 ${backgroundColor} rounded-xl p-4 flex flex-col`}
        >
            <div className="flex items-center gap-3 mb-4 px-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }}></span>
                <h3 className="text-lg font-semibold text-gray-700">{status.name}</h3>
                <span className="text-base font-normal text-gray-400">{sites.length}</span>
            </div>
            <div className="flex-grow h-full overflow-y-auto pr-1">
                {sites.length > 0 ? (
                    sites.map((site, index) => (
                        <DraggableSiteCard
                            key={site.id}
                            site={site}
                            index={index}
                            onSiteClick={onSiteClick}
                            colors={colors}
                            moveSite={moveSite}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-400 p-4">
                        Déposez des chantiers ici
                    </div>
                )}
            </div>
        </div>
    );
};

// Page principale de la vue Kanban
const SitesKanbanPage = ({ sites, statusColumns, onUpdateSite, onSiteClick, onAddSite, onOpenStatusModal, colors, onUpdateSiteOrder, onUpdateSiteStatus }) => {
    const [localSites, setLocalSites] = useState(sites);

    // Synchroniser les sites locaux avec les props (quand les données changent depuis App.jsx)
    React.useEffect(() => {
        setLocalSites(sites);
    }, [sites]);

    const moveSite = (draggedId, newColumnId, dragIndex, hoverIndex) => {
        // Utiliser la nouvelle fonction dédiée au changement de statut
        const draggedSite = localSites.find(site => site.id === draggedId);
        if (!draggedSite) {
            console.error('❌ Site non trouvé pour le drag & drop:', draggedId);
            return;
        }

        if (draggedSite.status_id === newColumnId) {
            return; // Pas de changement de colonne, on ne fait rien
        }

        console.log('🎯 Drag & Drop - Changement de statut:', {
            siteId: draggedId,
            fromStatus: draggedSite.status_id,
            toStatus: newColumnId
        });

        // Utiliser la fonction dédiée qui gère tout (optimistic updates, rollback, etc.)
        if (onUpdateSiteStatus) {
            onUpdateSiteStatus(draggedId, newColumnId);
        } else {
            console.error('❌ onUpdateSiteStatus non disponible pour le drag & drop');
        }
    };

    const handleDropColumn = (siteId, newColumnId) => {
        // Utiliser la nouvelle fonction dédiée au changement de statut
        const draggedSite = localSites.find(site => site.id === siteId);
        if (!draggedSite) {
            console.error('❌ Site non trouvé pour le drop:', siteId);
            return;
        }

        if (draggedSite.status_id === newColumnId) {
            return; // Pas de changement de statut
        }

        console.log('📤 Drop - Changement de statut:', {
            siteId,
            fromStatus: draggedSite.status_id,
            toStatus: newColumnId
        });

        // Utiliser la fonction dédiée
        if (onUpdateSiteStatus) {
            onUpdateSiteStatus(siteId, newColumnId);
        } else {
            console.error('❌ onUpdateSiteStatus non disponible pour le drop');
        }
    };

    // Les changements sont maintenant gérés directement par handleUpdateSiteStatus
    // Cet effect était responsable des erreurs created_by, il est maintenant désactivé

    const sortedStatusColumns = [...statusColumns].sort((a, b) => a.position - b.position);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 font-['Poppins']">Vue Kanban</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onOpenStatusModal}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Settings size={20} />
                            Options
                        </button>
                        <button
                            onClick={onAddSite}
                            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <Plus size={20} />
                            Nouveau chantier
                        </button>
                    </div>
                </div>

                <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
                    {sortedStatusColumns.map(status => (
                        <KanbanColumn
                            key={status.id}
                            status={status}
                            sites={localSites.filter(site => site.status_id === status.id).sort((a, b) => a.position - b.position)}
                            onSiteClick={onSiteClick}
                            colors={colors}
                            moveSite={moveSite}
                            onDropColumn={handleDropColumn}
                        />
                    ))}
                </div>
            </div>
        </DndProvider>
    );
};

export default SitesKanbanPage;
