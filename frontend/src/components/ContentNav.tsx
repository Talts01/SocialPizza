import "./ContentNav.css";
import type { PageType } from "../App";

interface ContentNavProps {
    activePage: PageType;
    onNavigate: (page: PageType) => void;
}

export function ContentNav({ activePage, onNavigate }: ContentNavProps) {
    
    const getClass = (pageName: PageType) => 
        activePage === pageName ? "nav-item level-1 active" : "nav-item level-1";

    return (
        <nav className="content-nav">
            <div 
                className={getClass("eventi")} 
                onClick={() => onNavigate("eventi")}
                style={{cursor: "pointer"}}
            >
                📅 Bacheca Eventi
            </div>

            <div 
                className={getClass("richieste")} 
                onClick={() => onNavigate("richieste")}
                style={{cursor: "pointer"}}
            >
                🎟 I Miei Eventi
            </div>
            
            <div 
                className={getClass("dashboard")} 
                onClick={() => onNavigate("dashboard")}
                style={{cursor: "pointer"}}
            >
                📋 Stato Eventi
            </div>
            
            
            <div 
                className={getClass("organizza")} 
                onClick={() => onNavigate("organizza")}
                style={{cursor: "pointer", fontWeight: "bold", color: "#e65100"}}
            >
                🍕 Organizza Pizzata
            </div>
        </nav>
    );
}