import { createContext } from "react";

// Interfaccia che rappresenta un utente autenticato
export interface User {
    username: string; 
    name: string;     
    role: string;
}

// Contesto globale che contiene i dati dell'utente corrente
export const UserContext = createContext<User | null>(null);