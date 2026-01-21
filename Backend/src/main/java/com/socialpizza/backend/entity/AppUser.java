package com.socialpizza.backend.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // Dice a Spring: "Questa classe deve diventare una tabella nel Database"
@Data // Lombok: Crea in automatico getter, setter e toString (magia!)
@NoArgsConstructor // Lombok: Crea il costruttore vuoto (obbligatorio per JPA)
@AllArgsConstructor // Lombok: Crea il costruttore con tutti gli argomenti
public class AppUser {

    @Id // Questa è la Chiave Primaria
    @GeneratedValue(strategy = GenerationType.IDENTITY) // L'ID si autoincrementa (1, 2, 3...)
    private Long id;

    private String name;
    private String surname;
    private String email;
    private String password;

    // Ruolo: "USER" (Pizza Lover) o "RESTAURATEUR" (Ristoratore)
    private String role; // Default: USER

    // Flag di verifica: importante per i ristoratori (garantisce credibilità)
    // Nota: Boolean (con B maiuscula) è l'oggetto wrapper, può essere null
    private Boolean isVerified = false; // Default: false per USER, verificato da admin per RESTAURATEUR

    // Bio/Descrizione personale (per profilo pubblico)
    private String bio;
}

//Gli import sono il modo in cui dici a Java: "Ehi, per questo lavoro specifico, vai in magazzino e portami sul banco solo il cacciavite a stella e il martello".
//
//Analizziamo quelli che hai usato nelle Entità:
//
//1. import jakarta.persistence.*;
//Questi sono gli attrezzi per parlare con il Database.
//
//Chi sono: Entity, Id, GeneratedValue, ManyToOne, ecc.
//
//A cosa servono: Sono come delle "etichette adesive". Java di base non sa cosa sia un Database. Importando questi strumenti, puoi appiccicare l'etichetta @Entity sopra la classe City e Spring capisce: "Ah, questa roba devo trasformarla in una tabella SQL!".
//
//Curiosità per l'esame: Prima si chiamavano javax.persistence, ora si chiamano jakarta perché il progetto è passato sotto la gestione della Eclipse Foundation.
//
//2. import lombok.*; (Data, NoArgsConstructor, ecc.)
//Questi sono gli attrezzi del tuo Assistente Robot (Lombok).
//
//Chi sono: Data, AllArgsConstructor, NoArgsConstructor.
//
//A cosa servono: Se non importassi questi, dovresti scrivere a mano 50 righe di codice per ogni classe (per dire a Java come leggere e scrivere la variabile cap). Importandoli, dici al compilatore: "Usa il robot Lombok per scrivere quel codice noioso al posto mio".
//
//3. import java.util.List; (o Optional)
//Questi sono gli attrezzi Standard di Java.
//
//Chi sono: List, ArrayList, Optional.
//
//A cosa servono: Java organizza le sue funzioni base in pacchetti. List serve per fare le liste (es. la lista delle pizze). Poiché non fa parte del linguaggio "base-base" (come int o boolean), devi importarlo dal pacchetto "utilità" (java.util).
//
//4. import java.time.LocalDateTime;
//Chi è: L'attrezzo per gestire Date e Ore.
//
//A cosa serve: Serve per dire "Venerdì alle 20:00". Senza questo import, Java non saprebbe come gestire il tempo.