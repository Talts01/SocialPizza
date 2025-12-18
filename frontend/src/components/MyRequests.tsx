import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./Dashboard.css"; // Riutilizziamo lo stile della dashboard che è carino

export function MyRequests() {
    const [requests, setRequests] = useState<SocialEvent[]>([]);

    useEffect(() => {
        // Scarichiamo le proposte fatte da me
        fetch("http://localhost:8081/api/events/created", { credentials: "include" })
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-section">
                <h2>Le mie Proposte</h2>
                
                {requests.length === 0 ? (
                    <p>Non hai ancora proposto nessuna pizzata.</p>
                ) : (
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Titolo</th>
                                <th>Quando</th>
                                <th>Dove</th>
                                <th>Stato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(evt => (
                                <tr key={evt.id}>
                                    <td>{evt.title}</td>
                                    <td>{new Date(evt.eventDate).toLocaleDateString()}</td>
                                    <td>{evt.restaurant.name}</td>
                                    <td>
                                        {/* Badge colorato per lo stato */}
                                        <span className={`status-badge status-${evt.status}`}>
                                            {evt.status === "PENDING" ? "In Attesa ⏳" : 
                                             evt.status === "APPROVED" ? "Accettata ✅" : "Rifiutata ❌"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}