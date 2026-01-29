import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./EventBoard.css";
import { EventCard } from "./EventCard";
import { EventFilters, type FilterState } from "./EventFilters";

// visualizzare e gestire gli eventi pubblici
export function EventBoard() {
    // Liste degli eventi: tutti gli eventi e quelli filtrati
    const [events, setEvents] = useState<SocialEvent[]>([]);  // Tutti gli eventi approvati
    const [filteredEvents, setFilteredEvents] = useState<SocialEvent[]>([]);  // Eventi dopo applicazione filtri
    const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set());  // Set di ID degli eventi a cui l'utente ha aderito
    
    // Stati UI
    const [loading, setLoading] = useState(true);  // Indica se i dati sono ancora in caricamento
    const [error, setError] = useState("");  // Messaggio di errore

    // Carica gli eventi pubblici e quelli a cui l'utente ha aderito
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

    // Applica i filtri agli eventi
    const handleFilter = (filters: FilterState) => {
        let filtered = [...events];

        // Filtro di ricerca: titolo, descrizione, nome ristorante
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            filtered = filtered.filter(evt => 
                evt.title.toLowerCase().includes(search) ||
                (evt.description && evt.description.toLowerCase().includes(search)) ||
                evt.restaurant.name.toLowerCase().includes(search)
            );
        }

        // Filtro per categoria
        if (filters.category > 0) {
            filtered = filtered.filter(evt => evt.category.id === filters.category);
        }

        // Filtro per città
        if (filters.city > 0) {
            filtered = filtered.filter(evt => evt.restaurant.city?.id === filters.city);
        }

        // Filtro per data specifica
        if (filters.dateFrom) {
            const filterDateStr = filters.dateFrom; 
            filtered = filtered.filter(evt => {
                const evtDateStr = new Date(evt.eventDate).toISOString().split("T")[0];
                return evtDateStr === filterDateStr;
            });
        }

        setFilteredEvents(filtered);
    };

    // iscriversi a un evento
    const handleJoin = async (eventId: number) => {
        try {
            // Invia la richiesta di iscrizione al server
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/join`, {
                method: "POST",
                credentials: "include"
            });

            if (response.ok) {
                alert("Iscrizione avvenuta con successo! 🎉");
                setJoinedEventIds(prev => new Set(prev).add(eventId));
            } else {
                const errorMsg = await response.text();
                alert(errorMsg || "Errore durante l'iscrizione"); 
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione col server"); 
        }
    };

    if (loading) return <p className="loading-message">Caricamento in corso...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="event-board-container">
            {/* Header della bacheca */}
            <div className="event-board-header">
                <h2 className="event-board-title">Bacheca Eventi</h2>
            </div>

            {/* Componente filtri per ricerca e filtrazione degli eventi */}
            <EventFilters onFilter={handleFilter} />
            
            {/* Mostra messaggio vuoto o lista di eventi */}
            {filteredEvents.length === 0 ? (
                <div className="empty-message">
                    <p>Nessun evento trovato.</p>
                </div>
            ) : (
                // Griglia di carte degli eventi con pulsante di iscrizione
                <div className="event-list">
                    {filteredEvents.map(evt => (
                        <EventCard 
                            key={evt.id} 
                            event={evt} 
                            onJoin={handleJoin}  // Callback per iscriversi all'evento
                            isJoined={joinedEventIds.has(evt.id)}  // Indica se già iscritto
                        />
                    ))}
                </div>
            )}
        </div>
    );
}