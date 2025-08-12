package me.vguillet.dto.auth;

public record AuthResponse(
        String username,
        String accessToken,
        String refreshToken
) {}