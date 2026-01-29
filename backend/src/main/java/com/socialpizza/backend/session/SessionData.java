package com.socialpizza.backend.session;

public class SessionData {
    private final String username;
    private final String name;
    private final String role;
    private final String message;


    public SessionData(String username, String name, String role, String message) {
        this.username = username;
        this.name = name;
        this.role = role;
        this.message = message;
    }

    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getMessage() { return message; }
}
