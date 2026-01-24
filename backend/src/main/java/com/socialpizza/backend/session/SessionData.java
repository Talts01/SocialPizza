package com.socialpizza.backend.session;

public class SessionData {
    private final String username;
    private final String role; // Aggiungiamo il ruolo che a noi serve per React!
    private final String message;

    public SessionData(String username, String role, String message) {
        this.username = username;
        this.role = role;
        this.message = message;
    }

    public String getUsername() { return username; }
    public String getRole() { return role; }
    public String getMessage() { return message; }
}
