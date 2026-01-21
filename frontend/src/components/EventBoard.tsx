import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { SocialEvent } from "../types";
import { CreateEventForm } from "./CreateEventForm";
import "./EventBoard.css";
import { EventCard } from "./EventCard";
import { EventFilters, type FilterState } from "./EventFilters";

export function EventBoard() {
    const [events, setEvents] = useState<SocialEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<SocialEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:8081/api/events/public", {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                setEvents(data);
                setFilteredEvents(data);
            } else {
                setError("Errore nel caricamento eventi");
            }
        } catch (err) {
            setError("Impossibile contattare il server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleFilter = (filters: FilterState) => {
        let filtered = [...events];

        // Filtro per testo (cerca in titolo, descrizione, nome ristorante)
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

        // Filtro per data da
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(evt => new Date(evt.eventDate) >= fromDate);
        }

        // Filtro per data a
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59); // Fine giornata
            filtered = filtered.filter(evt => new Date(evt.eventDate) <= toDate);
        }

        setFilteredEvents(filtered);
    };

    const handleJoin = async (eventId: number) => {
        console.log("🔘 Click partecipa su evento ID:", eventId);
        
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/join`, {
                method: "POST",
                credentials: "include"
            });

            console.log("📡 Risposta server:", response.status, response.statusText);

            if (response.ok) {
                toast.success("Iscrizione avvenuta con successo! 🎉");
                fetchEvents();
            } else {
                const errorMsg = await response.text();
                console.error("❌ Errore:", errorMsg);
                toast.error(errorMsg || "Errore durante l'iscrizione");
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione col server");
        }
    };
    const handleDelete = async (eventId: number) => {
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}`, {
                method: "DELETE",
                credentials: "include"
            });

            console.log("🗑️ DELETE /api/events/" + eventId, response.status, response.statusText);
            if (response.ok) {
                toast.success("Evento eliminato con successo!");
                // Aggiornamento ottimistico della UI
                setEvents(prev => prev.filter(e => e.id !== eventId));
                setFilteredEvents(prev => prev.filter(e => e.id !== eventId));
            } else {
                const errorMsg = await response.text();
                console.error("❌ Delete failed:", response.status, errorMsg);
                toast.error(errorMsg || "Errore durante l'eliminazione");
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione col server");
        }
    };
    const handleCreateEvent = async (title: string, description: string, date: string, seats: number, restaurantId: number, categoryId: number) => {
        setShowCreateForm(false);
        
        try {
            const newEventPayload = {
                title: title,
                description: description,
                eventDate: date,
                maxParticipants: seats,
                status: "PENDING",
                category: { id: categoryId }
            };

            const response = await fetch(`http://localhost:8081/api/events/create?restaurantId=${restaurantId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEventPayload),
                credentials: "include"
            });

            if (response.ok) {
                const createdEvent = await response.json();

                if (createdEvent.status === "APPROVED") {
                    toast.success("Evento creato e pubblicato con successo! 🍕");
                } else {
                    toast.success("Evento creato! È in attesa di approvazione ⏳");
                }

                fetchEvents();
            } else {
                const errMsg = await response.text();
                toast.error("Errore creazione: " + errMsg);
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione");
        }
    };

    // Rendering con classi CSS invece di style inline
    if (loading) return <p className="loading-message">Caricamento in corso...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="event-board-container">
            <div className="event-board-header">
                <h2 className="event-board-title">Bacheca Eventi</h2>
                <button 
                    className="organize-btn"
                    onClick={() => setShowCreateForm(true)}
                >
                    + Organizza Pizzata
                </button>
            </div>

            <EventFilters onFilter={handleFilter} />
            
            {filteredEvents.length === 0 ? (
                <div className="empty-message">
                    <p>Nessun evento trovato.</p>
                    <p>{events.length === 0 ? "Sii il primo a proporne uno!" : "Prova a modificare i filtri."}</p>
                </div>
            ) : (
                <div className="event-list">
                    {filteredEvents.map(evt => (
                        <EventCard key={evt.id} event={evt} onJoin={handleJoin} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {showCreateForm && (
                <CreateEventForm 
                    onConfirm={handleCreateEvent} 
                    onCancel={() => setShowCreateForm(false)} 
                />
            )}
        </div>
    );
}