// src/types.ts

// 1. Definiamo ed ESPORTIAMO "City" così gli altri file la trovano
export interface City {
    id: number;
    name: string;
}

export interface UserInfo {
    id: number;
    name: string; 
    email: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Restaurant {
    id: number;
    name: string;
    address: string;
    city?: City; 
}

export interface SocialEvent {
    id: number;
    title: string;
    description?: string;
    eventDate: string; 
    maxParticipants: number;
    rejectionReason?: string;
    moderatorComment?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    category: Category;
    restaurant: Restaurant;
    organizer: UserInfo;
}