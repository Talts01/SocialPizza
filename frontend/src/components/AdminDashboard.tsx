import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { Category, City } from "../types";
import "./AdminDashboard.css";

const API_ADMIN = "http://localhost:8081/api/admin";
const API_RES = "http://localhost:8081/api/resources";

interface AdminUser {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    isVerified: boolean;
}

interface AdminRestaurant {
    id: number;
    name: string;
    address: string;
    maxCapacity: number;
    cityId: number | null;
    ownerId: number | null;
}

interface CreateUserForm {
    name: string;
    surname: string;
    email: string;
    password: string;
    role: string;
    isVerified: boolean;
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

export function AdminDashboard() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userForm, setUserForm] = useState<CreateUserForm>({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: "USER",
        isVerified: false,
        bio: "",
    });

    const [restaurantForm, setRestaurantForm] = useState<CreateRestaurantForm>({
        name: "",
        address: "",
        maxCapacity: 0,
    });

    const [categoryForm, setCategoryForm] = useState<CreateCategoryForm>({
        name: "",
        description: "",
    });

    const roleOptions = useMemo(() => ["ADMIN", "RESTAURATEUR", "USER"], []);
    const restaurateurUsers = useMemo(() => users.filter(u => u.role === "RESTAURATEUR"), [users]);
    const availableOwners = useMemo(
        () => restaurateurUsers.filter(u => !restaurants.some(r => r.ownerId === u.id)),
        [restaurateurUsers, restaurants]
    );

    const loadData = async () => {
        setLoading(true);
        setError(null);
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
            // Sposta "Altro" in fondo se presente
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
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateUser = async (evt: FormEvent) => {
        evt.preventDefault();
        setError(null);
        
        // Validazioni frontend
        if (!userForm.name.trim()) {
            setError("Nome obbligatorio");
            toast.error("Nome obbligatorio");
            return;
        }
        if (!userForm.surname.trim()) {
            setError("Cognome obbligatorio");
            toast.error("Cognome obbligatorio");
            return;
        }
        if (!userForm.email.trim()) {
            setError("Email obbligatoria");
            toast.error("Email obbligatoria");
            return;
        }
        if (!userForm.email.includes("@")) {
            setError("Email non valida");
            toast.error("Email non valida");
            return;
        }
        if (!userForm.password || userForm.password.length < 6) {
            setError("Password deve avere almeno 6 caratteri");
            toast.error("Password deve avere almeno 6 caratteri");
            return;
        }
        
        try {
            const res = await fetch(`${API_ADMIN}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(userForm),
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await loadData();
            setUserForm({ name: "", surname: "", email: "", password: "", role: "USER", isVerified: false, bio: "" });
            toast.success("Utente creato");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore creazione utente";
            setError(msg);
            toast.error(msg);
        }
    };

    const handleRoleChange = async (userId: number, role: string) => {
        setError(null);
        try {
            const res = await fetch(`${API_ADMIN}/users/${userId}/role?role=${encodeURIComponent(role)}`, {
                method: "PATCH",
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore aggiornamento ruolo";
            setError(msg);
        }
    };

    const handleBanUser = async (userId: number) => {
        if (!confirm("Sei sicuro di voler bannare questo utente? Questa azione è irreversibile.")) {
            return;
        }
        setError(null);
        try {
            const res = await fetch(`${API_ADMIN}/users/${userId}/ban`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await loadData();
            toast.success("Utente bannato");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore eliminazione utente";
            setError(msg);
            toast.error(msg);
        }
    };

    const handleCreateRestaurant = async (evt: FormEvent) => {
        evt.preventDefault();
        setError(null);
        
        // Validazioni frontend
        if (!restaurantForm.name.trim()) {
            setError("Nome ristorante obbligatorio");
            toast.error("Nome ristorante obbligatorio");
            return;
        }
        if (!restaurantForm.address.trim()) {
            setError("Indirizzo obbligatorio");
            toast.error("Indirizzo obbligatorio");
            return;
        }
        if (!restaurantForm.cityId) {
            setError("Città obbligatoria");
            toast.error("Città obbligatoria");
            return;
        }
        if (!restaurantForm.ownerId) {
            setError("Proprietario obbligatorio");
            toast.error("Proprietario obbligatorio");
            return;
        }
        
        try {
            const res = await fetch(`${API_ADMIN}/restaurants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(restaurantForm),
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await loadData();
            setRestaurantForm({ name: "", address: "", maxCapacity: 0 });
            toast.success("Ristorante creato");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore creazione ristorante";
            setError(msg);
            toast.error(msg);
        }
    };

    const handleDeleteRestaurant = async (id: number) => {
        setError(null);
        try {
            const res = await fetch(`${API_ADMIN}/restaurants/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore eliminazione ristorante";
            setError(msg);
        }
    };

    const handleCreateCategory = async (evt: FormEvent) => {
        evt.preventDefault();
        setError(null);
        
        // Validazioni frontend
        if (!categoryForm.name.trim()) {
            setError("Nome categoria obbligatorio");
            toast.error("Nome categoria obbligatorio");
            return;
        }
        
        try {
            const res = await fetch(`${API_ADMIN}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(categoryForm),
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await loadData();
            setCategoryForm({ name: "", description: "" });
            toast.success("Categoria creata");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore creazione categoria";
            setError(msg);
            toast.error(msg);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        setError(null);
        try {
            const res = await fetch(`${API_ADMIN}/categories/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Errore eliminazione categoria";
            setError(msg);
        }
    };

    if (loading) return <div className="admin-card">Caricamento area admin...</div>;

    return (
        <div className="admin-grid">
            <section className="admin-card">
                <header>
                    <h3>Utenti</h3>
                    <p>Gestisci ruoli e crea nuovi account</p>
                </header>
                <div className="list">
                    {users.map(user => (
                        <div key={user.id} className="row">
                            <div>
                                <strong>{user.email}</strong>
                                <div className="muted">{user.name} {user.surname}</div>
                            </div>
                            <div className="row-actions">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                >
                                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {user.isVerified && <span className="pill">Verificato</span>}
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => handleBanUser(user.id)}
                                    title="Banna utente"
                                >
                                    🚫 Ban
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <form className="form" onSubmit={handleCreateUser}>
                    <h4>Nuovo utente</h4>
                    <div className="grid-2">
                        <input placeholder="Nome" value={userForm.name} onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))} />
                        <input placeholder="Cognome" value={userForm.surname} onChange={e => setUserForm(prev => ({ ...prev, surname: e.target.value }))} />
                    </div>
                    <input placeholder="Email" value={userForm.email} onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))} />
                    <input placeholder="Password" type="password" value={userForm.password} onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))} />
                    <textarea placeholder="Bio (opzionale)" value={userForm.bio} onChange={e => setUserForm(prev => ({ ...prev, bio: e.target.value }))} />
                    <div className="grid-2">
                        <select value={userForm.role} onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}>
                            {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <label className="checkbox">
                            <input type="checkbox" checked={userForm.isVerified} onChange={e => setUserForm(prev => ({ ...prev, isVerified: e.target.checked }))} />
                            Verificato
                        </label>
                    </div>
                    <button type="submit">Crea utente</button>
                </form>
            </section>

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
                            </div>
                            <div className="row-actions">
                                <div className="muted">Città: {cities.find(c => c.id === rest.cityId)?.name ?? "-"}</div>
                                <div className="muted">Owner: {users.find(u => u.id === rest.ownerId)?.email ?? rest.ownerId ?? "-"}</div>
                                <button type="button" onClick={() => handleDeleteRestaurant(rest.id)}>Elimina</button>
                            </div>
                        </div>
                    ))}
                </div>

                <form className="form" onSubmit={handleCreateRestaurant}>
                    <h4>Nuovo ristorante</h4>
                    <input placeholder="Nome" value={restaurantForm.name} onChange={e => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))} />
                    <input placeholder="Indirizzo" value={restaurantForm.address} onChange={e => setRestaurantForm(prev => ({ ...prev, address: e.target.value }))} />
                    <label className="field-label">Capienza massima: 
                        <input
                            type="number"
                            placeholder="Es. 80"
                            value={restaurantForm.maxCapacity}
                            onChange={e => setRestaurantForm(prev => ({ ...prev, maxCapacity: parseInt(e.target.value || "0", 10) }))}
                        />
                    </label>
                    <div className="grid-2">
                        <select value={restaurantForm.cityId ?? ""} onChange={e => setRestaurantForm(prev => ({ ...prev, cityId: e.target.value ? Number(e.target.value) : undefined }))}>
                            <option value="">Città</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={restaurantForm.ownerId ?? ""} onChange={e => setRestaurantForm(prev => ({ ...prev, ownerId: e.target.value ? Number(e.target.value) : undefined }))}>
                            <option value="">Ristoratore</option>
                            {availableOwners.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Crea ristorante</button>
                </form>
            </section>

            <section className="admin-card">
                <header>
                    <h3>Temi (Categorie)</h3>
                    <p>Gestisci i temi per gli eventi</p>
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
                    <input placeholder="Nome" value={categoryForm.name} onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} />
                    <textarea placeholder="Descrizione" value={categoryForm.description} onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} />
                    <button type="submit">Crea categoria</button>
                </form>
            </section>
        </div>
    );
}
