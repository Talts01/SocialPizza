import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { SocialEvent } from "../types";
import "./RestaurantDashboard.css"; // Usa il tuo CSS originale che ti piace

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
        let comment = "";

        // LOGICA MIGLIORATA:
        // Se RIFIUTA -> Motivazione obbligatoria
        if (decision === "REJECTED") {
            const input = window.prompt("Inserisci la motivazione del rifiuto (visibile all'utente):");
            if (input === null) return; // Se preme Annulla, fermiamo tutto
            if (input.trim() === "") {
                toast.error("Devi inserire una motivazione per rifiutare!");
                return;
            }
            comment = input;
        } 
        // Se APPROVA -> Motivazione opzionale (puoi lasciare vuoto)
        else {
            const input = window.prompt("Vuoi lasciare un messaggio? (Opzionale, premi OK per saltare)");
            if (input) comment = input;
        }

        try {
            // Costruiamo l'URL corretto passando il commento
            const response = await fetch(
                `http://localhost:8081/api/events/${eventId}/moderator/decision?decision=${decision}&comment=${encodeURIComponent(comment)}`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            );

            if (response.ok) {
                toast.success(`Evento ${decision === "APPROVED" ? "approvato" : "rifiutato"}!`);
                // Rimuoviamo l'evento dalla lista senza ricaricare tutto
                setPendingEvents(prev => prev.filter(e => e.id !== eventId));
            } else {
                const errMsg = await response.text();
                toast.error("Errore: " + errMsg);
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione");
        }
    };

    if (loading) return <p style={{textAlign: "center", marginTop: "20px"}}>Caricamento...</p>;

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
                            {/* MANTENUTA LA TUA STRUTTURA PER IL CSS */}
                            <div className="event-info">
                                <h4>{evt.title}</h4>
                                <p><strong>Tema:</strong> {evt.category.name}</p>
                                <p><strong>Organizzatore:</strong> {evt.organizer.name}</p>
                                <p><strong>Data:</strong> {new Date(evt.eventDate).toLocaleDateString('it-IT')} alle {new Date(evt.eventDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                                <p><strong>Posti:</strong> {evt.maxParticipants}</p>
                                
                                {evt.description && (
                                    <p className="description">"{evt.description}"</p>
                                )}
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