import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App"; // Importiamo il contesto utente
import type { SocialEvent } from "../types";
import "./EventCard.css";

interface EventCardProps {
    event: SocialEvent;
    onJoin?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export function EventCard({ event, onJoin, onDelete }: EventCardProps) {
    const user = useContext(UserContext);
    const [isJoining, setIsJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [checkingParticipation, setCheckingParticipation] = useState(true);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    console.log("👤 Utente loggato:", user);
    console.log("📅 Evento:", event);
    console.log("🔍 Organizzatore evento:", event.organizer?.name);

    // Controlla al caricamento se l'utente è già iscritto
    useEffect(() => {
        const checkParticipation = async () => {
            try {
                const response = await fetch(`http://localhost:8081/api/events/${event.id}/is-participating`, {
                    credentials: "include"
                });
                if (response.ok) {
                    const isParticipating = await response.json();
                    setJoined(isParticipating);
                }
            } catch (error) {
                console.error("Errore nel controllo partecipazione:", error);
            } finally {
                setCheckingParticipation(false);
            }
        };

        checkParticipation();
    }, [event.id]);

    // Formattazione data
    const dateObj = new Date(event.eventDate);
    const dateStr = dateObj.toLocaleDateString('it-IT') + " " + dateObj.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'});

    // LOGICA NUOVA: Controllo se sono io l'organizzatore
    const isMine = user?.username === event.organizer.name;

    // Stato evento (per mostrare badge e disabilitare join se non APPROVED)
    const isApproved = event.status === "APPROVED";
    
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

                <span className="badge" style={{backgroundColor: isApproved ? "#e6f4ea" : "#fff4e5", color: isApproved ? "#0f5132" : "#92400e"}}>
                    {isApproved ? "APPROVED" : "PENDING"}
                </span>
                
                {/* Mostriamo il tasto Partecipa solo se NON sei l'organizzatore (opzionale) 
                    oppure lo lasciamo sempre. Se l'organizzatore è auto-iscritto, 
                    cliccandolo riceverà "Sei già iscritto", che va bene. */}
                {onJoin && (
                    <button 
                        className="join-btn" 
                        onClick={() => {
                            setIsJoining(true);
                            onJoin(event.id);
                            setIsJoining(false);
                            setJoined(true);
                        }}
                        disabled={!isApproved || isJoining || joined}
                        style={{
                            opacity: (!isApproved || joined) ? 0.6 : 1, 
                            cursor: (isApproved && !joined) ? "pointer" : "not-allowed",
                            backgroundColor: joined ? "#4caf50" : undefined
                        }}
                    >
                        {isJoining ? "⏳ Iscriviti..." : (joined ? "✅ Iscritto!" : (isApproved ? "Partecipa" : "In attesa"))}
                    </button>
                )}

                {/* Bottone Elimina per ADMIN */}
                {user?.role === "ADMIN" && onDelete && (
                    confirmingDelete ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem" }}>Confermi eliminazione?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("✅ Conferma eliminazione per evento:", event.id);
                                    setConfirmingDelete(false);
                                    onDelete(event.id);
                                }}
                                style={{
                                    padding: "6px 10px",
                                    background: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "0.8rem"
                                }}
                            >
                                Sì, elimina
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("❎ Annulla eliminazione per evento:", event.id);
                                    setConfirmingDelete(false);
                                }}
                                style={{
                                    padding: "6px 10px",
                                    background: "#9e9e9e",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "0.8rem"
                                }}
                            >
                                Annulla
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="delete-btn" 
                            type="button"
                            onClick={() => {
                                console.log("🗑️ Click elimina su evento:", event.id, event.title);
                                setConfirmingDelete(true);
                            }}
                            style={{
                                padding: "8px 12px",
                                background: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "0.85rem"
                            }}
                        >
                            🗑️ Elimina
                        </button>
                    )
                )}
            </div>
        </div>
    );
}