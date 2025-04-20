package com.codedulan.dms.controller;

import com.codedulan.dms.dto.AppointmentRequest;
import com.codedulan.dms.entity.Appointment;
import com.codedulan.dms.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
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

        // Return ALL appointments within date range, not just the current user's
        return ResponseEntity.ok(appointmentService.getAllAppointmentsInRange(startDate, endDate));
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

    @PreAuthorize("@accessControl.isPatient(#authHeader) or @accessControl.isDispenser(#authHeader) or @accessControl.isDoctor(#authHeader)")
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
        return ResponseEntity.ok(appointmentService.getPatientAppointmentsInRange(startDate, endDate, token));
    }

}