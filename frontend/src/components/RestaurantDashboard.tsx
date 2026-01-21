import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { SocialEvent } from "../types";
import "./RestaurantDashboard.css";

export function RestaurantDashboard() {
    const [pendingEvents, setPendingEvents] = useState<SocialEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingEvents = async () => {
        try {
            const response = await fetch("http://localhost:8081/api/events/pending/for-restaurateur", {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                setPendingEvents(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const handleDecision = async (eventId: number, decision: "APPROVED" | "REJECTED") => {
        const comment = prompt(`Commento per ${decision === "APPROVED" ? "approvazione" : "rifiuto"}:`);
        
        try {
            const response = await fetch(
                `http://localhost:8081/api/events/${eventId}/moderator/decision?decision=${decision}&comment=${encodeURIComponent(comment || "")}`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            );

            if (response.ok) {
                toast.success(`Evento ${decision === "APPROVED" ? "approvato" : "rifiutato"}!`);
                fetchPendingEvents();
            } else {
                const errMsg = await response.text();
                toast.error("Errore: " + errMsg);
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione");
        }
    };

    if (loading) return <p>Caricamento...</p>;

    return (
        <div className="restaurant-dashboard">
            <h2>🍕 Dashboard Ristoratore</h2>
            <h3>Richieste in Sospeso ({pendingEvents.length})</h3>

            {pendingEvents.length === 0 ? (
                <p className="empty-message">Nessuna richiesta in sospeso.</p>
            ) : (
                <div className="pending-list">
                    {pendingEvents.map(evt => (
                        <div key={evt.id} className="pending-card">
                            <div className="event-info">
                                <h4>{evt.title}</h4>
                                <p><strong>Tema:</strong> {evt.category.name}</p>
                                <p><strong>Organizzatore:</strong> {evt.organizer.name}</p>
                                <p><strong>Data:</strong> {new Date(evt.eventDate).toLocaleDateString('it-IT')}</p>
                                <p><strong>Posti:</strong> {evt.maxParticipants}</p>
                                {evt.description && <p className="description">"{evt.description}"</p>}
                            </div>
                            <div className="actions">
                                <button 
                                    className="approve-btn"
                                    onClick={() => handleDecision(evt.id, "APPROVED")}
                                >
                                    ✓ Approva
                                </button>
                                <button 
                                    className="reject-btn"
                                    onClick={() => handleDecision(evt.id, "REJECTED")}
                                >
                                    ✗ Rifiuta
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
