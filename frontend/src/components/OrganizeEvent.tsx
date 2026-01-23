import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { PageType } from "../App";
import "./OrganizeEvent.css";

interface OrganizeEventProps {
    onNavigate: (page: PageType) => void;
}

interface SelectOption {
    id: number;
    name: string;
}

export function OrganizeEvent({ onNavigate }: OrganizeEventProps) {
    // Stati per i campi del form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    
    // --- MODIFICA 1: Due stati separati per Data e Ora ---
    const [eventDay, setEventDay] = useState("");
    const [eventTime, setEventTime] = useState("");
    
    const [maxParticipants, setMaxParticipants] = useState(10);
    
    // Stati per i menu a tendina
    const [restaurants, setRestaurants] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    
    const [selectedRestaurant, setSelectedRestaurant] = useState<number>(0);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);

    // Helper: Ottieni la data di oggi in formato YYYY-MM-DD per il blocco "min"
    const todayStr = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [restRes, catRes] = await Promise.all([
                    fetch("http://localhost:8081/api/resources/restaurants"),
                    fetch("http://localhost:8081/api/resources/categories")
                ]);

                if (restRes.ok && catRes.ok) {
                    setRestaurants(await restRes.json());
                    setCategories(await catRes.json());
                } else {
                    throw new Error("Risorse non trovate");
                }
            } catch (err) {
                console.warn("Backend resources not found, using mocks");
                setRestaurants([
                    { id: 1, name: "Pizzeria Da Luigi" },
                    { id: 2, name: "Bella Napoli" }
                ]);
                setCategories([
                    { id: 1, name: "Anime & Manga" },
                    { id: 2, name: "Sport & Calcio" },
                    { id: 3, name: "Musica Live" }
                ]);
            }
        };
        fetchResources();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validazione: controlliamo che entrambi i campi data/ora siano pieni
        if (!title || !eventDay || !eventTime || selectedRestaurant === 0 || selectedCategory === 0) {
            toast.error("Compila tutti i campi obbligatori!");
            return;
        }

        // --- MODIFICA 2: Uniamo data e ora nel formato ISO per il Backend ---
        const finalDateTime = `${eventDay}T${eventTime}`; 
        // Esempio risultato: "2025-05-10T20:15"

        try {
            const newEventPayload = {
                title,
                description,
                eventDate: finalDateTime, // Usiamo la stringa combinata
                maxParticipants: maxParticipants,
                status: "PENDING",
                category: { id: selectedCategory }
            };

            const response = await fetch(`http://localhost:8081/api/events/create?restaurantId=${selectedRestaurant}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEventPayload),
                credentials: "include"
            });

            if (response.ok) {
                const createdEvent = await response.json();
                if (createdEvent.status === "APPROVED") {
                    toast.success("Pizzata pubblicata! 🍕");
                    onNavigate("eventi");
                } else {
                    toast.success("Richiesta inviata! In attesa di approvazione ⏳");
                    onNavigate("dashboard");
                }
            } else {
                const errMsg = await response.text();
                toast.error("Errore: " + errMsg);
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione");
        }
    };

    return (
        <div className="organize-container">
            <div className="organize-header">
                <h2>🍕 Organizza una Nuova Pizzata</h2>
                <p>Compila i dettagli qui sotto. La tua proposta sarà visibile a tutti dopo l'approvazione.</p>
            </div>

            <form className="organize-form" onSubmit={handleSubmit}>
                
                <div className="form-group">
                    <label>Titolo Evento *</label>
                    <input 
                        type="text" 
                        placeholder="Es. Serata Naruto, Pizza post-partita..." 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* --- MODIFICA 3: Campi Data e Ora Separati --- */}
                <div className="form-row">
                    <div className="form-group half">
                        <label>Data *</label>
                        <input 
                            type="date" 
                            min={todayStr} 
                            value={eventDay}
                            onChange={e => setEventDay(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group half">
                        <label>Ora *</label>
                        <input 
                            type="time" 
                            
                            value={eventTime}
                            onChange={e => setEventTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label>Posti Max *</label>
                        <input 
                            type="number" 
                            min="2" 
                            max="50"
                            value={maxParticipants}
                            onChange={e => setMaxParticipants(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    <div className="form-group half">
                        <label>Scegli Ristorante *</label>
                        <select 
                            value={selectedRestaurant} 
                            onChange={e => setSelectedRestaurant(parseInt(e.target.value))}
                            required
                        >
                            <option value={0}>-- Seleziona Pizzeria --</option>
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Categoria *</label>
                    <select 
                        value={selectedCategory} 
                        onChange={e => setSelectedCategory(parseInt(e.target.value))}
                        required
                    >
                        <option value={0}>-- Seleziona Tema --</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Descrizione (Opzionale)</label>
                    <textarea 
                        rows={4} 
                        placeholder="Dai qualche dettaglio in più ai partecipanti..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        🚀 Pubblica Evento
                    </button>
                </div>
            </form>
        </div>
    );
}