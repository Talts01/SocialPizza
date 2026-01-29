// React hooks usati nel componente
import { useEffect, useState } from "react";
// Stili per i filtri
import "./EventFilters.css";

export interface FilterState {
    searchText: string;
    city: number;
    category: number;
    dateFrom: string;
}

interface EventFiltersProps {
    onFilter: (filters: FilterState) => void;
}

export function EventFilters({ onFilter }: EventFiltersProps) {
    // Stato dei filtri controllati
    const [searchText, setSearchText] = useState(""); // testo della ricerca 
    const [selectedCity, setSelectedCity] = useState(0); // id città 
    const [selectedCategory, setSelectedCategory] = useState(0); // categoria 
    const [dateFrom, setDateFrom] = useState(""); // data 

    // Liste caricate da API per popolare le select
    const [cities, setCities] = useState<{id: number, name: string}[]>([]);
    const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

    // valore minimo dell'input date 
    const todayStr = new Date().toISOString().split("T")[0];

    // Carica città e categorie una sola volta all'avvio del componente
    useEffect(() => {
        fetch("http://localhost:8081/api/resources/cities")
            .then(res => res.ok ? res.json() : [])
            .then(data => setCities(data))
            .catch(() => {}); 

        fetch("http://localhost:8081/api/resources/categories")
            .then(res => res.ok ? res.json() : [])
            .then(data => setCategories(data))
            .catch(() => {});
    }, []);

    // ogni volta che cambia uno dei filtri
    useEffect(() => {
        onFilter({
            searchText,
            city: selectedCity,
            category: selectedCategory,
            dateFrom
        });
    }, [searchText, selectedCity, selectedCategory, dateFrom]);

    // Resetta la data 
    const handleClearDate = () => {
        setDateFrom("");
    };

    return (
        <div className="filters-container">
            <input 
                type="text" 
                placeholder="🔍 Cerca evento o pizzeria..." 
                className="filter-input"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
            />

            <select 
                className="filter-select"
                value={selectedCity}
                onChange={e => setSelectedCity(parseInt(e.target.value))}
            >
                <option value={0}>📍 Tutte le Città</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
                className="filter-select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(parseInt(e.target.value))}
            >
                <option value={0}>🎨 Tutte le Categorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <div className="date-filter-group">
                <input 
                    type="date" 
                    className="filter-date"
                    value={dateFrom}
                    min={todayStr}
                    onChange={e => setDateFrom(e.target.value)}
                />
                
                {dateFrom && (
                    <button 
                        className="clear-date-btn" 
                        onClick={handleClearDate}
                        title="Cancella data"
                    >
                        ❌
                    </button>
                )}
            </div>
        </div>
    );
}