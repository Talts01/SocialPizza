import { useContext } from "react";
import "./Header.css";
// Importiamo il Context per leggere i dati dell'utente
import { UserContext } from "../App";

interface HeaderProps {
    onLogout: () => void;
    onNavigateHome?: () => void;
}

export function Header({ onLogout, onNavigateHome }: HeaderProps) {
    // 1. Recuperiamo l'utente dal contesto
    const user = useContext(UserContext);

    return (
        <header>
            <div className="logo" onClick={onNavigateHome} style={{cursor: 'pointer'}}>
                🍕 SocialPizza
            </div>
            
            {/* 2. Mostriamo il menu utente SOLO se l'utente esiste */}
            {user && (
                <nav className="user-nav">
                    {/* Mostriamo il nome utente */}
                    <div className="nav-item">
                        {user.username}
                    </div>
                    
                    {/* Tasto Esci */}
                    <div 
                        className="nav-item" 
                        onClick={onLogout} 
                        style={{cursor: 'pointer'}}
                    >
                        Esci
                    </div>
                </nav>
            )}
        </header>
    );
}