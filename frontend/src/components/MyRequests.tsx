import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { SocialEvent } from "../types";
import "./Dashboard.css";

export function MyRequests() {
    const [createdEvents, setCreatedEvents] = useState<SocialEvent[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<SocialEvent[]>([]);
    const [activeTab, setActiveTab] = useState<"created" | "joined">("created");
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
                const errMsg = await response.text();
                toast.error("Errore: " + errMsg);
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione");
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
                const errMsg = await response.text();
                toast.error("Errore: " + errMsg);
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione");
        }
    };

    if (loading) return <p>Caricamento...</p>;

    const eventsToShow = activeTab === "created" ? createdEvents : joinedEvents;

    return (
        <div className="dashboard-container">
            <h2>I Miei Eventi</h2>

            <div style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
                <button 
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: activeTab === "created" ? "#ff6347" : "#ddd",
                        color: activeTab === "created" ? "white" : "#333",
                        fontWeight: "bold"
                    }}
                    onClick={() => setActiveTab("created")}
                >
                    Organizzati ({createdEvents.length})
                </button>
                <button 
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: activeTab === "joined" ? "#ff6347" : "#ddd",
                        color: activeTab === "joined" ? "white" : "#333",
                        fontWeight: "bold"
                    }}
                    onClick={() => setActiveTab("joined")}
                >
                    Partecipo ({joinedEvents.length})
                </button>
            </div>

            {eventsToShow.length === 0 ? (
                <p>Nessun evento in questa categoria.</p>
            ) : (
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Titolo</th>
                            <th>Quando</th>
                            <th>Dove</th>
                            <th>Stato</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventsToShow.map(evt => (
                            <tr key={evt.id}>
                                <td>{evt.title}</td>
                                <td>{new Date(evt.eventDate).toLocaleDateString('it-IT')}</td>
                                <td>{evt.restaurant.name}</td>
                                <td>
                                    <span className={`status-badge status-${evt.status}`}>
                                        {evt.status === "PENDING" ? "In Attesa ⏳" : 
                                         evt.status === "APPROVED" ? "Accettata ✅" : "Rifiutata ❌"}
                                    </span>
                                </td>
                                <td>
                                    {activeTab === "created" && evt.status === "PENDING" && (
                                        <button 
                                            style={{padding: "5px 10px", background: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}
                                            onClick={() => handleWithdraw(evt.id)}
                                        >
                                            Ritira
                                        </button>
                                    )}
                                    {activeTab === "joined" && evt.status === "APPROVED" && (
                                        <button 
                                            style={{padding: "5px 10px", background: "#ff9800", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}
                                            onClick={() => handleLeave(evt.id)}
                                        >
                                            Annulla
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}