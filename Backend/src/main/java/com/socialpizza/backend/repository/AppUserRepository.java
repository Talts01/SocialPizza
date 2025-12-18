package com.socialpizza.backend.repository;

import com.socialpizza.backend.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {


    Optional<AppUser> findByEmail(String email);

}
//Spiegazione: Cos'è e a cosa serve il Repository
//Guardiamo la riga chiave: public interface AppUserRepository extends JpaRepository<AppUser, Long>


//È un'Interfaccia, non una Classe: Hai notato che non abbiamo scritto il codice dei metodi? Abbiamo solo scritto le "firme" (i titoli).
// In Spring Boot, tu definisci l'interfaccia e Spring crea automaticamente l'implementazione quando avvii l'applicazione.
// È come se tu dicessi al "genio della lampada": voglio un metodo che trovi le email, e lui lo crea per te.
//

//extends JpaRepository<AppUser, Long>: Questa è la vera magia. Dicendo "estendi JpaRepository",
// stai ereditando decine di metodi già pronti per leggere e scrivere sul DB.
//
//<AppUser>: Gli dici quale tabella gestire.
//
//<Long>: Gli dici di che tipo è la chiave primaria (l'ID) di quella tabella.
//
//---Cosa ottieni "Gratis" senza scrivere codice?
//
//save(utente): Salva o aggiorna un utente nel DB (INSERT/UPDATE).
//
//findAll(): Ti restituisce la lista di tutti gli utenti (SELECT *).
//
//findById(1L): Trova l'utente con ID 1.
//
//delete(utente): Cancella l'utente.
//

//Optional<AppUser> findByEmail(String email);: Questo si chiama Query Method. Spring legge il nome del metodo in inglese e lo traduce in SQL.
// Scrivendo findByEmail, Spring capisce che deve fare: SELECT * FROM app_user WHERE email = '...' Se avessi scritto findByNameAndSurname,
// avrebbe cercato per nome E cognome.