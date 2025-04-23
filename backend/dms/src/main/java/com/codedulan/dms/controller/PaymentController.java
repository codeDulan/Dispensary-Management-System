package com.codedulan.dms.controller;

import com.codedulan.dms.dto.CreatePaymentDTO;
import com.codedulan.dms.dto.PaymentDTO;
import com.codedulan.dms.dto.UpdatePaymentDTO;
import com.codedulan.dms.service.PaymentService;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    public ResponseEntity<List<PaymentDTO>> getAllPayments(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching all payments");
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    public ResponseEntity<PaymentDTO> getPaymentById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching payment with id: {}", id);
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/prescription/{prescriptionId}")
    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    public ResponseEntity<PaymentDTO> getPaymentByPrescriptionId(
            @PathVariable Long prescriptionId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching payment for prescription with id: {}", prescriptionId);
        return ResponseEntity.ok(paymentService.getPaymentByPrescriptionId(prescriptionId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByPatientId(
            @PathVariable Long patientId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching payments for patient with id: {}", patientId);
        return ResponseEntity.ok(paymentService.getPaymentsByPatientId(patientId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByStatus(
            @PathVariable String status,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching payments with status: {}", status);
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
    }

    @GetMapping("/by-date-range")
    @PreAuthorize("@accessControl.isDoctor(#authHeader) or @accessControl.isDispenser(#authHeader)")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching payments between dates: {} and {}", startDate, endDate);
        return ResponseEntity.ok(paymentService.getPaymentsByDateRange(startDate, endDate));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentDTO>> getMyPayments(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Fetching payments for authenticated patient");
        return ResponseEntity.ok(paymentService.getMyPayments(authHeader));
    }

    @PostMapping
    @PreAuthorize("@accessControl.isDispenser(#authHeader)")
    public ResponseEntity<PaymentDTO> createPayment(
            @Valid @RequestBody CreatePaymentDTO createDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Creating new payment for prescription with id: {}", createDTO.getPrescriptionId());
        PaymentDTO createdPayment = paymentService.createPayment(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accessControl.isDispenser(#authHeader)")
    public ResponseEntity<PaymentDTO> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePaymentDTO updateDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Updating payment with id: {}", id);
        return ResponseEntity.ok(paymentService.updatePayment(id, updateDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@accessControl.isDispenser(#authHeader)")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Deleting payment with id: {}", id);
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}