package com.codedulan.dms.config;




import com.codedulan.dms.service.JWTUtils;
import com.codedulan.dms.service.OurUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private OurUserDetailsService ourUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {



        // Skip the filter if the request is for login endpoint
        if (request.getRequestURI().equals("/api/patients/login")) {
            filterChain.doFilter(request, response);
            return;
        }



        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String userEmail;

        if (authHeader == null || authHeader.isBlank()){
            filterChain.doFilter(request, response);
            return;
        }

        jwtToken = authHeader.substring(7);
        userEmail = jwtUtils.extractUsername(jwtToken);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null){

            String role = jwtUtils.extractRole(jwtToken); // You’ll need to add this method to JWTUtils

            if ("PATIENT".equals(role)) {
                // Trust token and set authentication manually
                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                        userEmail, null, List.of(() -> "PATIENT") // or use AuthorityUtils.createAuthorityList("PATIENT")
                );
                token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(token);
                SecurityContextHolder.setContext(context);
            } else {
                // Existing behavior for DOCTOR, DISPENSER, etc.
                UserDetails userDetails = ourUserDetailsService.loadUserByUsername(userEmail);
                if (jwtUtils.isTokenValid(jwtToken, userDetails)) {
                    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(token);
                    SecurityContextHolder.setContext(context);
                }
            }

        }

        filterChain.doFilter(request, response);



    }
}
