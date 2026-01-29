import { useContext } from "react";
import "./Header.css";
import { UserContext } from "../context/UserContext";

// Props del componente Header:
interface HeaderProps {
    onLogout: () => void | Promise<void>; // eseguire il logout
}

export function Header({ onLogout }: HeaderProps) {
    // Ottiene l'utente corrente
    const user = useContext(UserContext);

    return (
        <header>
            <div className="logo">
                🍕 SocialPizza
            </div>

            {user && (
                <nav className="user-nav">
                    <div className="nav-item">
                        {user.name} ({user.role})
                    </div>
                    
                    <div 
                        className="nav-item" 
                        onClick={() => { onLogout(); }} 
                        style={{cursor: 'pointer'}}
                    >
                        Esci
                    </div>
                </nav>
            )}
        </header>
    );
}