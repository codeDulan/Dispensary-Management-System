package com.codedulan.dms.controller;

import com.codedulan.dms.dto.DoctorRegisterPatientDto;
import com.codedulan.dms.dto.PatientDto;
import com.codedulan.dms.dto.PatientLoginDto;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<String> registerPatient(
            @Valid @RequestBody PatientDto request) {
        Patient patient = patientService.registerPatient(request);
        return ResponseEntity.ok("Registration successful. Barcode sent to email.");
    }


    @PreAuthorize("hasAuthority('DOCTOR')")
    @PostMapping("/doctor-register")
    public ResponseEntity<String> doctorRegisterPatient(
            @Valid @RequestBody DoctorRegisterPatientDto request) {
        patientService.doctorRegisterPatient(request);
        return ResponseEntity.ok("Patient registered by doctor. Email sent with barcode and password.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginPatient(@RequestBody @Valid PatientLoginDto loginDto) {
        String token = patientService.authenticateAndGenerateToken(loginDto);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/me")
    public ResponseEntity<PatientDto> getCurrentPatient(@AuthenticationPrincipal String email) {
        PatientDto patientDto = patientService.getPatientByEmail(email);
        return ResponseEntity.ok(patientDto);
    }

}