
// Definiamo l'URL base del nostro Backend (nota la porta 8081)
const API_URL = 'http://localhost:8081/api/auth';

// Questa funzione accetta email e password e le manda al server
export const loginUser = async (email: string, password: string) => {
    
    // 1. Facciamo la chiamata fetch (POST)
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Diciamo al server che stiamo mandando dati JSON
        },
        credentials: 'include', // ✅ invia il cookie di sessione al backend (persistenza login)
        body: JSON.stringify({ email, password }), // Trasformiamo i dati in stringa JSON
    });

    // 2. Controlliamo se la risposta è OK (Status 200)
    if (!response.ok) {
        // Se non è ok (es. password errata), leggiamo l'errore e lanciamo un'eccezione
        const errorText = await response.text(); 
        throw new Error(errorText || 'Errore durante il login');
    }

    // 3. Se è tutto ok, ritorniamo i dati dell'utente (che contengono ID, Nome, Ruolo...)
    return await response.json();
};