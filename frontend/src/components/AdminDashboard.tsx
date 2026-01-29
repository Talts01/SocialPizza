import { useContext, useEffect, useMemo, useState, type FormEvent } from "react";
import { UserContext } from "../context/UserContext";
import type { Category, City } from "../types";
import "./AdminDashboard.css";

// URL base delle API per la gestione admin
const API_ADMIN = "http://localhost:8081/api/admin";
const API_RES = "http://localhost:8081/api/resources";

// Interfaccia per i dati dell'utente nella vista admin
interface AdminUser {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
}

interface AdminRestaurant {
    id: number;
    name: string;
    address: string;
    maxCapacity: number;
    city: City | null;
    owner: AdminUser | null;
}

interface CreateUserForm {
    name: string;
    surname: string;
    email: string;
    password: string;
    role: string;
    bio: string;
}

interface CreateRestaurantForm {
    name: string;
    address: string;
    maxCapacity: number;
    cityId?: number;
    ownerId?: number;
}

interface CreateCategoryForm {
    name: string;
    description: string;
}

// Dashboard principale per l'amministratore: gestione utenti, ristoranti e categorie
export function AdminDashboard() {
    const currentUser = useContext(UserContext);  

    // Stati per i dati caricati dalle API
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    // Stati UI generali
    const [loading, setLoading] = useState(true);
    const [generalError, setGeneralError] = useState("");

    // Stati per messaggi di feedback specifici per ogni sezione
    const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);  // Messaggi per utenti
    const [restMsg, setRestMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);  // Messaggi per ristoranti
    const [catMsg, setCatMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);  // Messaggi per categorie

    // Stati dei form per la creazione di nuovi elementi
    const [userForm, setUserForm] = useState<CreateUserForm>({
        name: "", surname: "", email: "", password: "", role: "UTENTE", bio: "",
    });

    const [restaurantForm, setRestaurantForm] = useState<CreateRestaurantForm>({
        name: "", address: "", maxCapacity: 0,
    });

    const [categoryForm, setCategoryForm] = useState<CreateCategoryForm>({
        name: "", description: "",
    });

    // Valori 
    const roleOptions = useMemo(() => ["ADMIN", "RISTORATORE", "UTENTE"], []);  // Ruoli disponibili
    
    const restaurateurUsers = useMemo(() => users.filter(u => u.role === "RISTORATORE"), [users]);  // Filtra solo i ristoratori
    
    const availableOwners = useMemo(
        () => restaurateurUsers.filter(u => !restaurants.some(r => r.owner?.id === u.id)),  // Ristoratori senza ristorante assegnato
        [restaurateurUsers, restaurants]
    );

    // Lista utenti ordinata 
    const sortedUsers = useMemo(() => {
        if (!currentUser?.username) return users;
        const myEmail = currentUser.username.trim().toLowerCase();

        const getRolePriority = (role: string) => {
            switch (role) {
                case "ADMIN": return 1;
                case "RISTORATORE": return 2;
                case "UTENTE": return 3;
                default: return 4;
            }
        };

        return [...users].sort((a, b) => {
            const emailA = a.email.trim().toLowerCase();
            const emailB = b.email.trim().toLowerCase();
            if (emailA === myEmail) return -1;
            if (emailB === myEmail) return 1;
            const priorityA = getRolePriority(a.role);
            const priorityB = getRolePriority(b.role);
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.id - b.id;
        });
    }, [users, currentUser]);

    // Funzione per caricare tutti i dati dall'API
    const loadData = async () => {
        setLoading(true);
        setGeneralError("");
        try {
            const [usersRes, restaurantsRes, categoriesRes, citiesRes] = await Promise.all([
                fetch(`${API_ADMIN}/users`, { credentials: "include" }),
                fetch(`${API_ADMIN}/restaurants`, { credentials: "include" }),
                fetch(`${API_ADMIN}/categories`, { credentials: "include" }),
                fetch(`${API_RES}/cities`, { credentials: "include" }),
            ]);

            if (!usersRes.ok || !restaurantsRes.ok || !categoriesRes.ok || !citiesRes.ok) {
                throw new Error("Errore nel caricamento dei dati admin");
            }

            setUsers(await usersRes.json());
            setRestaurants(await restaurantsRes.json());
            const catData: Category[] = await categoriesRes.json();
            
            const sortedCats = [...catData].sort((a, b) => {
                const isAAltro = a.name?.toLowerCase() === "altro";
                const isBAltro = b.name?.toLowerCase() === "altro";
                if (isAAltro && !isBAltro) return 1;
                if (!isAAltro && isBAltro) return -1;
                return a.name.localeCompare(b.name);
            });
            setCategories(sortedCats);
            setCities(await citiesRes.json());
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore sconosciuto";
            setGeneralError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handlers per la gestione degli utenti
    const handleCreateUser = async (evt: FormEvent) => {
        evt.preventDefault();
        setUserMsg(null);

        if (!userForm.name.trim() || !userForm.surname.trim() || !userForm.email.trim() || !userForm.password) {
            setUserMsg({ type: 'error', text: "Compila tutti i campi obbligatori" });
            return;
        }
        if (!userForm.email.includes("@")) {
            setUserMsg({ type: 'error', text: "Email non valida" });
            return;
        }
        if (userForm.password.length < 6) {
            setUserMsg({ type: 'error', text: "Password min 6 caratteri" });
            return;
        }

        try {
            const res = await fetch(`${API_ADMIN}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(userForm),
            });
            if (!res.ok) throw new Error(await res.text());
            
            await loadData();
            setUserForm({ name: "", surname: "", email: "", password: "", role: "UTENTE", bio: "" });
            setUserMsg({ type: 'success', text: "Utente creato con successo!" });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore creazione utente";
            setUserMsg({ type: 'error', text: msg });
        }
    };

    const handleRoleChange = async (userId: number, role: string) => {
        setGeneralError("");
        try {
            const res = await fetch(`${API_ADMIN}/users/${userId}/role?role=${encodeURIComponent(role)}`, {
                method: "PATCH",
                credentials: "include",
            });
            if (!res.ok) throw new Error(await res.text());
            await loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore aggiornamento ruolo";
            setGeneralError(msg);
        }
    };

    const handleBanUser = async (userId: number) => {
        if (!confirm("⚠️ Sei sicuro? Cancellare l'utente rimuoverà anche i suoi eventi e partecipazioni.")) return;
        setGeneralError("");
        try {
            const res = await fetch(`${API_ADMIN}/users/${userId}/ban`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error(await res.text());
            await loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore eliminazione utente";
            setGeneralError(msg);
        }
    };

    // Handlers per la gestione dei ristoranti
    const handleCreateRestaurant = async (evt: FormEvent) => {
        evt.preventDefault();
        setRestMsg(null);
        
        if (!restaurantForm.name.trim() || !restaurantForm.address.trim() || !restaurantForm.cityId || !restaurantForm.ownerId) {
            setRestMsg({ type: 'error', text: "Compila tutti i campi del ristorante" });
            return;
        }
        
        const payload = {
            name: restaurantForm.name,
            address: restaurantForm.address,
            maxCapacity: restaurantForm.maxCapacity,
            city: { id: restaurantForm.cityId },
            owner: { id: restaurantForm.ownerId }
        };

        try {
            const res = await fetch(`${API_ADMIN}/restaurants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            
            await loadData();
            setRestaurantForm({ name: "", address: "", maxCapacity: 0 });
            setRestMsg({ type: 'success', text: "Ristorante creato!" });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore creazione ristorante";
            setRestMsg({ type: 'error', text: msg });
        }
    };

    const handleDeleteRestaurant = async (id: number) => {
        if (!confirm("⚠️ Sei sicuro di voler eliminare questo ristorante?")) return;
        setGeneralError("");
        try {
            const res = await fetch(`${API_ADMIN}/restaurants/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error(await res.text());
            await loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore eliminazione ristorante";
            setGeneralError(msg);
        }
    };

    // Handlers per la gestione delle categorie
    const handleCreateCategory = async (evt: FormEvent) => {
        evt.preventDefault();
        setCatMsg(null);

        if (!categoryForm.name.trim()) {
            setCatMsg({ type: 'error', text: "Nome categoria obbligatorio" });
            return;
        }
        try {
            const res = await fetch(`${API_ADMIN}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(categoryForm),
            });
            if (!res.ok) throw new Error(await res.text());
            await loadData();
            setCategoryForm({ name: "", description: "" });
            setCatMsg({ type: 'success', text: "Categoria creata!" });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore creazione categoria";
            setCatMsg({ type: 'error', text: msg });
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm("⚠️ Sei sicuro di voler eliminare questa categoria?")) return;
        setGeneralError("");
        try {
            const res = await fetch(`${API_ADMIN}/categories/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error(await res.text());
            await loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore eliminazione categoria";
            setGeneralError(msg);
        }
    };

    // Componente helper per visualizzare messaggi di successo/errore
    const FeedbackMessage = ({ msg }: { msg: { type: string, text: string } | null }) => {
        if (!msg) return null;
        const style = {
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            color: msg.type === "error" ? "#D32F2F" : "#2E7D32",
            backgroundColor: msg.type === "error" ? "#FFEBEE" : "#E8F5E9",
            border: `1px solid ${msg.type === "error" ? "#FFCDD2" : "#C8E6C9"}`
        };
        return <div style={style}>{msg.text}</div>;
    };

    if (loading) return <div className="admin-card">Caricamento area admin...</div>;

    return (
        <div className="admin-grid">  
            {generalError && (
                <div style={{ gridColumn: "1 / -1", padding: "10px", background: "#FFEBEE", color: "#D32F2F", border: "1px solid red", borderRadius: "5px" }}>
                    {generalError}
                </div>
            )}

            {/* Sezione 1: Gestione utenti - crea nuovi utenti, modifica ruoli, elimina utenti */}
            <section className="admin-card">
                <header>
                    <h3>Utenti</h3>
                    <p>Gestisci ruoli e crea nuovi account</p>
                </header>
                <div className="list">
                    {sortedUsers.map(user => {
                        const myEmail = currentUser?.username?.trim().toLowerCase() || "";
                        const userEmail = user.email.trim().toLowerCase();
                        const isMe = myEmail === userEmail;
                        return (
                            <div key={user.id} className="row" style={isMe ? { border: "2px solid #2196F3", backgroundColor: "#E3F2FD" } : {}}>
                                <div>
                                    <strong>{user.email} {isMe && "(Tu)"}</strong>
                                    <div className="muted">{user.name} {user.surname}</div>
                                </div>
                                <div className="row-actions">
                                    <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} disabled={isMe}>
                                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    {!isMe && (
                                        <button type="button" className="btn-danger" onClick={() => handleBanUser(user.id)} title="Banna ed elimina">
                                            🚫
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <form className="form" onSubmit={handleCreateUser} autoComplete="off">
                    <h4>Nuovo utente</h4>
                    <FeedbackMessage msg={userMsg} />
                    <div className="grid-2">
                        <input placeholder="Nome" value={userForm.name} onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))} />
                        <input placeholder="Cognome" value={userForm.surname} onChange={e => setUserForm(prev => ({ ...prev, surname: e.target.value }))} />
                    </div>
                    <input placeholder="Email" value={userForm.email} onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))} />
                    <input placeholder="Password" type="password" value={userForm.password} onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))} autoComplete="new-password" />
                    <textarea placeholder="Bio (opzionale)" value={userForm.bio} onChange={e => setUserForm(prev => ({ ...prev, bio: e.target.value }))} />
                    <div className="grid-2">
                        <select value={userForm.role} onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}>
                            {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <button type="submit">Crea utente</button>
                </form>
            </section>

            {/* SEZIONE RISTORANTI */}
            <section className="admin-card">
                <header>
                    <h3>Pizzerie</h3>
                    <p>Crea o elimina ristoranti</p>
                </header>
                <div className="list">
                    {restaurants.map(rest => (
                        <div key={rest.id} className="row">
                            <div>
                                <strong>{rest.name}</strong>
                                <div className="muted">{rest.address}</div>
                                <div className="muted">Capienza: {rest.maxCapacity}</div>
                                <div className="muted">Città: {rest.city?.name ?? "-"}</div>
                                <div className="muted">Email: {rest.owner?.email ?? "-"}</div>
                            </div>
                            <div className="row-actions">
                                <button type="button" onClick={() => handleDeleteRestaurant(rest.id)}>Elimina</button>
                            </div>
                        </div>
                    ))}
                </div>

                <form className="form" onSubmit={handleCreateRestaurant}>
                    <h4>Nuovo ristorante</h4>
                    <FeedbackMessage msg={restMsg} />
                    <input placeholder="Nome" value={restaurantForm.name} onChange={e => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))} />
                    <input placeholder="Indirizzo" value={restaurantForm.address} onChange={e => setRestaurantForm(prev => ({ ...prev, address: e.target.value }))} />
                    <label className="field-label">Capienza: 
                        <input type="number" placeholder="Es. 80" value={restaurantForm.maxCapacity} onChange={e => setRestaurantForm(prev => ({ ...prev, maxCapacity: parseInt(e.target.value || "0", 10) }))} />
                    </label>
                    <div className="grid-2">
                        <select value={restaurantForm.cityId ?? ""} onChange={e => setRestaurantForm(prev => ({ ...prev, cityId: e.target.value ? Number(e.target.value) : undefined }))}>
                            <option value="">-- Città --</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={restaurantForm.ownerId ?? ""} onChange={e => setRestaurantForm(prev => ({ ...prev, ownerId: e.target.value ? Number(e.target.value) : undefined }))}>
                            <option value="">-- Ristoratore --</option>
                            {availableOwners.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Crea ristorante</button>
                </form>
            </section>

            {/* SEZIONE CATEGORIE */}
            <section className="admin-card">
                <header>
                    <h3>Temi</h3>
                    <p>Gestisci i temi</p>
                </header>
                <div className="list">
                    {categories.map(cat => (
                        <div key={cat.id} className="row">
                            <div>
                                <strong>{cat.name}</strong>
                                <div className="muted">{cat.description}</div>
                            </div>
                            <div className="row-actions">
                                <button type="button" onClick={() => handleDeleteCategory(cat.id)}>Elimina</button>
                            </div>
                        </div>
                    ))}
                </div>

                <form className="form" onSubmit={handleCreateCategory}>
                    <h4>Nuova categoria</h4>
                    <FeedbackMessage msg={catMsg} />
                    <input placeholder="Nome" value={categoryForm.name} onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} />
                    <textarea placeholder="Descrizione" value={categoryForm.description} onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} />
                    <button type="submit">Crea categoria</button>
                </form>
            </section>
        </div>
    );
}