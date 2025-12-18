import { createContext, useState } from 'react';
import './App.css';
import Login from './components/Login';
import { Header } from './components/Header';     
import { ContentNav, type ContentNavItem } from './components/ContentNav'; 
import { EventBoard } from './components/EventBoard';
import { Dashboard } from './components/Dashboard';
import { MyRequests } from './components/MyRequests';

// 1. Definiamo il tipo Utente
export interface User {
    username: string;
    role: string;
}

// 2. Creiamo il Contesto Utente (come la prof)
// Questo permette all'Header di leggere l'utente senza passarlo come prop diretta ogni volta
export const UserContext = createContext<User | null>(null);

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<ContentNavItem>("eventi");

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8081/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Errore logout", error);
        }
        setUser(null);
    };

    // 3. Logica per decidere cosa mostrare al centro
    let mainContent;
    switch (currentPage) {
        case "eventi":
            mainContent = <EventBoard />;
            break;
        case "richieste":
            mainContent = <MyRequests />;
            break;
        case "amici":
            mainContent = <h2>Qui vedrai la lista amici</h2>;
            break;
        case "dashboard":
            mainContent = <Dashboard />;
            break;
        default:
            mainContent = <h2>Benvenuto</h2>;
    }

    return (
        // Avvolgiamo tutto nel Provider del Contesto
        <UserContext.Provider value={user}>
            
            <Header onLogout={handleLogout} />

            {user ? (
                // SE LOGGATO: Struttura a due colonne (Menu Sinistra + Contenuto)
                <section className="main">
                    <div className="left-col">
                        <ContentNav onNav={(page) => setCurrentPage(page)} />
                    </div>
                    
                    <div className="center-area">
                        {mainContent}
                    </div>
                </section>
            ) : (
                // SE NON LOGGATO: Schermata Login
                <section className="login">
                    <Login onLogin={(userData) => setUser(userData)} />
                </section>
            )}

            {/* Footer (Possiamo creare un componente a parte come la prof, per ora semplice) */}
            <footer style={{ backgroundColor: "#eee", padding: "10px", gridRow: "3 / 4", textAlign: "center", fontSize: "0.8rem" }}>
                &copy; 2025 SocialPizza - Progetto Universitario
            </footer>

        </UserContext.Provider>
    );
}

export default App;