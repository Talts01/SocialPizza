import { useState } from "react";
import type { User } from "../context/UserContext";
import "./Login.css";

interface LoginProps {
    onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        // Reset errore precedente
        setError("");
        
        try {
            const response = await fetch("http://localhost:8081/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Una sola volta!
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                onLogin({ username: data.username, role: data.role }); 
            } else {
                setError("Credenziali non valide ❌");
            }
        } catch (err) {
            setError("Impossibile connettersi al server ⚠️");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>🍕 SocialPizza</h1>
                <p className="subtitle">Accedi per organizzare o partecipare!</p>
                
                {error && <div className="error-msg">{error}</div>}
                
                <div className="input-group">
                    <input 
                        type="text" 
                        className="login-input"
                        placeholder="Email (es. mario@gmail.com)" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    />
                </div>
                
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
                
                <button className="login-btn" onClick={handleSubmit}>
                    Accedi
                </button>
            </div>
        </div>
    );
}