import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./MyRequests.css";

interface MyRequestsProps {
    defaultTab?: "created" | "joined";
}

export function MyRequests({ defaultTab = "created" }: MyRequestsProps) {
    // Eventi creati dall'utente e eventi a cui l'utente ha aderito
    const [createdEvents, setCreatedEvents] = useState<SocialEvent[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<SocialEvent[]>([]);
    const [activeTab, setActiveTab] = useState<"created" | "joined">(defaultTab);
    // Stato di caricamento iniziale
    const [loading, setLoading] = useState(true);

    // Carica in parallelo gli eventi creati e quelli joinati dall'API
    const fetchMyEvents = async () => {
        try {
            const [createdRes, joinedRes] = await Promise.all([
                fetch("http://localhost:8081/api/events/created", { credentials: "include" }),
                fetch("http://localhost:8081/api/events/joined", { credentials: "include" })
            ]);

            if (createdRes.ok && joinedRes.ok) {
                const created = await createdRes.json();
                const joined = await joinedRes.json();
                setCreatedEvents(created);
                setJoinedEvents(joined);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Aggiorna la tab attiva se cambia la prop di default
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    // Carica gli eventi al montaggio del componente
    useEffect(() => {
        fetchMyEvents();
    }, []);

    // Rimuove una proposta creata dall'utente
    const handleWithdraw = async (eventId: number) => {
        if (!window.confirm("Vuoi davvero ritirare questa proposta?")) return;
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/withdraw`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                alert("Proposta ritirata!"); 
                fetchMyEvents(); // ricarica lista
            } else {
                alert("Errore ritiro proposta"); 
            }
        } catch (error) {
            console.error(error);
        }
    };

    // L'utente annulla la propria partecipazione a un evento
    const handleLeave = async (eventId: number) => {
        const confirmed = window.confirm("Vuoi davvero annullare la tua partecipazione?");
        if (!confirmed) return;
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/leave`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                alert("Iscrizione cancellata!"); 
                fetchMyEvents();
            } else {
                alert("Errore cancellazione"); 
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Mostra messaggio di caricamento
    if (loading) return <p className="loading-msg">Caricamento...</p>;

    // Sceglie la lista da mostrare in base alla tab attiva
    const eventsToShow = activeTab === "created" ? createdEvents : joinedEvents;

    return (
        <div className="dashboard-container">
            {/* Titolo dinamico in base alla tab */}
            <h2>{activeTab === "created" ? "📋 Stato delle mie Proposte" : "🎟 Eventi a cui Partecipo"}</h2>

            {/* Messaggio se non ci sono eventi */}
            {eventsToShow.length === 0 ? (
                <p className="empty-msg">Nessun evento in questa categoria.</p>
            ) : (
                <div className="requests-list">
                    {eventsToShow.map(evt => (
                        <div key={evt.id} className="request-card">
                            
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{evt.title}</h3>
                                    <p className="card-info">
                                        📅 {new Date(evt.eventDate).toLocaleDateString('it-IT')} | 📍 {evt.restaurant.name}
                                    </p>
                                </div>
                                {/* Badge di stato: PENDING / APPROVED / REJECTED */}
                                <span className={`status-badge status-${evt.status}`}>
                                    {evt.status === "PENDING" ? "In Attesa ⏳" : 
                                     evt.status === "APPROVED" ? "Accettata ✅" : "Rifiutata ❌"}
                                </span>
                            </div>

                            {/* Se la proposta è stata rifiutata, mostriamo la motivazione */}
                            {activeTab === "created" && evt.status === "REJECTED" && (
                                <div className="rejection-box">
                                    <span className="rejection-title">Motivazione del Ristoratore:</span>
                                    <p className="rejection-text">
                                        "{evt.rejectionReason || "Nessuna motivazione specificata."}"
                                    </p>
                                </div>
                            )}

                            {/* Messaggio del ristoratore mostrato per proposte approvate */}
                            {activeTab === "created" && evt.status === "APPROVED" && evt.moderatorComment && (
                                <div className="approval-box">
                                    <span className="approval-title">Messaggio dal Ristoratore:</span>
                                    <p className="approval-text">
                                        "{evt.moderatorComment}"
                                    </p>
                                </div>
                            )}

                            <div className="card-actions">
                                {/* Pulsante per ritirare la proposta */}
                                {activeTab === "created" && evt.status === "PENDING" && (
                                    <button 
                                        className="action-btn withdraw"
                                        onClick={() => handleWithdraw(evt.id)}
                                    >
                                        Ritira Proposta
                                    </button>
                                )}
                                {/* Pulsante per lasciare un evento a cui si oartecipa*/}
                                {activeTab === "joined" && evt.status === "APPROVED" && (
                                    <button 
                                        className="action-btn leave"
                                        onClick={() => handleLeave(evt.id)}
                                    >
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