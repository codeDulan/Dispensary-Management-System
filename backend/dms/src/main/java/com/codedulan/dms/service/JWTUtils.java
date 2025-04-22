package com.codedulan.dms.service;

import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.entity.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;


@Component

public class JWTUtils {

    private SecretKey Key;



    private static final long EXPIRATION_TIME = 86400000; // 24 hours

    public JWTUtils() {
        String secreteString = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437"; // CAN BE CHANGE
        byte[] keyBytes = Base64.getDecoder().decode(secreteString.getBytes(StandardCharsets.UTF_8));
        this.Key = new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    public String generateToken(Users user) {
        HashMap<String, Object> claims = new HashMap<>();
        claims.put("authorities", "ROLE_" + user.getRole());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUsername()) // use user.getUsername() if applicable
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Key)
                .compact();
    }


    public String generateRefreshToken(HashMap<String, Object> claims, UserDetails userDetails) {

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Key)
                .compact();

    }

    public String generateTokenForPatient(Patient patient) {
        HashMap<String, Object> claims = new HashMap<>();
        
        claims.put("role", "PATIENT");             // Used in your filter
        claims.put("name", patient.getFirstName());     // 👈 Add this so frontend can use it
        claims.put("email", patient.getEmail());   // Optional

        return Jwts.builder()
                .claims(claims)
                .subject(patient.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Key)
                .compact();
    }



    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction){
        return claimsTFunction.apply(Jwts.parser().verifyWith(Key).build().parseSignedClaims(token).getPayload());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return(username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token, Claims::getExpiration).before(new Date());
    }

    public String extractRole(String token) {
        return extractClaims(token, claims -> {
            String role = claims.get("role", String.class);
            if (role != null) return role;
            return claims.get("authorities", String.class);
        });
    }


    public String extractEmail(String token) {
        // First, try to get email from claims if it exists
        try {
            String email = extractClaims(token, claims -> claims.get("email", String.class));
            if (email != null && !email.isEmpty()) {
                return email;
            }
        } catch (Exception ignored) {
            // If email claim doesn't exist, fall back to subject
        }

        // Fall back to subject which should contain the email for patient tokens
        return extractUsername(token);
    }






}
