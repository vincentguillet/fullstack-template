package me.vguillet.controller.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import me.vguillet.dto.auth.AuthResponse;
import me.vguillet.dto.user.UserDTO;
import me.vguillet.dto.auth.AuthRequest;
import me.vguillet.mapper.user.UserMapper;
import me.vguillet.service.auth.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO dto) {
        System.out.println("Registering: " + dto);
        return authService.register(UserMapper.fromDto(dto))
                .map((ResponseEntity::ok))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request, HttpServletResponse response) {
        System.out.println("Authenticating: " + request);
        return authService.authenticate(request)
                .map(authResponse -> createAuthResponse(authResponse, response))
                .orElse(ResponseEntity.badRequest().build());
    }

    @GetMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        // Supprime le cookie de refresh token
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false) // true en prod
                .path("/")
                .maxAge(0) // Expire immédiatement
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(HttpServletRequest request) {
        String username = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
        if (username == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }

        return authService.getCurrentUser(username)
                .map(user -> ResponseEntity.ok(UserMapper.toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        // Récupère le refresh token depuis le cookie
        String refreshToken = null;
        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                    .filter(c -> "refreshToken".equals(c.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }
        if (refreshToken == null) {
            return ResponseEntity.badRequest().build();
        }

        return authService.refresh(refreshToken)
                .map(authResponse -> createAuthResponse(authResponse, response))
                .orElse(ResponseEntity.badRequest().build());
    }

    private ResponseEntity<AuthResponse> createAuthResponse(AuthResponse authResponse, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", authResponse.refreshToken())
                .httpOnly(true)
                .secure(false) // true en prod
                .path("/")
                .maxAge(60 * 60 * 24 * 7) // 7 jours
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Ne pas renvoyer le refresh token dans le body
        return ResponseEntity.ok(new AuthResponse(
                authResponse.username(),
                authResponse.accessToken(),
                null
        ));
    }
}