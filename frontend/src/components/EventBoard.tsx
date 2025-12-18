import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import { EventCard } from "./EventCard";
import { CreateEventForm } from "./CreateEventForm";
import "./EventBoard.css"; // <--- IMPORTA IL CSS QUI

export function EventBoard() {
    const [events, setEvents] = useState<SocialEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:8081/api/events/approved", {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                setEvents(data);
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

    const handleJoin = async (eventId: number) => {
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/join`, {
                method: "POST",
                credentials: "include"
            });

            if (response.ok) {
                alert("Iscrizione avvenuta con successo! 🎉");
                fetchEvents();
            } else {
                const errorMsg = await response.text();
                try {
                    const jsonErr = JSON.parse(errorMsg);
                    alert("Attenzione: " + (jsonErr.message || "Errore sconosciuto"));
                } catch {
                    alert("Attenzione: " + errorMsg);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione col server");
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
                    alert("Evento creato e pubblicato con successo! 🍕");
                    fetchEvents(); 
                } else {
                    alert("Evento creato! È in attesa di approvazione da parte del ristoratore. ⏳");
                }
            } else {
                const errMsg = await response.text();
                alert("Errore creazione: " + errMsg);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione");
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
            
            {events.length === 0 ? (
                <div className="empty-message">
                    <p>Nessun evento in programma al momento.</p>
                    <p>Sii il primo a proporne uno!</p>
                </div>
            ) : (
                <div className="event-list">
                    {events.map(evt => (
                        <EventCard key={evt.id} event={evt} onJoin={handleJoin} />
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