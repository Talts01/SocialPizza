import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { SocialEvent } from "../types";
import "./MyRequests.css";

interface MyRequestsProps {
    defaultTab?: "created" | "joined";
}

export function MyRequests({ defaultTab = "created" }: MyRequestsProps) {
    const [createdEvents, setCreatedEvents] = useState<SocialEvent[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<SocialEvent[]>([]);
    const [activeTab, setActiveTab] = useState<"created" | "joined">(defaultTab);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const handleWithdraw = async (eventId: number) => {
        if (!confirm("Vuoi davvero ritirare questa proposta?")) return;
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/withdraw`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                toast.success("Proposta ritirata!");
                fetchMyEvents();
            } else {
                toast.error("Errore ritiro proposta");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLeave = async (eventId: number) => {
        if (!confirm("Vuoi davvero annullare la tua partecipazione?")) return;
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}/leave`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                toast.success("Iscrizione cancellata!");
                fetchMyEvents();
            } else {
                toast.error("Errore cancellazione");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <p className="loading-msg">Caricamento...</p>;

    const eventsToShow = activeTab === "created" ? createdEvents : joinedEvents;

    return (
        <div className="dashboard-container">
            <h2>{activeTab === "created" ? "📋 Stato delle mie Proposte" : "🎟 Eventi a cui Partecipo"}</h2>

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
                                <span className={`status-badge status-${evt.status}`}>
                                    {evt.status === "PENDING" ? "In Attesa ⏳" : 
                                     evt.status === "APPROVED" ? "Accettata ✅" : "Rifiutata ❌"}
                                </span>
                            </div>

                            {/* --- BOX RIFIUTO (ROSSO) --- */}
                            {activeTab === "created" && evt.status === "REJECTED" && (
                                <div className="rejection-box">
                                    <span className="rejection-title">Motivazione del Ristoratore:</span>
                                    <p className="rejection-text">
                                        "{evt.rejectionReason || "Nessuna motivazione specificata."}"
                                    </p>
                                </div>
                            )}

                            
                            {activeTab === "created" && evt.status === "APPROVED" && evt.moderatorComment && (
                                <div className="approval-box">
                                    <span className="approval-title">Messaggio dal Ristoratore:</span>
                                    <p className="approval-text">
                                        "{evt.moderatorComment}"
                                    </p>
                                </div>
                            )}

                            <div className="card-actions">
                                {activeTab === "created" && evt.status === "PENDING" && (
                                    <button 
                                        className="action-btn withdraw"
                                        onClick={() => handleWithdraw(evt.id)}
                                    >
                                        Ritira Proposta
                                    </button>
                                )}
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