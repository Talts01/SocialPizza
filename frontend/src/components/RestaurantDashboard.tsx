import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./RestaurantDashboard.css";

export function RestaurantDashboard() {
    // Liste degli eventi: quelli in attesa di approvazione e quelli già approvati
    const [pendingEvents, setPendingEvents] = useState<SocialEvent[]>([]);
    const [approvedEvents, setApprovedEvents] = useState<SocialEvent[]>([]);
    // caricamento iniziale
    const [loading, setLoading] = useState(true);

    // Carica le liste di eventi pending e approvati dal backend
    const fetchData = async () => {
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                fetch("http://localhost:8081/api/events/pending/for-restaurateur", { credentials: "include" }),
                fetch("http://localhost:8081/api/events/approved/for-restaurateur", { credentials: "include" })
            ]);

            if (pendingRes.ok) setPendingEvents(await pendingRes.json());
            if (approvedRes.ok) setApprovedEvents(await approvedRes.json());

        } catch (err) {
            console.error(err);
            alert("Errore caricamento dashboard"); 
        } finally {
            setLoading(false);
        }
    };

    // Carica dati 
    useEffect(() => {
        fetchData();
    }, []);

    // Gestisce approvazione o rifiuto di una proposta evento
    const handleDecision = async (eventId: number, decision: "APPROVED" | "REJECTED") => {
        let comment = "";
        if (decision === "REJECTED") {
            const input = window.prompt("Inserisci la motivazione del rifiuto:");
            if (input === null) return; 
            if (input.trim() === "") {
                alert("Motivazione obbligatoria!"); 
                return;
            }
            comment = input;
        } else {
            const input = window.prompt("Messaggio opzionale (premi OK per saltare):");
            if (input) comment = input;
        }

        try {
            // Invia la decisione (APPROVED o REJECTED) con commento al backend
            const response = await fetch(
                `http://localhost:8081/api/events/${eventId}/moderator/decision?decision=${decision}&comment=${encodeURIComponent(comment)}`,
                { method: "PATCH", credentials: "include" }
            );

            if (response.ok) {
                alert(`Evento ${decision === "APPROVED" ? "approvato" : "rifiutato"}!`);
                fetchData(); 
            } else {
                alert("Errore server"); 
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Cancella un evento approvato, rimuove anche tutti i partecipanti
    const handleDelete = async (eventId: number) => {
        if (!confirm("⚠️ SEI SICURO? Cancellare l'evento rimuoverà anche tutti i partecipanti. L'azione è irreversibile.")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/restaurateur/cancel`, {
                method: "DELETE",
                credentials: "include"
            });

            if (response.ok) {
                alert("Evento cancellato definitivamente 🗑️"); 
                // Rimuove localmente l'evento dalla lista
                setApprovedEvents(prev => prev.filter(e => e.id !== eventId));
            } else {
                const msg = await response.text();
                alert("Errore: " + msg); 
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione"); 
        }
    };

    // schermata di caricamento 
    if (loading) return <p style={{textAlign: "center", marginTop: "20px"}}>Caricamento...</p>;

    return (
        <div className="restaurant-dashboard">
            <h2>🍕 Dashboard Ristoratore</h2>

            {/* Proposta eventi in sospeso (in attesa di approvazione dal ristoratore) */}
            <div className="section">
                <h3>🔔 Richieste in Sospeso ({pendingEvents.length})</h3>
                {pendingEvents.length === 0 ? (
                    <p className="empty-message">Nessuna nuova richiesta.</p>
                ) : (
                    <div className="pending-list">
                        {pendingEvents.map(evt => (
                            <div key={evt.id} className="pending-card">
                                <div className="event-info">
                                    <h4>{evt.title}</h4>
                                    <p><strong>Organizzatore:</strong> {evt.organizer.name}</p>
                                    <p><strong>Data:</strong> {new Date(evt.eventDate).toLocaleDateString('it-IT')} - {new Date(evt.eventDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                                    <p><strong>Posti:</strong> {evt.maxParticipants}</p>
                                </div>
                                {/* Pulsanti per accettare o rifiutare la proposta */}
                                <div className="actions">
                                    <button className="approve-btn" onClick={() => handleDecision(evt.id, "APPROVED")}>✓ Accetta</button>
                                    <button className="reject-btn" onClick={() => handleDecision(evt.id, "REJECTED")}>✗ Rifiuta</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <hr className="divider"/>

            {/* Eventi già approvati e confermati (gestione e cancellazione) */}
            <div className="section">
                <h3>📅 Eventi in Programma ({approvedEvents.length})</h3>
                {approvedEvents.length === 0 ? (
                    <p className="empty-message">Nessun evento confermato nel tuo locale.</p>
                ) : (
                    <div className="pending-list">
                        {approvedEvents.map(evt => (
                            <div key={evt.id} className="pending-card approved-card-style">
                                <div className="event-info">
                                    <h4>{evt.title}</h4>
                                    <p><strong>Data:</strong> {new Date(evt.eventDate).toLocaleDateString('it-IT')} ore {new Date(evt.eventDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                                    <p><strong>Organizzatore:</strong> {evt.organizer.name}</p>
                                    <span className="status-badge-green">Confermato</span>
                                </div>
                                {/* Pulsante cancellazione evento*/}
                                <div className="actions">
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => handleDelete(evt.id)}
                                        title="Annulla evento per imprevisti"
                                    >
                                        🗑️ Annulla Evento
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}