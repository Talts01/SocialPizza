import { createContext, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ContentNav } from './components/ContentNav';
import { Dashboard } from './components/Dashboard';
import { EventBoard } from './components/EventBoard';
import { EventDetail } from './components/EventDetail';
import { Header } from './components/Header';
import Login from './components/Login';
import { MyRequests } from './components/MyRequests';
import { RestaurantDashboard } from './components/RestaurantDashboard';

// 1. Definiamo il tipo Utente
export interface User {
    username: string;
    role: string;
}

// 2. Creiamo il Contesto Utente
export const UserContext = createContext<User | null>(null);

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Verifica se l'utente ha una sessione attiva all'avvio
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
    };

    // Mostra un loader mentre verifichiamo la sessione
    if (loading) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p>Caricamento...</p>
        </div>;
    }

    return (
        <BrowserRouter>
            <UserContext.Provider value={user}>
                <Toaster position="top-right" />
                <Header onLogout={handleLogout} />

                {user ? (
                    <section className="main">
                        <div className="left-col">
                            <ContentNav />
                        </div>
                        
                        <div className="center-area">
                            <Routes>
                                <Route path="/" element={<Navigate to="/eventi" replace />} />
                                <Route path="/eventi" element={<EventBoard />} />
                                <Route path="/eventi/:id" element={<EventDetail />} />
                                <Route path="/richieste" element={<MyRequests />} />
                                <Route path="/dashboard" element={user.role === "RESTAURATEUR" ? <RestaurantDashboard /> : <Dashboard />} />
                                <Route path="/amici" element={<h2>Qui vedrai la lista amici</h2>} />
                                <Route path="*" element={<Navigate to="/eventi" replace />} />
                            </Routes>
                        </div>
                    </section>
                ) : (
                    <Routes>
                        <Route path="*" element={<section className="login"><Login onLogin={(userData) => setUser(userData)} /></section>} />
                    </Routes>
                )}

                <footer style={{ backgroundColor: "#eee", padding: "10px", gridRow: "3 / 4", textAlign: "center", fontSize: "0.8rem" }}>
                    &copy; 2025 SocialPizza - Progetto Universitario
                </footer>
            </UserContext.Provider>
        </BrowserRouter>
    );
}

export default App;