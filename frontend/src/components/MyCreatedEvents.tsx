import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./MyCreatedEvents.css";

// Componente per visualizzare gli eventi creati dall'utente
export function MyCreatedEvents() {
    // Stato per memorizzare la lista degli eventi creati
    const [events, setEvents] = useState<SocialEvent[]>([]);

    // Funzione per recuperare gli eventi creati dall'API
    const fetchCreated = async () => {
        try {
            const res = await fetch("http://localhost:8081/api/events/created", { credentials: "include" });
            if (res.ok) setEvents(await res.json());
        } catch (err) {
            console.error("Errore caricamento eventi creati", err);
        }
    };

    
    useEffect(() => { fetchCreated(); }, []);

    // Funzione per gestire il ritiro di una proposta di evento
    const handleWithdraw = async (id: number) => {
        if (!window.confirm("Vuoi ritirare la proposta di questo evento?")) return;
        
        const res = await fetch(`http://localhost:8081/api/events/${id}/withdraw`, { 
            method: "DELETE", 
            credentials: "include" 
        });
        if (res.ok) fetchCreated();
    };


    return (
        <div className="dashboard-container">
            <h2> 📋 Le Mie Proposte</h2>
            <p className="subtitle">Gestisci gli eventi che hai organizzato presso le pizzerie.</p>

            {/* Messaggio se non ci sono eventi */}
            {events.length === 0 ? (
                <p className="empty-msg">Non hai ancora organizzato alcun evento.</p>
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
                                     evt.status === "APPROVED" ? "Approvato ✅" : "Rifiutato ❌"}
                                </span>
                            </div>

                            {/* Mostrato se l'evento è RIFIUTATO */}
                            {evt.status === "REJECTED" && (
                                <div className="rejection-box">
                                    <span className="rejection-title">Motivazione del Ristoratore:</span>
                                    <p className="rejection-text">
                                        "{evt.rejectionReason || "Nessuna motivazione specificata."}"
                                    </p>
                                </div>
                            )}

                            {/* Mostrato se l'evento è APPROVATO e c'è un commento */}
                            {evt.status === "APPROVED" && evt.moderatorComment && (
                                <div className="approval-box">
                                    <span className="approval-title">Messaggio dal Ristoratore:</span>
                                    <p className="approval-text">
                                        "{evt.moderatorComment}"
                                    </p>
                                </div>
                            )}
                            <div className="card-actions">
                                {/* Pulsante per ritirare la proposta, solo se in attesa */}
                                {evt.status === "PENDING" && (
                                    <button className="action-btn withdraw" onClick={() => handleWithdraw(evt.id)}>
                                        Ritira Proposta
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