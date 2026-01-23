import { createContext, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { ContentNav } from './components/ContentNav';
import { EventBoard } from './components/EventBoard';
import { Header } from './components/Header';
import Login from './components/Login';
import { MyRequests } from './components/MyRequests';
import { OrganizeEvent } from './components/OrganizeEvent'; // IMPORTA IL NUOVO FILE
import { RestaurantDashboard } from './components/RestaurantDashboard';

export interface User {
    username: string;
    role: string;
}

// 1. AGGIUNTO "organizza" AI TIPI DI PAGINA
export type PageType = "eventi" | "richieste" | "dashboard" | "organizza";

export const UserContext = createContext<User | null>(null);

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState<PageType>("eventi");
    
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/auth/me", {
                    credentials: "include"
                });
                if (response.ok) {
                    const sessionData = await response.json();
                    setUser({ username: sessionData.username, role: sessionData.role });
                }
            } catch (error) {
                console.error("Errore verifica sessione", error);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8081/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (error) {
            console.error("Errore logout", error);
        }
        setUser(null);
        setCurrentPage("eventi");
    };

    const handleNavigate = (page: PageType) => {
        setCurrentPage(page);
    };

    if (loading) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p>Caricamento...</p>
        </div>;
    }

    let mainContent;
    switch (currentPage) {
        case "eventi":
            mainContent = <EventBoard />;
            break;
            
        case "richieste":
            mainContent = <MyRequests defaultTab="joined" />;
            break;
            
        case "dashboard":
            mainContent = user?.role === "RESTAURATEUR" 
                ? <RestaurantDashboard /> 
                : <MyRequests defaultTab="created" />;
            break;

        // 2. NUOVO CASO PER LA PAGINA ORGANIZZA
        case "organizza":
            // Passiamo handleNavigate così dopo aver creato l'evento può reindirizzarci
            mainContent = <OrganizeEvent onNavigate={handleNavigate} />;
            break;
            
        default:
            mainContent = <EventBoard />;
    }

    return (
        <UserContext.Provider value={user}>
            <Toaster position="top-right" />
            <Header onLogout={handleLogout} />

            {user ? (
                <section className="main">
                    <div className="left-col">
                        <ContentNav 
                            activePage={currentPage} 
                            onNavigate={handleNavigate} 
                        />
                    </div>
                    <div className="center-area">
                        {mainContent}
                    </div>
                </section>
            ) : (
                <section className="login">
                    <Login onLogin={(userData: any) => setUser(userData)} />
                </section>
            )}

            <footer style={{ backgroundColor: "#eee", padding: "10px", gridRow: "3 / 4", textAlign: "center", fontSize: "0.8rem" }}>
                &copy; 2025 SocialPizza - Progetto Universitario
            </footer>
        </UserContext.Provider>
    );
}

export default App;