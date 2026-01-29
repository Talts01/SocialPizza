import { useContext } from "react";
import type { PageType } from "../App";
import { UserContext } from "../context/UserContext";
import "./ContentNav.css";

// Props per la navigazione laterale
interface ContentNavProps {
    activePage: PageType;  
    onNavigate: (page: PageType) => void;  
}

// Componente di navigazione laterale
export function ContentNav({ activePage, onNavigate }: ContentNavProps) {
    const user = useContext(UserContext);  // Ottieni i dati dell'utente corrente
    
    // Funzione helper per applicare lo stile "active" alla pagina selezionata
    const getClass = (pageName: PageType) => 
        activePage === pageName ? "nav-item level-1 active" : "nav-item level-1";

    // Controlla se l'utente attuale è un amministratore
    const isAdmin = user?.role === "ADMIN";

    return (
        <nav className="content-nav">
            {/* Menu standard: visibile solo agli utenti non-admin */}
            {!isAdmin && (
                <>
                    <div 
                        className={getClass("organizza")} 
                        onClick={() => onNavigate("organizza")}
                        style={{fontWeight: 'bold'}}
                    >
                        🍕 Organizza Pizzata
                    </div>

                    <div 
                        className={getClass("eventi")} 
                        onClick={() => onNavigate("eventi")}
                    >
                        📅 Bacheca Eventi
                    </div>

                    <div 
                        className={getClass("richieste")} 
                        onClick={() => onNavigate("richieste")}
                    >
                        🎟 I Miei Eventi
                    </div>
                </>
            )}
        
            <div 
                className={getClass("dashboard")} 
                onClick={() => onNavigate("dashboard")}
            >
                📋 Stato Eventi
            </div>
            
            {/* Menu admin: visibile solo agli amministratori */}
            {isAdmin && (
                <div
                    className={getClass("admin")}
                    onClick={() => onNavigate("admin")}
                >
                    🛠 Area Admin
                </div>
            )}
        </nav>
    );
}