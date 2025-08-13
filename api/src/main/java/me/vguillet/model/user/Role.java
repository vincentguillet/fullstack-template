package me.vguillet.model.user;

import lombok.Getter;

@Getter
public enum Role {
    USER("User"),
    ADMIN("Administrator");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }
}
