import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
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
        } catch (err: any) {
            setError(err.message || "Errore sconosciuto");
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
        } catch (err: any) {
            setError(err.message || "Errore creazione utente");
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
        } catch (err: any) {
            setError(err.message || "Errore aggiornamento ruolo");
        }
    };

    const handleCreateRestaurant = async (evt: FormEvent) => {
        evt.preventDefault();
        setError(null);
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
        } catch (err: any) {
            setError(err.message || "Errore creazione ristorante");
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
        } catch (err: any) {
            setError(err.message || "Errore eliminazione ristorante");
        }
    };

    const handleCreateCategory = async (evt: FormEvent) => {
        evt.preventDefault();
        setError(null);
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
        } catch (err: any) {
            setError(err.message || "Errore creazione categoria");
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
        } catch (err: any) {
            setError(err.message || "Errore eliminazione categoria");
        }
    };

    if (loading) return <div className="admin-card">Caricamento area admin...</div>;
    if (error) return <div className="admin-card error">{error}</div>;

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
                            {restaurateurUsers.map(u => (
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
