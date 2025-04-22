package com.codedulan.dms.controller;

import com.codedulan.dms.dto.CreatePrescriptionDTO;
import com.codedulan.dms.dto.PrescriptionDTO;
import com.codedulan.dms.dto.UpdatePrescriptionDTO;
import com.codedulan.dms.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Slf4j
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getAllPrescriptions() {
        log.info("Fetching all prescriptions");
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Long id) {
        log.info("Fetching prescription with id: {}", id);
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        log.info("Fetching prescriptions for patient with id: {}", patientId);
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching prescriptions for date: {}", date);
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDate(date));
    }

    @GetMapping("/by-date-range")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Fetching prescriptions between dates: {} and {}", startDate, endDate);
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDateRange(startDate, endDate));
    }

    @GetMapping("/my-prescriptions")
    public ResponseEntity<List<PrescriptionDTO>> getMyPrescriptions(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching prescriptions for authenticated patient");
        return ResponseEntity.ok(prescriptionService.getMyPrescriptions(authHeader));
    }

    @GetMapping("/my-prescriptions/by-date-range")
    public ResponseEntity<List<PrescriptionDTO>> getMyPrescriptionsByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching prescriptions for authenticated patient between dates: {} and {}", startDate, endDate);
        return ResponseEntity.ok(prescriptionService.getMyPrescriptionsByDateRange(startDate, endDate, authHeader));
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @PostMapping
    public ResponseEntity<PrescriptionDTO> createPrescription(
            @Valid @RequestBody CreatePrescriptionDTO createDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Creating new prescription for patient with id: {}", createDTO.getPatientId());
        PrescriptionDTO createdPrescription = prescriptionService.createPrescription(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPrescription);
    }

    @PreAuthorize("@accessControl.isDoctor(#authHeader)")
    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> updatePrescription(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePrescriptionDTO updateDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Updating prescription with id: {}", id);
        return ResponseEntity.ok(prescriptionService.updatePrescription(id, updateDTO));
    }
}