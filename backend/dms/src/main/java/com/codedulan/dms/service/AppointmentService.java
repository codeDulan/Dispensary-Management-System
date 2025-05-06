package com.codedulan.dms.service;

import com.codedulan.dms.dto.AppointmentRequest;
import com.codedulan.dms.entity.Appointment;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.repository.AppointmentRepository;
import com.codedulan.dms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final JWTUtils jwtUtils;
    private final PatientRepository patientRepository;

    public Appointment createAppointmentFromToken(AppointmentRequest request, String token) {
        String email = jwtUtils.extractUsername(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        validateAppointmentTime(request.getTime());
        validateAppointmentType(request.getAppointmentType());

        if (appointmentRepository.existsByDateAndTime(request.getDate(), request.getTime())) {
            throw new IllegalArgumentException("Time slot already booked");
        }

        // Calculate the next queue number for this date
        Integer nextQueueNumber = getNextQueueNumber(request.getDate());

        return appointmentRepository.save(
                Appointment.builder()
                        .queueNumber(nextQueueNumber)
                        .date(request.getDate())
                        .time(request.getTime())
                        .appointmentType(request.getAppointmentType())
                        .notes(request.getNotes())
                        .appointmentStatus("PENDING")
                        .patient(patient)
                        .build()
        );
    }

    public List<Appointment> getPatientAppointments(LocalDate date, String token) {
        String email = jwtUtils.extractUsername(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        return appointmentRepository.findByDateAndPatient(date, patient);
    }

    public Appointment updatePatientAppointment(Long appointmentId, AppointmentRequest request, String token) {
        String email = jwtUtils.extractUsername(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        // Check if the appointment belongs to the patient
        if (!appointment.getPatient().getEmail().equals(email)) {
            throw new IllegalArgumentException("You can only update your own appointments");
        }

        validateAppointmentTime(request.getTime());
        validateAppointmentType(request.getAppointmentType());

        // Check if the new time is available (skip checking if it's the same)
        if (!appointment.getTime().equals(request.getTime()) ||
                !appointment.getDate().equals(request.getDate())) {

            if (appointmentRepository.existsByDateAndTimeAndIdNot(
                    request.getDate(), request.getTime(), appointmentId)) {
                throw new IllegalArgumentException("Time slot already booked");
            }

            // If changing the date, assign a new queue number
            if (!appointment.getDate().equals(request.getDate())) {
                appointment.setQueueNumber(getNextQueueNumber(request.getDate()));
            }
        }

        // Update appointment details
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setNotes(request.getNotes());

        return appointmentRepository.save(appointment);
    }

    public void deletePatientAppointment(Long appointmentId, String token) {
        String email = jwtUtils.extractUsername(token);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getPatient().getEmail().equals(email)) {
            throw new IllegalArgumentException("You can only delete your own appointments");
        }

        appointmentRepository.delete(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getPatientAppointmentsInRange(LocalDate startDate, LocalDate endDate, String token) {
        String email = jwtUtils.extractUsername(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        return appointmentRepository.findByDateBetweenAndPatient(startDate, endDate, patient);
    }

    public List<Appointment> getAllAppointmentsInRange(LocalDate startDate, LocalDate endDate) {
        // If no date range is provided, use default range (e.g., current month)
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = startDate.plusMonths(1).minusDays(1);
        }

        return appointmentRepository.findByDateBetween(startDate, endDate);
    }

    // New method to get available time slots for a given date
    public List<LocalTime> getAvailableTimeSlots(LocalDate date) {
        // Generate all possible time slots from 9:00 to 14:55 in 5-minute intervals
        List<LocalTime> allTimeSlots = generateAllTimeSlots();

        // Get booked time slots for the date
        List<LocalTime> bookedTimeSlots = appointmentRepository.findTimesByDate(date);

        // Remove booked time slots from all time slots
        allTimeSlots.removeAll(bookedTimeSlots);

        return allTimeSlots;
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByDateOrderByQueueNumberAsc(date);
    }

    private List<LocalTime> generateAllTimeSlots() {
        List<LocalTime> timeSlots = new ArrayList<>();
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(15, 0);

        while (start.isBefore(end)) {
            timeSlots.add(start);
            start = start.plusMinutes(5);
        }

        return timeSlots;
    }

    private void validateAppointmentTime(LocalTime time) {
        if (time.isBefore(LocalTime.of(9, 0)) || time.isAfter(LocalTime.of(14, 55))) {
            throw new IllegalArgumentException("Appointments only available 9:00-15:00");
        }
    }

    private void validateAppointmentType(String type) {
        List<String> validTypes = Arrays.asList("CHECKUP", "TAKE_MEDICINE", "GET_ADVICE", "REPORT_CHECKING", "OTHER");
        if (type == null || !validTypes.contains(type.toUpperCase())) {
            throw new IllegalArgumentException("Invalid appointment type. Valid types are: Checkup, Take Medicine, Get Advice, Report Checking, Other");
        }
    }

    private Integer getNextQueueNumber(LocalDate date) {
        Integer maxQueueNumber = appointmentRepository.findMaxQueueNumberByDate(date);
        return (maxQueueNumber == null) ? 1 : maxQueueNumber + 1;
    }
}