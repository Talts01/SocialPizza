import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import './App.css';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminEventList } from './components/AdminEventList';
import { ContentNav } from './components/ContentNav';
import { EventBoard } from './components/EventBoard';
import { Header } from './components/Header';
import Login from  './components/Login';
import { MyJoinedEvents } from './components/MyJoinedEvents'; 
import { MyCreatedEvents } from './components/MyCreatedEvents'; 
import { OrganizeEvent } from './components/OrganizeEvent';
import { RestaurantDashboard } from './components/RestaurantDashboard';
import { UserContext, type User } from './context/UserContext';

// Tipo per le pagine disponibili nell'applicazione
export type PageType = "eventi" | "richieste" | "creati" | "dashboard" | "organizza" | "admin";

function App() {
    // Gestione stato dell'applicazione: utente loggato, caricamento e pagina corrente
    const [user, setUser] = useState<User | null>(null);  // Dati utente loggato
    const [loading, setLoading] = useState(true);  // Flag per lo schermo di caricamento iniziale
    const [currentPage, setCurrentPage] = useState<PageType>("eventi");  // Pagina attualmente visualizzata

    // Verifica la sessione dell'utente al caricamento iniziale
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/auth/me", {
                    credentials: "include"
                });

                if (response.ok) {
                    const sessionData = await response.json();
                    setUser({ 
                        username: sessionData.username, 
                        name: sessionData.name, 
                        role: sessionData.role 
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Errore check session:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    // Gestisce il logout dell'utente
    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8081/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            setUser(null);
            setCurrentPage("eventi");
            alert("Logout effettuato"); 
        } catch (error) {
            console.error("Errore logout", error);
            alert("Errore durante il logout"); 
        }
    };
    // Gestisce la navigazione tra le pagine
    const handleNavigate = (page: PageType) => {
        setCurrentPage(page);
    };

    // Schermata di caricamento iniziale
    if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Caricamento in corso...</p>;

    // Determina il contenuto principale in base alla pagina selezionata e al ruolo dell'utente
    let mainContent: ReactNode = null;
    switch (currentPage) {
        case "eventi":
            mainContent = user?.role === "ADMIN" ? <AdminEventList /> : <EventBoard />;
            break;
            
        case "richieste":
            mainContent = <MyJoinedEvents />;
            break;
        case "creati":
            mainContent = <MyCreatedEvents />;
            break;
        
            
        case "dashboard":
            if (user?.role === "RISTORATORE") {
                mainContent = <RestaurantDashboard />;
            } else if (user?.role === "ADMIN") {
                mainContent = <AdminEventList />;
            } else {
                mainContent = <MyCreatedEvents />;
            }
            break;

        case "admin":
            mainContent = user?.role === "ADMIN"
                ? <AdminDashboard />
                : <EventBoard />;
            break;

        case "organizza":
            mainContent = <OrganizeEvent onNavigate={handleNavigate} />;
            break;
            
        default:
            mainContent = <EventBoard />;
    }

    return (
        // Provider che fornisce i dati dell'utente a tutti i componenti figli
        <UserContext.Provider value={user}>
            <Header 
                onLogout={() => { handleLogout(); }} 
            />
            {user ? (
                // Utente loggato: mostra navigazione e contenuto principale
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
                // Utente non loggato: mostra il form di login
                <section className="login">
                    <Login onLogin={(userData) => setUser(userData)} />
                </section>
            )}
            <footer className="main-footer">
                    &copy; 2025 SocialPizza - Progetto TWEB - Barucco Walter, Luigi Niso
            </footer>
        </UserContext.Provider>
    );
}

export default App;