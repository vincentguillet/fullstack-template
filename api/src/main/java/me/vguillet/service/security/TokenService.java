package me.vguillet.service.security;

import me.vguillet.model.security.Token;
import me.vguillet.repository.security.TokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TokenService {

    private final TokenRepository tokenRepository;

    @Autowired
    public TokenService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Transactional
    public void saveToken(Token token) {
        if (token.getId() == null) {
            tokenRepository.save(token);
        }
    }

    public Optional<Token> getTokenById(Long id) {
        return tokenRepository.findById(id);
    }

    public List<Token> getAllTokens() {
        return tokenRepository.findAll();
    }

    @Transactional
    public Optional<Token> updateToken(Token token) {
        return tokenRepository.findById(token.getId()).map(existingToken -> {
            existingToken.setValue(token.getValue());
            return tokenRepository.save(existingToken);
        });
    }

    @Transactional
    public Optional<Token> deleteTokenById(Long id) {
        Optional<Token> token = tokenRepository.findById(id);
        token.ifPresent(tokenRepository::delete);
        return token;
    }
}
