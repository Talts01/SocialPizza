import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import type { Category, Restaurant } from "../types";
import "./CreateEventForm.css";

interface CreateEventFormProps {
    onConfirm: (title: string, description: string, date: string, seats: number, restaurantId: number, categoryId: number) => void;
    onCancel: () => void;
}

export function CreateEventForm({ onConfirm, onCancel }: CreateEventFormProps) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [seats, setSeats] = useState(4);
    const [dateOnly, setDateOnly] = useState("");
    const [timeOnly, setTimeOnly] = useState("20:00");

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedRest, setSelectedRest] = useState<number>(0);
    const [selectedCat, setSelectedCat] = useState<number>(0);

    const timeSlots = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hourStr = h.toString().padStart(2, '0');
            const minStr = m.toString().padStart(2, '0');
            timeSlots.push(`${hourStr}:${minStr}`);
        }
    }

    useEffect(() => {
        fetch("http://localhost:8081/api/resources/restaurants")
            .then(res => res.json())
            .then(data => {
                setRestaurants(data);
                if (data.length > 0) setSelectedRest(data[0].id);
            })
            .catch(err => console.error(err));

        fetch("http://localhost:8081/api/resources/categories")
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                if (data.length > 0) setSelectedCat(data[0].id);
            })
            .catch(err => console.error(err));
    }, []);

    const incrementSeats = () => {
        if (seats < 15) setSeats(seats + 1);
    };

    const decrementSeats = () => {
        if (seats > 2) setSeats(seats - 1);
    };

    const handleSubmit = () => {
        if (!title || !dateOnly || !timeOnly || selectedRest === 0 || selectedCat === 0) {
            toast.error("Compila tutti i campi obbligatori!");
            return;
        }
        const finalDateTime = `${dateOnly}T${timeOnly}`;
        onConfirm(title, desc, finalDateTime, seats, selectedRest, selectedCat);
    };

    return (
        <div className="glasspane" onClick={(e) => {
            if (e.target === e.currentTarget) onCancel();
        }}>
            <form className="create-event-request" onSubmit={(e) => e.preventDefault()}>
                <h1>Organizza Pizzata</h1>
                
                <div className="field">
                    <label>Titolo Serata:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="Es. Pizza e Champions" 
                        required 
                    />
                </div>

                <div className="field">
                    <label>Descrizione (Opzionale):</label>
                    <textarea 
                        value={desc} 
                        onChange={e => setDesc(e.target.value)} 
                        placeholder="Es. Si parla solo di film horror anni '80..."
                        rows={3}
                    />
                </div>

                <div className="field-row">
                    <div className="field">
                        <label>Giorno:</label>
                        <input 
                            type="date" 
                            value={dateOnly} 
                            onChange={e => setDateOnly(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="field">
                        <label>Ora:</label>
                        <select 
                            value={timeOnly} 
                            onChange={e => setTimeOnly(e.target.value)}
                        >
                            {timeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- SEZIONE POSTI PULITA --- */}
                <div className="field">
                    <label>Posti Max (Max 15):</label>
                    <div className="seat-counter">
                        <button 
                            type="button"
                            className="counter-btn"
                            onClick={decrementSeats}
                            disabled={seats <= 2}
                        >
                            -
                        </button>
                        
                        <span className="seat-number">{seats}</span>
                        
                        <button 
                            type="button"
                            className="counter-btn"
                            onClick={incrementSeats}
                            disabled={seats >= 15}
                        >
                            +
                        </button>
                    </div>
                </div>
                {/* --------------------------- */}

                <div className="field">
                    <label>Scegli il Locale:</label>
                    <select value={selectedRest} onChange={e => setSelectedRest(Number(e.target.value))}>
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.city?.name})</option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Tema Serata:</label>
                    <select value={selectedCat} onChange={e => setSelectedCat(Number(e.target.value))}>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="actions">
                    <button className="form-action ok" onClick={handleSubmit}>Crea Evento</button>
                    <button className="form-action cancel" onClick={onCancel}>Annulla</button>
                </div>
            </form>
        </div>
    );
}