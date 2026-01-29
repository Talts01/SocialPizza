
// Interfaccia per rappresentare una città
export interface City {
    id: number;
    name: string;
}

// Interfaccia per i dati dell'utente
export interface UserInfo {
    id: number;
    name: string; 
    email: string;
}

// Interfaccia per le categorie degli eventi
export interface Category {
    id: number;
    name: string;
    description: string;
}

// Interfaccia per i dati del ristorante
export interface Restaurant {
    id: number;
    name: string;
    address: string;
    city?: City;  // Città facoltativa
    owner?: UserInfo;  // Proprietario facoltativo
}

// Interfaccia informazioni complete
export interface SocialEvent {
    id: number;
    title: string;
    description?: string;  
    eventDate: string;  // Data dell'evento
    maxParticipants: number;  // Numero massimo di partecipanti
    rejectionReason?: string;  // Motivo del rifiuto se l'evento è stato respinto
    moderatorComment?: string;  // Commenti del moderatore
    status: "PENDING" | "APPROVED" | "REJECTED";  // Stato dell'evento
    category: Category;  // Categoria dell'evento
    restaurant: Restaurant;  // Ristorante dove si terrà l'evento
    organizer: UserInfo;  // Chi ha organizzato l'evento
}