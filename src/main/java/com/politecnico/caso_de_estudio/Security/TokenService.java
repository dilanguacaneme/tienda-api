package com.politecnico.caso_de_estudio.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class TokenService {

    private final String secret;
    private final long expirationMinutes;

    public TokenService(@Value("${app.security.jwt-secret}") String secret,
                        @Value("${app.security.token-expiration-minutes}") long expirationMinutes) {
        this.secret = secret;
        this.expirationMinutes = expirationMinutes;
    }

    public String create(String username) {
        long expiresAt = Instant.now().plusSeconds(expirationMinutes * 60).getEpochSecond();
        String payload = username + ":" + expiresAt;
        String encoded = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return encoded + "." + signature(encoded);
    }

    public String getUsername(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2 || !constantTimeEquals(signature(parts[0]), parts[1])) return null;
            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String[] values = payload.split(":", 2);
            if (values.length != 2 || Instant.now().getEpochSecond() >= Long.parseLong(values[1])) return null;
            return values[0];
        } catch (Exception ignored) {
            return null;
        }
    }

    private String signature(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return java.util.HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("No fue posible firmar el token", exception);
        }
    }

    private boolean constantTimeEquals(String first, String second) {
        return java.security.MessageDigest.isEqual(first.getBytes(StandardCharsets.UTF_8), second.getBytes(StandardCharsets.UTF_8));
    }
}
