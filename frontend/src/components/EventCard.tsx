import { useEffect, useState } from "react";
import type { SocialEvent } from "../types";
import "./EventCard.css";

// Props del componente:
interface EventCardProps {
    event: SocialEvent;
    onJoin: (id: number) => void;// callback chiamato quando l'utente clicca "Partecipa"
    isJoined: boolean;
}

export function EventCard({ event, onJoin, isJoined }: EventCardProps) {
    // Aggiunge una classe CSS extra quando l'utente è già iscritto
    const cardClass = isJoined ? "event-card joined-card" : "event-card";

    const [partecipanti, setPartecipanti] = useState(0);

    // otteniamo il numero di partecipanti attuali
    useEffect(() => {
        fetch(`http://localhost:8081/api/events/${event.id}/participants`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setPartecipanti(data.length);
            })
            .catch(err => {
                console.error("Errore nel recupero del numero di partecipanti:", err);
            });
    }, [event.id, isJoined]);

    return (
        <div className={cardClass}>
            <div className="card-header-row" style={{alignItems: "center"}}>
                <h3 className="card-title">{event.title}</h3>
                <p>{partecipanti}/{event.maxParticipants}</p>
            </div>

            <p className="card-info">
                📅 {new Date(event.eventDate).toLocaleDateString('it-IT')} <br/>
                📍 {event.restaurant.name} ({event.restaurant.city?.name})
            </p>
            
            <div className="card-body">
                
                <span className="theme-badge">
                    🎨 {event.category.name}
                </span>
                {event.description && (
                    <p className="card-description">
                        "{event.description}"
                    </p>
                )}
            </div>
                
            <div className="card-action-center">
                {isJoined ? (
                    <div className="joined-label">
                        ✅ Partecipi!
                    </div>
                ) : (
                    event.status === "APPROVED" && (
                        <button 
                            className="join-btn-pretty" 
                            onClick={() => onJoin(event.id)}
                        >
                            Partecipa 🍕
                        </button>
                    )
                )}

                {/* Mostra lo stato "In attesa" per gli eventi PENDING */}
                {event.status === "PENDING" && (
                    <span className="pending-label">⏳ In attesa di approvazione</span>
                )}
            </div>
        </div>
    );
}