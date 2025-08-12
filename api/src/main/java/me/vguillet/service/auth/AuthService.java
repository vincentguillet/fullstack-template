package me.vguillet.service.auth;

import me.vguillet.dto.auth.AuthRequest;
import me.vguillet.model.user.User;
import me.vguillet.model.security.Token;
import me.vguillet.repository.user.UserRepository;
import me.vguillet.repository.security.TokenRepository;
import me.vguillet.service.security.JpaUserDetailsService;
import me.vguillet.service.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JpaUserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       JpaUserDetailsService userDetailsService,
                       TokenRepository tokenRepository,
                       UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    public Optional<String> register(User user) {

        String username = user.getUsername();

        if (userRepository.findByUsername(username).isPresent()) {
            System.err.println("User already exists: " + username);
            return Optional.empty();
        }

        Token refreshToken = new Token();
        refreshToken.setValue(jwtService.generateToken(username));

        user.setRefreshTokens(Collections.singletonList(refreshToken));

        userDetailsService.registerNewUser(user);

        refreshToken.setUser(user);
        tokenRepository.save(refreshToken);

        return Optional.of(refreshToken.getValue());
    }

    public Optional<String> authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()
                )
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        final String jwt = jwtService.generateToken(userDetails.getUsername());

        return Optional.of(jwt);
    }
}
