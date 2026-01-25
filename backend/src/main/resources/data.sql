-- Seed di base simulando inserimenti via area admin
-- Pulizia difensiva (ordine FK: participation -> social_event -> restaurant -> app_user -> category -> city)
DELETE FROM participation;
DELETE FROM social_event;
DELETE FROM restaurant;
DELETE FROM app_user;
DELETE FROM category;
DELETE FROM city;

-- Utenti ristoratori (ID espliciti per evitare subquery multiple)
INSERT INTO app_user (id, name, surname, email, password, role, is_verified, bio)
VALUES (1, 'Luigi', 'Rossi', 'luigi@pizzeria.it', 'password123', 'RESTAURATEUR', FALSE, 'Proprietario della Pizzeria Da Luigi');

INSERT INTO app_user (id, name, surname, email, password, role, is_verified, bio)
VALUES (2, 'Walter', 'Bianchi', 'walter@pizzeria.it', 'password123', 'RESTAURATEUR', FALSE, 'Gestore della Pizzeria da Walter');

INSERT INTO app_user (id, name, surname, email, password, role, is_verified, bio)
VALUES (3, 'Luigi', 'Niso', 'admin1@socialpizza.it', 'admin123', 'ADMIN', TRUE, 'Admin di SocialPizza');

INSERT INTO app_user (id, name, surname, email, password, role, is_verified, bio)
VALUES (4, 'Walter', 'Barucco', 'admin2@socialpizza.it', 'admin123', 'ADMIN', TRUE, 'Admin di SocialPizza');


-- Città
INSERT INTO city (id, name, CAP) VALUES (1, 'Milano', '20100');
INSERT INTO city (id, name, CAP) VALUES (2, 'Torino', '10100');

-- Categorie
INSERT INTO category (id, name, description) VALUES (1, 'Anima e Manga', 'Serate dedicate all''animazione');
INSERT INTO category (id, name, description) VALUES (2, 'Sport e Calcio', 'Eventi a tema sportivo');
INSERT INTO category (id, name, description) VALUES (3, 'Giochi da Tavolo', 'Boardgame e serate in compagnia');
INSERT INTO category (id, name, description) VALUES (4, 'Altro', 'Altre tipologie di eventi');

-- Ristoranti
INSERT INTO restaurant (id, name, address, max_capacity, city_id, owner_id)
VALUES (1, 'Pizzeria da Luigi', 'via dante 1', 50, 1, 1);

INSERT INTO restaurant (id, name, address, max_capacity, city_id, owner_id)
VALUES (2, 'Pizzeria da Walter', 'via bossetti 22', 35, 1, 2);

-- Riallinea gli auto-increment per evitare collisioni con nuovi insert
ALTER TABLE app_user ALTER COLUMN id RESTART WITH 5;
ALTER TABLE city ALTER COLUMN id RESTART WITH 3;
ALTER TABLE category ALTER COLUMN id RESTART WITH 5;
ALTER TABLE restaurant ALTER COLUMN id RESTART WITH 3;
