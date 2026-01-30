import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./MyJoinedEvents.css";

// Componente per visualizzare gli eventi a cui l'utente ha aderito
export function MyJoinedEvents() {
    // Stato per memorizzare la lista degli eventi uniti
    const [events, setEvents] = useState<SocialEvent[]>([]);


    const fetchJoined = async () => {
        try {
            const res = await fetch("http://localhost:8081/api/events/joined", { credentials: "include" });
            if (res.ok) setEvents(await res.json());
        } catch (err) {
            console.error("Errore caricamento iscrizioni", err);
        }
    };

    // Effetto per caricare gli eventi al montaggio del componente
    useEffect(() => { fetchJoined(); }, []);

    // Funzione per gestire l'abbandono di un evento
    const handleLeave = async (id: number) => {
        if (!window.confirm("Vuoi davvero annullare la tua partecipazione a questo evento?")) return;
        
        const res = await fetch(`http://localhost:8081/api/events/${id}/leave`, { 
            method: "DELETE", 
            credentials: "include" 
        });
        if (res.ok) fetchJoined();
    };

    
    return (
        <div className="dashboard-container">
            <h2>🎟 Eventi a cui Partecipo</h2>
            <p className="subtitle">Qui trovi gli eventi a cui ti sei iscritto e il loro stato.</p>

            {/* Messaggio se non ci sono eventi */}
            {events.length === 0 ? (
                <p className="empty-msg">Non sei iscritto a nessun evento al momento.</p>
            ) : (
                <div className="requests-list">
                    {/* Mappa ogni evento in una card */}
                    {events.map(evt => (
                        <div key={evt.id} className="request-card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{evt.title}</h3>
                                    <p className="card-info">
                                        📅 {new Date(evt.eventDate).toLocaleDateString('it-IT')} | 📍 {evt.restaurant.name}
                                    </p>
                                </div>
                                {/* Badge di stato dell'evento */}
                                <span className={`status-badge status-${evt.status}`}>
                                    {evt.status === "PENDING" ? "In Attesa ⏳" : 
                                     evt.status === "APPROVED" ? "Accettata ✅" : "Rifiutata ❌"}
                                </span>
                            </div>
                            <div className="card-actions">
                                {/* Pulsante per abbandonare l'evento, solo se approvato */}
                                {evt.status === "APPROVED" && (
                                    <button className="action-btn leave" onClick={() => handleLeave(evt.id)}>
                                        Annulla Partecipazione
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}