package com.example.streaming.dto;

public class AuthResponseDTO {
    private String token;
    private String name;
    private String role;

    public AuthResponseDTO(String token, String name, String role) {
        this.token = token;
        this.name = name;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getName() { return name; }
    public String getRole() { return role; }
}