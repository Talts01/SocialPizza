import { createContext } from "react";

export interface User {
    username: string;
    role: string;
}

export const UserContext = createContext<User | null>(null);
