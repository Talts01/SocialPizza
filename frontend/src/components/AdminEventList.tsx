import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./AdminEventList.css";

// amministrazione globale di tutti gli eventi approvati 
export function AdminEventList() {
    const [events, setEvents] = useState<SocialEvent[]>([]);  // Lista di tutti gli eventi approvati
    const [loading, setLoading] = useState(true);  // Indica se i dati sono in caricamento
    
    // Stati per i messaggi di feedback (errori e successi)
    const [error, setError] = useState<string | null>(null);  // Messaggio di errore
    const [successMsg, setSuccessMsg] = useState<string | null>(null);  // Messaggio di successo

    // Carica tutti gli eventi approvati dal backend
    const fetchAllApprovedEvents = async () => {
        setError(null);
        try {
            const response = await fetch("http://localhost:8081/api/events/approved", {
                credentials: "include"
            });
            if (response.ok) {
                setEvents(await response.json());
            } else {
                setError("Impossibile caricare la lista eventi.");
            }
        } catch (err) {
            console.error(err);
            setError("Errore di connessione al server.");
        } finally {
            setLoading(false);
        }
    };

    // Carica gli eventi
    useEffect(() => {
        fetchAllApprovedEvents();
    }, []);

    // Handler per eliminare un evento dal sistema 
    const handleDelete = async (eventId: number) => {
        if (!confirm("⚠️ ADMIN: Sei sicuro di voler cancellare questo evento globale?")) return;

        // Resetta i messaggi precedenti
        setError(null);
        setSuccessMsg(null);

        try {
            // API endpoint per l'eliminazione da admin
            const response = await fetch(`http://localhost:8081/api/admin/events/${eventId}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (response.ok) {
                setSuccessMsg("Evento eliminato con successo dal sistema!");
                // Rimuove l'evento dalla lista locale per aggiornare la UI
                setEvents(prev => prev.filter(e => e.id !== eventId));
            } else {
                const msg = await response.text();
                setError("Errore cancellazione: " + msg);
            }
        } catch (err) {
            console.error(err);
            setError("Errore di rete durante la cancellazione.");
        }
    };

    if (loading) return <p style={{textAlign: "center", marginTop: "20px"}}>Caricamento eventi globali...</p>;

    return (
        <div className="restaurant-dashboard">
            <h2>🛡️ Gestione Eventi Globale</h2>

            {/* Sezione messaggi di feedback: errori e successi */}
            {error && (
                <div className="feedback-msg feedback-error">
                    {error}
                </div>
                )}    
                
            {successMsg && (
                <div className="feedback-msg feedback-success">
                    {successMsg}
                </div>
            )}

            {/* Lista di tutti gli eventi approvati con azioni admin */}
            <div className="section">
                <h3>📅 Tutti gli Eventi Approvati ({events.length})</h3>
                {events.length === 0 ? (
                    <p className="empty-message">Nessun evento approvato presente nel sistema.</p>
                ) : (
                    // Griglia con le carte degli eventi approvati
                    <div className="pending-list">
                        {events.map(evt => (
                            <div key={evt.id} className="pending-card approved-card-style">
                                {/* Informazioni principali dell'evento */}
                                <div className="event-info">
                                    <h4>{evt.title}</h4>
                                    <p><strong>Pizzeria:</strong> {evt.restaurant.name} ({evt.restaurant.city?.name})</p>
                                    <p><strong>Organizzatore:</strong> {evt.organizer.name}</p>
                                    <p><strong>Data:</strong> {new Date(evt.eventDate).toLocaleDateString('it-IT')} ore {new Date(evt.eventDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                {/* Azioni admin: eliminazione evento */}
                                <div className="actions">
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => handleDelete(evt.id)}
                                        style={{backgroundColor: '#d32f2f'}} 
                                    >
                                        🗑️ Elimina (Admin)
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