package com.codedulan.dms.config;

import com.codedulan.dms.service.JWTUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AccessControl {

    @Autowired
    private JWTUtils jwtUtils;

    public boolean isPatient(String authHeader) {
        String token = authHeader.substring(7);
        return "PATIENT".equals(jwtUtils.extractRole(token));
    }

    public boolean isDoctor(String authHeader) {
        String token = authHeader.substring(7);
        return "ROLE_DOCTOR".equals(jwtUtils.extractRole(token));
    }

    public boolean isDispenser(String authHeader) {
        String token = authHeader.substring(7);
        return "DISPENSER".equals(jwtUtils.extractRole(token));
    }
}