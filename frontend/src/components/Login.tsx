import { useState } from "react";
import "./Login.css";

// Definiamo cosa "si aspetta" questo componente dal padre
interface LoginProps {
    onLogin: (user: any) => void; // Funzione che riceve i dati dell'utente
}

export default function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        try {
            // Chiamata al NOSTRO backend (porta 8081)
            const response = await fetch("http://localhost:8081/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                // Invece di navigare, chiamiamo la funzione passata dal padre
                onLogin(data); 
            } else {
                setError("Credenziali non valide");
            }
        } catch (err) {
            setError("Errore di connessione col server");
        }
        
            
    };

    return (
        <div className="login-form" style={{ padding: 20, border: "2px solid teal", borderRadius: 10, backgroundColor: "white" }}>
            <h1>SocialPizza Login</h1>
            {error && <p style={{color: "red"}}>{error}</p>}
            <div>
                <input 
                    type="text" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    style={{ display: "block", margin: "10px 0", padding: 5, width: "100%" }}
                />
            </div>
            <div>
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    style={{ display: "block", margin: "10px 0", padding: 5, width: "100%" }}
                />
            </div>
            <button onClick={handleSubmit} style={{ padding: "5px 15px", backgroundColor: "#fdffb9", border: "1px solid #ccc", cursor: "pointer" }}>
                Accedi
            </button>
        </div>
    );
}