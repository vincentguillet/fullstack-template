package me.vguillet.controller.auth;

import me.vguillet.dto.user.UserDTO;
import me.vguillet.dto.auth.AuthRequest;
import me.vguillet.mapper.user.UserMapper;
import me.vguillet.service.auth.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserDTO dto) {

        return authService.register(UserMapper.fromDto(dto))
                .map(user -> ResponseEntity.ok("User registered successfully"))
                .orElse(ResponseEntity.badRequest().body("Registration failed"));
    }

    @PostMapping("/login")
    public ResponseEntity<String> authenticate(@RequestBody AuthRequest request) {
        return authService.authenticate(request)
                .map(token -> ResponseEntity.ok(token))
                .orElse(ResponseEntity.badRequest().body("Invalid credentials"));
    }
}
