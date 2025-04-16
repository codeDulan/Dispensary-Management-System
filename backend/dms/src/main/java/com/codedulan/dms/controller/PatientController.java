package com.codedulan.dms.controller;

import com.codedulan.dms.dto.PatientDto;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}