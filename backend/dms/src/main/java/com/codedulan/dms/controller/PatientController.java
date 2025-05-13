package com.codedulan.dms.controller;

import com.codedulan.dms.dto.*;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.repository.PatientRepository;
import com.codedulan.dms.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final PatientRepository patientRepository;

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


    @GetMapping
    @PreAuthorize("hasAnyAuthority('DOCTOR', 'DISPENSER')")
    public ResponseEntity<List<PatientDto>> getAllPatients() {
        List<PatientDto> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }


    //update patient profile endpoints
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody PatientProfileUpdateDto updateDto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Patient updatedPatient = patientService.updatePatientProfile(email, updateDto);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody PasswordChangeDto passwordChangeDto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate password confirmation match
            if (!passwordChangeDto.getNewPassword().equals(passwordChangeDto.getConfirmPassword())) {
                return ResponseEntity.badRequest().body("New password and confirm password do not match");
            }

            boolean success = patientService.changePassword(email, passwordChangeDto);
            return ResponseEntity.ok("Password changed successfully");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<PatientDto> getFullPatientProfile(
            @AuthenticationPrincipal String email,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Patient patient = patientRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Patient not found"));

            PatientDto patientDto = PatientDto.builder()
                    .id(patient.getPatientId())
                    .firstName(patient.getFirstName())
                    .lastName(patient.getLastName())
                    .email(patient.getEmail())
                    .gender(patient.getGender())
                    .age(patient.getAge())
                    .address(patient.getAddress())
                    .contact(patient.getContact())
                    .nic(patient.getNic())
                    .weight(patient.getWeight())
                    .medicalNotes(patient.getMedicalNotes())
                    .build();

            return ResponseEntity.ok(patientDto);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }


    //Doctor updates patient profile
    // Get a specific patient by ID (for doctors)
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR') or hasAuthority('DISPENSER')")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        try {
            Patient patient = patientRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("Patient not found"));

            PatientDto patientDto = PatientDto.builder()
                    .id(patient.getPatientId())
                    .firstName(patient.getFirstName())
                    .lastName(patient.getLastName())
                    .email(patient.getEmail())
                    .gender(patient.getGender())
                    .age(patient.getAge())
                    .address(patient.getAddress())
                    .contact(patient.getContact())
                    .nic(patient.getNic())
                    .weight(patient.getWeight())
                    .medicalNotes(patient.getMedicalNotes())
                    .build();

            return ResponseEntity.ok(patientDto);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Update a patient by ID (for doctors)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<?> updatePatientById(
            @PathVariable Long id,
            @Valid @RequestBody PatientProfileUpdateDto updateDto) {
        try {
            Patient updatedPatient = patientService.updatePatientById(id, updateDto);
            return ResponseEntity.ok("Patient updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete a patient (for doctors)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        try {
            patientRepository.deleteById(id);
            return ResponseEntity.ok("Patient deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}