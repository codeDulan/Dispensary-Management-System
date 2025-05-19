package com.codedulan.dms.service;

import com.codedulan.dms.dto.AppointmentRequest;
import com.codedulan.dms.entity.Appointment;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.repository.AppointmentRepository;
import com.codedulan.dms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // Calculate appropriate queue number based on time, not booking order
        Integer queueNumber = calculateQueueNumberBasedOnTime(request.getDate(), request.getTime());

        return appointmentRepository.save(
                Appointment.builder()
                        .queueNumber(queueNumber)
                        .date(request.getDate())
                        .time(request.getTime())
                        .appointmentType(request.getAppointmentType())
                        .notes(request.getNotes())
                        .appointmentStatus("PENDING")
                        .patient(patient)
                        .build()
        );
    }

    // New method for dispensers to create appointments for patients
    public Appointment createAppointmentForPatient(Long patientId, AppointmentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        validateAppointmentTime(request.getTime());
        validateAppointmentType(request.getAppointmentType());

        if (appointmentRepository.existsByDateAndTime(request.getDate(), request.getTime())) {
            throw new IllegalArgumentException("Time slot already booked");
        }

        // Calculate appropriate queue number based on time, not booking order
        Integer queueNumber = calculateQueueNumberBasedOnTime(request.getDate(), request.getTime());

        return appointmentRepository.save(
                Appointment.builder()
                        .queueNumber(queueNumber)
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

            // If changing the date or time, recalculate queue number
            if (!appointment.getDate().equals(request.getDate()) ||
                    !appointment.getTime().equals(request.getTime())) {
                Integer newQueueNumber = calculateQueueNumberBasedOnTime(request.getDate(), request.getTime());
                appointment.setQueueNumber(newQueueNumber);

                // After changing this appointment's queue number, we need to reorganize other appointments
                reorganizeQueueNumbers(request.getDate());
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

        LocalDate appointmentDate = appointment.getDate();
        appointmentRepository.delete(appointment);

        // After deleting an appointment, reorganize the queue numbers to ensure continuity
        reorganizeQueueNumbers(appointmentDate);
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

    // Method to get available time slots for a given date
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
        return appointmentRepository.findByDateOrderByTimeAsc(date);
    }

    // New method to update appointment status
    public Appointment updateAppointmentStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        validateAppointmentStatus(status);
        appointment.setAppointmentStatus(status);

        return appointmentRepository.save(appointment);
    }

    // New method to cancel all appointments for a specific date
    @Transactional
    public void cancelAllAppointmentsByDate(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByDateOrderByTimeAsc(date);

        for (Appointment appointment : appointments) {
            appointment.setAppointmentStatus("CANCELLED");
            appointmentRepository.save(appointment);
        }
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

    private void validateAppointmentStatus(String status) {
        List<String> validStatuses = Arrays.asList("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW");
        if (status == null || !validStatuses.contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Invalid appointment status. Valid statuses are: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW");
        }
    }

    /**
     * Calculate queue number based on appointment time - earlier times get lower numbers
     */
    private Integer calculateQueueNumberBasedOnTime(LocalDate date, LocalTime time) {
        // Get all existing appointments for the date
        List<Appointment> existingAppointments = appointmentRepository.findByDateOrderByTimeAsc(date);

        // Find the correct position for this time
        int position = 1;
        for (Appointment existing : existingAppointments) {
            if (existing.getTime().isBefore(time)) {
                position++;
            } else {
                // We need to adjust all appointments with times after this one
                existing.setQueueNumber(existing.getQueueNumber() + 1);
                appointmentRepository.save(existing);
            }
        }

        return position;
    }

    /**
     * Reorganize queue numbers to ensure they are sequential based on appointment times
     * This should be called after updates or deletes to ensure consistency
     */
    @Transactional
    public void reorganizeQueueNumbers(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByDateOrderByTimeAsc(date);

        // Reassign queue numbers based on time order
        int queueNumber = 1;
        for (Appointment appointment : appointments) {
            appointment.setQueueNumber(queueNumber++);
            appointmentRepository.save(appointment);
        }
    }

    // New method to ensure appointments are returned with correct queue numbers
    public List<Appointment> getPatientAppointmentsByTime(LocalDate startDate, LocalDate endDate, String token) {
        String email = jwtUtils.extractUsername(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        // Default date range if not provided
        if (startDate == null) startDate = LocalDate.now();
        if (endDate == null) endDate = startDate.plusDays(30);

        // Get patient's appointments in date range
        List<Appointment> appointments = appointmentRepository.findByDateBetweenAndPatient(startDate, endDate, patient);

        // For each appointment, verify its queue number is correct
        for (Appointment appt : appointments) {
            // Get all appointments for this date sorted by time
            List<Appointment> allApptsForDate = appointmentRepository.findByDateOrderByTimeAsc(appt.getDate());

            // Find this appointment's position in the time-sorted list
            int correctPosition = 1;
            for (Appointment other : allApptsForDate) {
                if (other.getId().equals(appt.getId())) {
                    break;
                }
                correctPosition++;
            }

            // Update if incorrect
            if (appt.getQueueNumber() != correctPosition) {
                appt.setQueueNumber(correctPosition);
                appointmentRepository.save(appt);
            }
        }

        return appointments;
    }
}