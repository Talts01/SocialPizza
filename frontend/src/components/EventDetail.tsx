import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { SocialEvent } from "../types";
import "./EventDetail.css";

interface Participant {
    id: number;
    user: {
        name: string;
        email: string;
    };
    registrationDate: string;
    status: string;
}

export function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<SocialEvent | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        Promise.all([
            fetch(`http://localhost:8081/api/events/public`, { credentials: "include" }),
            fetch(`http://localhost:8081/api/events/${id}/participants`, { credentials: "include" })
        ])
            .then(async ([eventsRes, participantsRes]) => {
                if (eventsRes.ok && participantsRes.ok) {
                    const allEvents = await eventsRes.json();
                    const eventData = allEvents.find((e: SocialEvent) => e.id === parseInt(id));
                    const participantsData = await participantsRes.json();
                    
                    setEvent(eventData || null);
                    setParticipants(participantsData);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Caricamento...</p>;
    if (!event) return <p>Evento non trovato.</p>;

    return (
        <div className="event-detail-container">
            <div className="event-header-detail">
                <h1>{event.title}</h1>
                <span className={`status-badge ${event.status.toLowerCase()}`}>
                    {event.status}
                </span>
            </div>

            {event.description && <p className="description">{event.description}</p>}

            <div className="event-info-grid">
                <div className="info-item">
                    <strong>📅 Quando:</strong>
                    <span>{new Date(event.eventDate).toLocaleString('it-IT')}</span>
                </div>
                <div className="info-item">
                    <strong>🍕 Dove:</strong>
                    <span>{event.restaurant.name} - {event.restaurant.address}</span>
                </div>
                <div className="info-item">
                    <strong>🎯 Tema:</strong>
                    <span>{event.category.name}</span>
                </div>
                <div className="info-item">
                    <strong>👤 Organizzatore:</strong>
                    <span>{event.organizer.name}</span>
                </div>
            </div>

            <div className="participants-section">
                <h3>Partecipanti ({participants.length}/{event.maxParticipants})</h3>
                
                {participants.length === 0 ? (
                    <p>Nessun partecipante ancora.</p>
                ) : (
                    <ul className="participants-list">
                        {participants.map(p => (
                            <li key={p.id} className="participant-item">
                                <span className="participant-name">{p.user.name}</span>
                                <span className="participant-date">
                                    Iscritto il {new Date(p.registrationDate).toLocaleDateString('it-IT')}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
