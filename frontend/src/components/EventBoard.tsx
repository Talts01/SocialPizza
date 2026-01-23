import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { SocialEvent } from "../types";
import "./EventBoard.css";
import { EventCard } from "./EventCard";
import { EventFilters, type FilterState } from "./EventFilters";

export function EventBoard() {
    const [events, setEvents] = useState<SocialEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<SocialEvent[]>([]);
    const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set());
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            const [publicRes, joinedRes] = await Promise.all([
                fetch("http://localhost:8081/api/events/public", { credentials: "include" }),
                fetch("http://localhost:8081/api/events/joined", { credentials: "include" })
            ]);

            if (publicRes.ok && joinedRes.ok) {
                const publicData = await publicRes.json();
                const joinedData: SocialEvent[] = await joinedRes.json();

                setEvents(publicData);
                setFilteredEvents(publicData);

                const ids = new Set(joinedData.map(e => e.id));
                setJoinedEventIds(ids);
            } else {
                setError("Errore nel caricamento dati");
            }
        } catch (err) {
            setError("Impossibile contattare il server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilter = (filters: FilterState) => {
        let filtered = [...events];

        // 1. Filtro Testo
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            filtered = filtered.filter(evt => 
                evt.title.toLowerCase().includes(search) ||
                (evt.description && evt.description.toLowerCase().includes(search)) ||
                evt.restaurant.name.toLowerCase().includes(search)
            );
        }

        // 2. Filtro Categoria
        if (filters.category > 0) {
            filtered = filtered.filter(evt => evt.category.id === filters.category);
        }

        // 3. Filtro Città
        if (filters.city > 0) {
            filtered = filtered.filter(evt => evt.restaurant.city?.id === filters.city);
        }

        // 4. Filtro Data (ESATTA)
        if (filters.dateFrom) {
            // Convertiamo la data del filtro in stringa YYYY-MM-DD
            const filterDateStr = filters.dateFrom; 

            filtered = filtered.filter(evt => {
                // Prendiamo la data dell'evento e teniamo solo la parte YYYY-MM-DD
                const evtDateStr = new Date(evt.eventDate).toISOString().split("T")[0];
                
                // Confronto ESATTO: Mostra solo se i giorni coincidono
                return evtDateStr === filterDateStr;
            });
        }

        setFilteredEvents(filtered);
    };

    const handleJoin = async (eventId: number) => {
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/join`, {
                method: "POST",
                credentials: "include"
            });

            if (response.ok) {
                toast.success("Iscrizione avvenuta con successo! 🎉");
                setJoinedEventIds(prev => new Set(prev).add(eventId));
            } else {
                const errorMsg = await response.text();
                toast.error(errorMsg || "Errore durante l'iscrizione");
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione col server");
        }
    };

    if (loading) return <p className="loading-message">Caricamento in corso...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="event-board-container">
            <div className="event-board-header">
                <h2 className="event-board-title">Bacheca Eventi</h2>
                {/* Rimosso pulsante Organizza Pizzata */}
            </div>

            <EventFilters onFilter={handleFilter} />
            
            {filteredEvents.length === 0 ? (
                <div className="empty-message">
                    <p>Nessun evento trovato.</p>
                </div>
            ) : (
                <div className="event-list">
                    {filteredEvents.map(evt => (
                        <EventCard 
                            key={evt.id} 
                            event={evt} 
                            onJoin={handleJoin} 
                            // Rimosso onDelete che non serviva
                            isJoined={joinedEventIds.has(evt.id)}
                        />
                    ))}
                </div>
            )}
            
            {/* Rimosso CreateEventForm */}
        </div>
    );
}