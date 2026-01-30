import { useContext, useEffect, useState } from "react";
import type { PageType } from "../App";
import { UserContext } from "../context/UserContext";
import type { Restaurant } from "../types";
import "./OrganizeEvent.css";

interface OrganizeEventProps {
    // cambiare pagina dopo la creazione dell'evento
    onNavigate: (page: PageType) => void;
}
// Tipo per opzioni select ristorante e categoria
interface SelectOption {
    id: number;
    name: string;
}

export function OrganizeEvent({ onNavigate }: OrganizeEventProps) {
    // Utente corrente dal contesto
    const user = useContext(UserContext);

    // Campi del form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDay, setEventDay] = useState("");
    const [eventTime, setEventTime] = useState("");

    // Numero massimo partecipanti
    const [maxParticipants, setMaxParticipants] = useState(10);

    // Dati caricati dal backend per popolamento select
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);

    // Valori selezionati per ristorante e categoria 
    const [selectedRestaurant, setSelectedRestaurant] = useState<number>(0);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);

    // Stringa data
    const todayStr = new Date().toISOString().split("T")[0];

    // Carica ristoranti 
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [restRes, catRes] = await Promise.all([
                    fetch("http://localhost:8081/api/resources/restaurants"),
                    fetch("http://localhost:8081/api/resources/categories")
                ]);

                if (restRes.ok && catRes.ok) {
                    const restData: Restaurant[] = await restRes.json();
                    setRestaurants(restData);

                    // Se l'utente è ristoratore, selezioniamo automaticamente il suo ristorante
                    if (user?.role === "RISTORATORE") {
                        const myRestaurant = restData.find(r => r.owner?.email === user.username);
                        if (myRestaurant) {
                            setSelectedRestaurant(myRestaurant.id);
                        }
                    }

                    // Categorie e "Altro" alla fine
                    const catData = await catRes.json();
                    const sortedCats = [...catData].sort((a: SelectOption, b: SelectOption) => {
                        const isAAltro = a.name?.toLowerCase() === "altro";
                        const isBAltro = b.name?.toLowerCase() === "altro";
                        if (isAAltro && !isBAltro) return 1;
                        if (!isAAltro && isBAltro) return -1;
                        return a.name.localeCompare(b.name);
                    });
                    setCategories(sortedCats);
                }
                // Se il backend fallisce, restaurants e categories rimangono array vuoti
            }  catch (err) {
                // In sviluppo si possono usare dati mock se il backend non risponde
                console.warn("Risorse non disponibili");
            }
        };
        fetchResources();
    }, [user]);

    // valida i campi e invia la richiesta al backend per creare evento
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validazione minima lato client
        if (!title || !eventDay || !eventTime || selectedRestaurant === 0 || selectedCategory === 0) {
            alert("Compila tutti i campi obbligatori!"); 
            return;
        }

        // Combina data e ora in formato ISO-local usato dal backend
        const finalDateTime = `${eventDay}T${eventTime}`; 

        try {
            const newEventPayload = {
                title,
                description,
                eventDate: finalDateTime,
                maxParticipants: maxParticipants,
                status: "PENDING",
                category: { id: selectedCategory }
            };

            // POST di creazione evento, passando l'id del ristorante selezionato
            const response = await fetch(`http://localhost:8081/api/events/create?restaurantId=${selectedRestaurant}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEventPayload),
                credentials: "include"
            });

            if (response.ok) {
                const createdEvent = await response.json();
                // Se l'evento è approvato subito, navighiamo alla lista eventi, altrimenti al dashboard
                if (createdEvent.status === "APPROVED") {
                    alert("Pizzata pubblicata! 🍕"); 
                    onNavigate("eventi");
                } else {
                    alert("Richiesta inviata! In attesa di approvazione ⏳"); 
                    onNavigate("dashboard");
                }
            } else {
                const errMsg = await response.text();
                alert("Errore: " + errMsg); 
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione"); 
        }
    };

    return (
        <div className="organize-container">
            <div className="organize-header">
                <h2>🍕 Organizza una Nuova Pizzata</h2>
                <p>Compila i dettagli qui sotto. La tua proposta sarà visibile a tutti dopo l'approvazione.</p>
            </div>

            {/* Form nuova proposta evento */}
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

                <div className="form-row">
                    <div className="form-group half">
                        <label>Data *</label>
                        {/* Data evento */}
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
                        {/* Numero massimo partecipanti */}
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
                        {/* Select ristorante*/}
                        <select 
                            value={selectedRestaurant} 
                            onChange={e => setSelectedRestaurant(parseInt(e.target.value))}
                            required
                            disabled={user?.role === "RISTORATORE" && selectedRestaurant !== 0}
                            className={`filter-select ${user?.role === "RISTORATORE" && selectedRestaurant !== 0 ? 'select-locked-ristoratore' : ''}`}
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
                    {/* Select categoria/tema dell'evento */}
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