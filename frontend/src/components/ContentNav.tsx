import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./ContentNav.css";

export function ContentNav() {
    const location = useLocation();
    
    const getClass = (path: string) => 
        location.pathname === path ? "nav-item active" : "nav-item";

    return (
        <nav className="content-nav">
            <Link to="/eventi" className={getClass("/eventi")}>
                📅 Bacheca Eventi
            </Link>
            
            <Link to="/dashboard" className={getClass("/dashboard")}>
                📊 Dashboard
            </Link>
            
            <Link to="/richieste" className={getClass("/richieste")}>
                📨 I Miei Eventi
            </Link>

            <Link to="/amici" className={getClass("/amici")}>
                👥 Amici
            </Link>
        </nav>
    );
}