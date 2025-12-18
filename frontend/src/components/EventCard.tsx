import { useContext } from "react";
import type { SocialEvent } from "../types";
import { UserContext } from "../App"; // Importiamo il contesto utente
import "./EventCard.css";

interface EventCardProps {
    event: SocialEvent;
    onJoin?: (id: number) => void;
}

export function EventCard({ event, onJoin }: EventCardProps) {
    const user = useContext(UserContext); // Recuperiamo l'utente loggato (es. Mario)

    // Formattazione data
    const dateObj = new Date(event.eventDate);
    const dateStr = dateObj.toLocaleDateString('it-IT') + " " + dateObj.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'});

    // LOGICA NUOVA: Controllo se sono io l'organizzatore
    // Confrontiamo lo username dell'utente loggato con quello dell'organizzatore dell'evento
    const isMine = user?.username === event.organizer.name;
    
    // Decidiamo cosa scrivere
    const organizerLabel = isMine ? "Te" : event.organizer.name;

    return (

        <div className={`event-card ${isMine ? "my-event" : ""}`}> {/* Classe extra opzionale per stile CSS */}
            <div>
                <div className="event-header">{event.title}</div>
                    {event.description && (
                    <p style={{fontSize: "0.85rem", fontStyle: "italic", color: "#666", margin: "5px 0 10px 0"}}>
                        "{event.description}"
                    </p>
                )}
                <div className="event-info">
                    <p><strong>Tema:</strong> {event.category.name}</p>
                    <p><strong>Dove:</strong> {event.restaurant.name}</p>
                    <p><strong>Quando:</strong> {dateStr}</p>
                </div>
            </div>
            
            <div className="event-footer">
                {/* Qui mostriamo "Te" o il nome */}
                <span className="badge" style={isMine ? {backgroundColor: "#d1e7dd", color: "#0f5132"} : {}}>
                    Organizza: {organizerLabel}
                </span>
                
                {/* Mostriamo il tasto Partecipa solo se NON sei l'organizzatore (opzionale) 
                    oppure lo lasciamo sempre. Se l'organizzatore è auto-iscritto, 
                    cliccandolo riceverà "Sei già iscritto", che va bene. */}
                {onJoin && (
                    <button className="join-btn" onClick={() => onJoin(event.id)}>
                        Partecipa
                    </button>
                )}
            </div>
        </div>
    );
}