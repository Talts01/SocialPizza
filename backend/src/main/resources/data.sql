-- Pulizia difensiva
DELETE FROM participation;
DELETE FROM social_event;
DELETE FROM restaurant;
DELETE FROM app_user;
DELETE FROM category;
DELETE FROM city;

-- 1. Utenti RISTORATORI (Rimosso is_verified e il valore FALSE)
INSERT INTO app_user (id, name, surname, email, password, role, bio)
VALUES (1, 'Luigi', 'Rossi', 'luigi@pizzeria.it', 'password123', 'RISTORATORE', 'Proprietario della Pizzeria Da Luigi');

INSERT INTO app_user (id, name, surname, email, password, role, bio)
VALUES (2, 'Walter', 'Bianchi', 'walter@pizzeria.it', 'password123', 'RISTORATORE', 'Gestore della Pizzeria da Walter');

-- 2. Utenti ADMIN (Resta ADMIN)
INSERT INTO app_user (id, name, surname, email, password, role, bio)
VALUES (3, 'Luigi', 'Niso', 'admin1@socialpizza.it', 'admin123', 'ADMIN', 'Admin di SocialPizza');

INSERT INTO app_user (id, name, surname, email, password, role, bio)
VALUES (4, 'Walter', 'Barucco', 'admin2@socialpizza.it', 'admin123', 'ADMIN', 'Admin di SocialPizza');

-- 3. Utente STANDARD (MODIFICA QUI: role = 'UTENTE')
INSERT INTO app_user (id, name, surname, email, password, role, bio)
VALUES (5, 'Mario', 'Rossi', 'mario@gmail.it', 'password123', 'UTENTE', 'Grande appassionato di pizza margherita!');


-- Città
INSERT INTO city (id, name, CAP) VALUES (1, 'Milano', '20100');
INSERT INTO city (id, name, CAP) VALUES (2, 'Torino', '10100');

-- Categorie
INSERT INTO category (id, name, description) VALUES (1, 'Anime e Manga', 'Serate dedicate all''animazione');
INSERT INTO category (id, name, description) VALUES (2, 'Sport e Calcio', 'Eventi a tema sportivo');
INSERT INTO category (id, name, description) VALUES (3, 'Giochi da Tavolo', 'Boardgame e serate in compagnia');
INSERT INTO category (id, name, description) VALUES (4, 'Altro', 'Altre tipologie di eventi');

-- Ristoranti
INSERT INTO restaurant (id, name, address, max_capacity, city_id, owner_id)
VALUES (1, 'Pizzeria da Luigi', 'via dante 1', 50, 1, 1);

INSERT INTO restaurant (id, name, address, max_capacity, city_id, owner_id)
VALUES (2, 'Pizzeria da Walter', 'via bossetti 22', 35, 2, 2);

-- --- NUOVO EVENTO PRE-APPROVATO ---
INSERT INTO social_event (id, title, event_date, max_participants, status, organizer_id, restaurant_id, category_id, description, moderator_comment, decision_date)
VALUES (
    1,
    'Pizza Champions League',
    '2025-05-20 20:45:00',
    15,
    'APPROVED',
    5, -- Mario
    2, -- Pizzeria da Walter
    2, -- Sport
    'Guardiamo la finale insieme mangiando una diavola!',
    'Accettato',
    CURRENT_TIMESTAMP
);

INSERT INTO participation (id, user_id, event_id, registration_date)
VALUES (1, 5, 1, CURRENT_TIMESTAMP);

-- Reset Contatori
ALTER TABLE app_user ALTER COLUMN id RESTART WITH 6;
ALTER TABLE city ALTER COLUMN id RESTART WITH 3;
ALTER TABLE category ALTER COLUMN id RESTART WITH 5;
ALTER TABLE restaurant ALTER COLUMN id RESTART WITH 3;
ALTER TABLE social_event ALTER COLUMN id RESTART WITH 2;
ALTER TABLE participation ALTER COLUMN id RESTART WITH 2;