package me.vguillet.dto.auth;

public record AuthRequest(
        String username,
        String password
) {}
