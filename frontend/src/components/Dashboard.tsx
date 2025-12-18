import { useEffect, useState, useContext } from "react";
import { UserContext } from "../App";
import type { SocialEvent } from "../types";
import "./Dashboard.css";

export function Dashboard() {
    const user = useContext(UserContext);
    const [myEvents, setMyEvents] = useState<SocialEvent[]>([]);
    
    // Funzione per scaricare i dati giusti
    const fetchDashboardData = async () => {
        if (!user) return;

        let url = "";
        if (user.role === "RESTAURATEUR") {
            // Dashboard Ristoratore (Eventi del suo locale)
            url = "http://localhost:8081/api/events/restaurant/1"; 
        } else {
            // 👇 MODIFICA QUI: Ora puntiamo all'endpoint "I Miei Eventi" che abbiamo creato!
            url = "http://localhost:8081/api/events/joined";
        }

        try {
            const res = await fetch(url, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setMyEvents(data);
            }
        } catch (e) {
            console.error("Errore fetch dashboard", e);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    // Azione per Ristoratore: Accetta/Rifiuta
    const handleStatusChange = async (eventId: number, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:8081/api/events/${eventId}/status?status=${newStatus}`, {
                method: "PATCH",
                credentials: "include"
            });
            if (res.ok) {
                alert("Stato aggiornato!");
                fetchDashboardData(); // Ricarica la tabella
            } else {
                alert("Errore dal server");
            }
        } catch (e) {
            alert("Errore aggiornamento stato");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-section">
                <h2>{user?.role === "RESTAURATEUR" ? "Gestione Richieste" : "Le mie Pizzate"}</h2>
                
                {myEvents.length === 0 ? (
                    <p>Nessun evento da mostrare.</p>
                ) : (
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Titolo</th>
                                <th>Data</th>
                                <th>Stato</th>
                                {/* Colonna Azioni solo per il Ristoratore */}
                                {user?.role === "RESTAURATEUR" && <th>Azioni</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {myEvents.map(evt => (
                                <tr key={evt.id}>
                                    <td>{evt.title}</td>
                                    <td>{new Date(evt.eventDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${evt.status}`}>
                                            {evt.status}
                                        </span>
                                    </td>
                                    
                                    {/* Cella Azioni: visibile solo se Ristoratore */}
                                    {user?.role === "RESTAURATEUR" && (
                                        <td>
                                            {evt.status === "PENDING" && (
                                                <>
                                                    <button className="action-btn btn-accept" onClick={() => handleStatusChange(evt.id, "APPROVED")}>Accetta</button>
                                                    <button className="action-btn btn-reject" onClick={() => handleStatusChange(evt.id, "REJECTED")}>Rifiuta</button>
                                                </>
                                            )}
                                        </td>
                                    )}
                                </tr> 
                            ))}
                        </tbody> 
                    </table>
                )}
            </div>
        </div>
    );
}