import { useEffect, useState } from "react";
import type { Category, City } from "../types";
import "./EventFilters.css";

interface EventFiltersProps {
    onFilter: (filters: FilterState) => void;
}

export interface FilterState {
    category: number;
    city: number;
    dateFrom: string;
    dateTo: string;
    searchText: string;
}

export function EventFilters({ onFilter }: EventFiltersProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        category: 0,
        city: 0,
        dateFrom: "",
        dateTo: "",
        searchText: ""
    });

    useEffect(() => {
        fetch("http://localhost:8081/api/resources/categories")
            .then(res => res.json())
            .then(setCategories)
            .catch(console.error);

        fetch("http://localhost:8081/api/resources/cities")
            .then(res => res.json())
            .then(setCities)
            .catch(console.error);
    }, []);

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const resetFilters = () => {
        const emptyFilters: FilterState = {
            category: 0,
            city: 0,
            dateFrom: "",
            dateTo: "",
            searchText: ""
        };
        setFilters(emptyFilters);
        onFilter(emptyFilters);
    };

    return (
        <div className="event-filters">
            <input
                type="text"
                placeholder="🔍 Cerca evento..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange("searchText", e.target.value)}
                className="filter-search"
            />

            <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", Number(e.target.value))}
                className="filter-select"
            >
                <option value={0}>📂 Tutte le categorie</option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>

            <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", Number(e.target.value))}
                className="filter-select"
            >
                <option value={0}>📍 Tutte le città</option>
                {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>

            <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                placeholder="Da"
                className="filter-date"
            />

            <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                placeholder="A"
                className="filter-date"
            />

            <button onClick={resetFilters} className="filter-reset">
                🔄 Reset
            </button>
        </div>
    );
}
