import { useState } from "react";
import type { User } from "../context/UserContext";
import "./Login.css";

interface LoginProps {
    onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
    // campi e messaggio di errore
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Invia le credenziali al backend
    const handleSubmit = async () => {
        setError("");
        try {
            const response = await fetch("http://localhost:8081/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // include cookie di sessione
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                    const data = await response.json();
                    onLogin({ 
                        username: data.username, 
                        name: data.name, 
                        role: data.role 
                    }); 
            } else {
                // Mostra messaggio per credenziali errate
                setError("Credenziali non valide ❌");
            }
        } catch (err) {
            // Messaggio generico in caso di errore di rete
            setError("Impossibile connettersi al server ⚠️");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>🍕 SocialPizza</h1>
                <p className="subtitle">Accedi per organizzare o partecipare!</p>
                
                {/* Mostra messaggio di errore se presente */}
                {error && <div className="error-msg">{error}</div>}
                
                {/*email*/}
                <div className="input-group">
                    <input 
                        type="text" 
                        className="login-input"
                        placeholder="Email (es. mario@gmail.it)" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    />
                </div>
                
                {/*password*/}
                <div className="input-group">
                    <input 
                        type="password" 
                        className="login-input"
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    />
                </div>
                
                {/* Pulsante invio*/}
                <button className="login-btn" onClick={handleSubmit}>
                    Accedi
                </button>
            </div>
        </div>
    );
}