import {  useContext } from "react";
import "./Header.css";
import { UserContext } from "../App"; // Importiamo il contesto che creeremo

interface HeaderProps {
    onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
    // Recuperiamo l'utente dal contesto globale
    const user = useContext(UserContext);

    return (
        <header>
            <div className="logo">
                {/* Se hai un'immagine logo.png mettila, altrimenti testo */}
                🍕 SocialPizza
            </div>
            
            {/* Mostriamo il menu utente solo se user non è null */}
            {user ? (
                <nav className="user-nav">
                    <div className="nav-item">Ciao, {user.username}</div>
                    <div className="nav-item" onClick={onLogout}>Esci</div>
                </nav>
            ) : (
                <></> 
            )}
        </header>
    );
}