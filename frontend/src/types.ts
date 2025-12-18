// src/types.ts

// L'utente che organizza (semplificato)
export interface UserInfo {
    id: number;
    name: string; 
    email: string;
}

// La categoria (Tema)
export interface Category {
    id: number;
    name: string;
    description: string;
}

// Il ristorante
export interface Restaurant {
    id: number;
    name: string;
    address: string;
    city: {
        name: string;
    }
}

// L'EVENTO PRINCIPALE (La Pizzata)
export interface SocialEvent {
    id: number;
    title: string;
    description?: string;
    eventDate: string; 
    maxParticipants: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    category: Category;
    restaurant: Restaurant;
    organizer: UserInfo;
}