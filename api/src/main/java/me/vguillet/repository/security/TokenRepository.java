package me.vguillet.repository.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import me.vguillet.model.security.Token;

@Repository
public interface TokenRepository extends JpaRepository<Token, Integer> {
}
