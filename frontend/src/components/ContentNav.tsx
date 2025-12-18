import { useState } from "react";
import "./ContentNav.css";

// 1. Modifica il TIPO (togli 'crea-evento', aggiungi 'richieste')
export type ContentNavItem = "eventi" | "richieste" | "dashboard" | "amici"; 

interface ContentNavProps {
    onNav: (target: ContentNavItem) => void;
}

export function ContentNav({ onNav }: ContentNavProps) {
    const [activeItem, setActiveItem] = useState<ContentNavItem>("eventi");

    function handleNav(target: ContentNavItem) {
        setActiveItem(target);
        onNav(target);
    }

    const getClass = (target: ContentNavItem) => 
        target === activeItem ? "nav-item active" : "nav-item";

    return (
        <nav className="content-nav">
            <div className={getClass("eventi")} onClick={() => handleNav("eventi")}>
                📅 Bacheca Eventi
            </div>
            
            {/* 2. Nuova Voce RICHIESTE */}
            <div className={getClass("dashboard")} onClick={() => handleNav("dashboard")}>
                📊 Iscrizioni
            </div>
            <div className={getClass("richieste")} onClick={() => handleNav("richieste")}>
                📨 Le mie Richieste
            </div>

            

            <div className={getClass("amici")} onClick={() => handleNav("amici")}>
                👥 Amici
            </div>
        </nav>
    );
}