package com.codedulan.dms.controller;

import com.codedulan.dms.dto.AppointmentRequest;
import com.codedulan.dms.dto.AppointmentStatusRequest;
import com.codedulan.dms.entity.Appointment;
import com.codedulan.dms.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PreAuthorize("@accessControl.isPatient(#authHeader)")
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(
            @RequestBody AppointmentRequest request,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        return ResponseEntity.ok(appointmentService.createAppointmentFromToken(request, token));
    }

    @PreAuthorize("@accessControl.isPatient(#authHeader)")
    @GetMapping
    public ResponseEntity<List<Appointment>> getAppointments(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);

        // If date is provided, use single date lookup
        if (date != null) {
            return ResponseEntity.ok(appointmentService.getPatientAppointments(date, token));
        }

        // Return appointments within date range for the patient only
        return ResponseEntity.ok(appointmentService.getPatientAppointmentsInRange(startDate, endDate, token));
    }

    @PreAuthorize("@accessControl.isPatient(#authHeader)")
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentRequest request,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        return ResponseEntity.ok(appointmentService.updatePatientAppointment(id, request, token));
    }

    @PreAuthorize("@accessControl.isPatient(#authHeader)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        appointmentService.deletePatientAppointment(id, token);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@accessControl.isDispenser(#authHeader) or @accessControl.isDoctor(#authHeader)")
    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAllAppointments(
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PreAuthorize("@accessControl.isPatient(#authHeader)")
    @GetMapping("/my-appointments")
    public ResponseEntity<List<Appointment>> getMyAppointments(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        // Use a method that ensures appointments are sorted by time and have correct queue numbers
        return ResponseEntity.ok(appointmentService.getPatientAppointmentsByTime(startDate, endDate, token));
    }

    // New endpoint to get available time slots
    @PreAuthorize("@accessControl.isPatient(#authHeader) or @accessControl.isDispenser(#authHeader)")
    @GetMapping("/available-slots")
    public ResponseEntity<List<LocalTime>> getAvailableTimeSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(appointmentService.getAvailableTimeSlots(date));
    }

    // New endpoint to get daily queue
    @PreAuthorize("@accessControl.isPatient(#authHeader) or @accessControl.isDispenser(#authHeader) or @accessControl.isDoctor(#authHeader)")
    @GetMapping("/daily-queue")
    public ResponseEntity<List<Appointment>> getDailyQueue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date));
    }

    // New endpoint for dispenser to create appointment for a patient
    @PreAuthorize("@accessControl.isDispenser(#authHeader) or @accessControl.isDoctor(#authHeader)")
    @PostMapping("/create-for-patient/{patientId}")
    public ResponseEntity<Appointment> createAppointmentForPatient(
            @PathVariable Long patientId,
            @RequestBody AppointmentRequest request,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(appointmentService.createAppointmentForPatient(patientId, request));
    }

    // New endpoint to update appointment status
    @PreAuthorize("@accessControl.isDispenser(#authHeader) or @accessControl.isDoctor(#authHeader)")
    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody AppointmentStatusRequest statusRequest,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, statusRequest.getStatus()));
    }

    // New endpoint to cancel all appointments for a specific date
    @PreAuthorize("@accessControl.isDispenser(#authHeader) or @accessControl.isDoctor(#authHeader)")
    @PutMapping("/cancel-all-by-date/{date}")
    public ResponseEntity<Void> cancelAllAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader) {

        appointmentService.cancelAllAppointmentsByDate(date);
        return ResponseEntity.noContent().build();
    }
}