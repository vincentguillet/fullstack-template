package me.vguillet.service.auth;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import me.vguillet.dto.auth.AuthRequest;
import me.vguillet.dto.auth.AuthResponse;
import me.vguillet.model.user.User;
import me.vguillet.model.security.Token;
import me.vguillet.repository.user.UserRepository;
import me.vguillet.repository.security.TokenRepository;
import me.vguillet.service.security.JpaUserDetailsService;
import me.vguillet.service.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JpaUserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final int REFRESH_TOKEN_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7; // 7 jours

    public Optional<?> register(User user) {
        String username = user.getUsername();

        if (userRepository.findByUsername(username).isPresent()) {
            System.err.println("User already exists: " + username);
            return Optional.empty();
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDetailsService.registerNewUser(user);

        return Optional.of(new AuthResponse(username, null, null));
    }

    @Transactional
    public Optional<AuthResponse> authenticate(AuthRequest request) {
        String accessToken = jwtService.generateToken(request.username());

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getUsername()));

        Token token = user.getToken() != null
                ? tokenRepository.findById(user.getToken().getId()).orElse(null)
                : null;

        if (token == null || isRefreshTokenExpired(token)) {
            System.out.println("[Authenticate] Refresh token absent ou expiré pour user: " + user.getUsername());
            token = generateNewRefreshToken(user);
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        return Optional.of(new AuthResponse(
                user.getUsername(),
                accessToken,
                token.getValue()
        ));
    }

    @Transactional
    public Optional<User> getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getToken() != null && isRefreshTokenExpired(user.getToken())) {
                        System.out.println("[AuthService] Refresh token expired for user: " + user.getUsername());
                        user.setToken(null);
                        userRepository.save(user);
                    }
                    return user;
                });
    }

    @Transactional
    public Optional<AuthResponse> refresh(String refreshTokenValue) {
        Token savedToken = tokenRepository.findByValue(refreshTokenValue)
                .orElseThrow(() -> new RuntimeException("Refresh token not found: " + refreshTokenValue));

        User user = savedToken.getUser();

        if (isRefreshTokenExpired(savedToken)) {
            return Optional.empty();
        }

        String newAccessToken = jwtService.generateToken(user.getUsername());
        return Optional.of(new AuthResponse(
                user.getUsername(),
                newAccessToken,
                refreshTokenValue
        ));
    }

    private Token generateNewRefreshToken(User user) {
        if (user.getToken() != null && tokenRepository.findById(user.getToken().getId()).isPresent()) {
            System.out.println("[AuthService] Deleting existing refresh token for user: " + user.getUsername());
            tokenRepository.delete(user.getToken());
            user.setToken(null);
            userRepository.save(user);
            tokenRepository.flush();
        }

        Token newToken = new Token();
        newToken.setUser(user);
        newToken.setValue(jwtService.generateToken(user.getUsername()));
        newToken.setExpirationDate(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION_TIME));
        tokenRepository.save(newToken);
        user.setToken(newToken);
        userRepository.save(user);
        return newToken;
    }

    private boolean isRefreshTokenExpired(Token token) {
        return token.getExpirationDate().getTime() < System.currentTimeMillis();
    }
}