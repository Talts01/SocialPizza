import type { SocialEvent } from "../types";
import "./EventCard.css";

interface EventCardProps {
    event: SocialEvent;
    onJoin: (id: number) => void;
    // Rimosso onDelete
    isJoined: boolean;
}

export function EventCard({ event, onJoin, isJoined }: EventCardProps) {
    
    const cardClass = isJoined ? "event-card joined-card" : "event-card";

    return (
        <div className={cardClass}>
            <div className="card-header-row">
                <h3 className="card-title">{event.title}</h3>
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
                
                {event.status === "PENDING" && (
                    <span className="pending-label">⏳ In attesa di approvazione</span>
                )}
            </div>
        </div>
    );
}