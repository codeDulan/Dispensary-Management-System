package com.codedulan.dms.service;

import com.codedulan.dms.dto.AppointmentRequest;
import com.codedulan.dms.entity.Appointment;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.exception.ResourceNotFoundException;
import com.codedulan.dms.exception.BusinessLogicException;
import com.codedulan.dms.repository.AppointmentRepository;
import com.codedulan.dms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j // This enables logging
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final JWTUtils jwtUtils;
    private final PatientRepository patientRepository;

    public Appointment createAppointmentFromToken(AppointmentRequest request, String token) {
        try {
            log.info("Creating appointment from token for date: {}, time: {}", request.getDate(), request.getTime());

            String email = jwtUtils.extractUsername(token);
            Patient patient = patientRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("Patient not found for email: {}", email);

                        return new ResourceNotFoundException("Patient not found for the provided token");
                    });

            validateAppointmentTime(request.getTime());
            validateAppointmentType(request.getAppointmentType());

            if (appointmentRepository.existsByDateAndTime(request.getDate(), request.getTime())) {
                String errorMessage = "Time slot already booked for " + request.getDate() + " at " + request.getTime();
                log.error("BusinessLogicException: {}", errorMessage);
                throw new BusinessLogicException("Time slot already booked for " + request.getDate() + " at " + request.getTime());
            }

            // Calculate appropriate queue number based on time
            Integer queueNumber = calculateQueueNumberBasedOnTime(request.getDate(), request.getTime());

            Appointment appointment = appointmentRepository.save(
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

            log.info("Successfully created appointment with ID: {} for patient: {}", appointment.getId(), email);
            return appointment;

        } catch (ResourceNotFoundException | BusinessLogicException e) {
            log.error("Failed to create appointment: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating appointment: {}", e.getMessage(), e);
            throw new BusinessLogicException("Failed to create appointment due to unexpected error");
        }
    }

    // method for dispensers to create appointments for patients
    public Appointment createAppointmentForPatient(Long patientId, AppointmentRequest request) {
        try {
            log.info("Creating appointment for patient ID: {} on date: {}", patientId, request.getDate());

            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> {
                        log.error("Patient not found with ID: {}", patientId);
                        return new ResourceNotFoundException("Patient not found with ID: " + patientId);
                    });

            validateAppointmentTime(request.getTime());
            validateAppointmentType(request.getAppointmentType());

            if (appointmentRepository.existsByDateAndTime(request.getDate(), request.getTime())) {
                log.warn("Time slot already booked for patient ID: {}, date: {}, time: {}",
                        patientId, request.getDate(), request.getTime());
                throw new BusinessLogicException("Time slot already booked for " + request.getDate() + " at " + request.getTime());
            }

            // calculate appropriate queue number based on time
            Integer queueNumber = calculateQueueNumberBasedOnTime(request.getDate(), request.getTime());

            Appointment appointment = appointmentRepository.save(
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

            log.info("Successfully created appointment with ID: {} for patient ID: {}", appointment.getId(), patientId);
            return appointment;

        } catch (ResourceNotFoundException | BusinessLogicException e) {
            log.error("Failed to create appointment for patient ID {}: {}", patientId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating appointment for patient ID {}: {}", patientId, e.getMessage(), e);
            throw new BusinessLogicException("Failed to create appointment due to unexpected error");
        }
    }

    public List<Appointment> getPatientAppointments(LocalDate date, String token) {
        try {
            log.debug("Fetching patient appointments for date: {}", date);

            String email = jwtUtils.extractUsername(token);
            Patient patient = patientRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("Patient not found for email: {}", email);
                        return new ResourceNotFoundException("Patient not found for the provided token");
                    });

            List<Appointment> appointments = appointmentRepository.findByDateAndPatient(date, patient);
            log.info("Found {} appointments for patient: {} on date: {}", appointments.size(), email, date);

            return appointments;

        } catch (ResourceNotFoundException e) {
            log.error("Failed to get patient appointments: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching patient appointments: {}", e.getMessage(), e);
            throw new BusinessLogicException("Failed to fetch appointments due to unexpected error");
        }
    }

    public Appointment updatePatientAppointment(Long appointmentId, AppointmentRequest request, String token) {
        try {
            log.info("Updating appointment ID: {} to date: {}, time: {}", appointmentId, request.getDate(), request.getTime());

            String email = jwtUtils.extractUsername(token);
            Patient patient = patientRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("Patient not found for email: {}", email);
                        return new ResourceNotFoundException("Patient not found for the provided token");
                    });

            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> {
                        log.error("Appointment not found with ID: {}", appointmentId);
                        return new ResourceNotFoundException("Appointment not found with ID: " + appointmentId);
                    });

            // Check if the appointment belongs to the patient
            if (!appointment.getPatient().getEmail().equals(email)) {
                log.warn("Unauthorized update attempt - Appointment ID: {} does not belong to patient: {}",
                        appointmentId, email);
                throw new BusinessLogicException("You can only update your own appointments");
            }

            validateAppointmentTime(request.getTime());
            validateAppointmentType(request.getAppointmentType());

            // Check if the new time is available
            if (!appointment.getTime().equals(request.getTime()) ||
                    !appointment.getDate().equals(request.getDate())) {

                if (appointmentRepository.existsByDateAndTimeAndIdNot(
                        request.getDate(), request.getTime(), appointmentId)) {
                    log.warn("Time slot already booked during update - Date: {}, Time: {}",
                            request.getDate(), request.getTime());
                    throw new BusinessLogicException("Time slot already booked for " + request.getDate() + " at " + request.getTime());
                }

                // If changing the date or time, recalculate queue number
                if (!appointment.getDate().equals(request.getDate()) ||
                        !appointment.getTime().equals(request.getTime())) {
                    Integer newQueueNumber = calculateQueueNumberBasedOnTime(request.getDate(), request.getTime());
                    appointment.setQueueNumber(newQueueNumber);

                    log.info("Queue number updated for appointment ID: {} - new queue number: {}",
                            appointmentId, newQueueNumber);

                    reorganizeQueueNumbers(request.getDate());
                }
            }

            // Update appointment details
            appointment.setDate(request.getDate());
            appointment.setTime(request.getTime());
            appointment.setAppointmentType(request.getAppointmentType());
            appointment.setNotes(request.getNotes());

            Appointment updatedAppointment = appointmentRepository.save(appointment);
            log.info("Successfully updated appointment ID: {}", appointmentId);

            return updatedAppointment;

        } catch (ResourceNotFoundException | BusinessLogicException e) {
            log.error("Failed to update appointment ID {}: {}", appointmentId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating appointment ID {}: {}", appointmentId, e.getMessage(), e);
            throw new BusinessLogicException("Failed to update appointment due to unexpected error");
        }
    }

    public void deletePatientAppointment(Long appointmentId, String token) {
        try {
            log.info("Deleting appointment ID: {}", appointmentId);

            String email = jwtUtils.extractUsername(token);
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> {
                        log.error("Appointment not found with ID: {}", appointmentId);
                        return new ResourceNotFoundException("Appointment not found with ID: " + appointmentId);
                    });

            if (!appointment.getPatient().getEmail().equals(email)) {
                log.warn("Unauthorized delete attempt - Appointment ID: {} does not belong to patient: {}",
                        appointmentId, email);
                throw new BusinessLogicException("You can only delete your own appointments");
            }

            LocalDate appointmentDate = appointment.getDate();
            appointmentRepository.delete(appointment);

            log.info("Successfully deleted appointment ID: {} for patient: {}", appointmentId, email);

            // Reorganize the queue numbers
            reorganizeQueueNumbers(appointmentDate);
            log.info("Queue numbers reorganized for date: {}", appointmentDate);

        } catch (ResourceNotFoundException | BusinessLogicException e) {
            log.error("Failed to delete appointment ID {}: {}", appointmentId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while deleting appointment ID {}: {}", appointmentId, e.getMessage(), e);
            throw new BusinessLogicException("Failed to delete appointment due to unexpected error");
        }
    }

    public List<Appointment> getAllAppointments() {
        try {
            log.debug("Fetching all appointments");
            List<Appointment> appointments = appointmentRepository.findAll();
            log.info("Found {} total appointments", appointments.size());
            return appointments;
        } catch (Exception e) {
            log.error("Error fetching all appointments: {}", e.getMessage(), e);
            throw new BusinessLogicException("Failed to fetch all appointments");
        }
    }

    public List<Appointment> getPatientAppointmentsInRange(LocalDate startDate, LocalDate endDate, String token) {
        try {
            log.debug("Fetching patient appointments in range: {} to {}", startDate, endDate);

            String email = jwtUtils.extractUsername(token);
            Patient patient = patientRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("Patient not found for email: {}", email);
                        return new ResourceNotFoundException("Patient not found for the provided token");
                    });

            List<Appointment> appointments = appointmentRepository.findByDateBetweenAndPatient(startDate, endDate, patient);
            log.info("Found {} appointments for patient: {} in date range {} to {}",
                    appointments.size(), email, startDate, endDate);

            return appointments;

        } catch (ResourceNotFoundException e) {
            log.error("Failed to get patient appointments in range: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching patient appointments in range: {}", e.getMessage(), e);
            throw new BusinessLogicException("Failed to fetch appointments in date range");
        }
    }

    public List<Appointment> getAllAppointmentsInRange(LocalDate startDate, LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().withDayOfMonth(1);
            }
            if (endDate == null) {
                endDate = startDate.plusMonths(1).minusDays(1);
            }

            log.debug("Fetching all appointments in range: {} to {}", startDate, endDate);
            List<Appointment> appointments = appointmentRepository.findByDateBetween(startDate, endDate);
            log.info("Found {} appointments in date range {} to {}", appointments.size(), startDate, endDate);

            return appointments;

        } catch (Exception e) {
            log.error("Error fetching appointments in range {} to {}: {}", startDate, endDate, e.getMessage(), e);
            throw new BusinessLogicException("Failed to fetch appointments in date range");
        }
    }

    // get available time slots for a given date
    public List<LocalTime> getAvailableTimeSlots(LocalDate date) {
        try {
            log.debug("Fetching available time slots for date: {}", date);

            // Generate all possible time slots from 9:00 to 14:55 in 5-minute intervals
            List<LocalTime> allTimeSlots = generateAllTimeSlots();

            // Get booked time slots for the date
            List<LocalTime> bookedTimeSlots = appointmentRepository.findTimesByDate(date);

            // Remove booked time slots from all time slots
            allTimeSlots.removeAll(bookedTimeSlots);

            log.info("Found {} available time slots for date: {} (out of {} total slots)",
                    allTimeSlots.size(), date, generateAllTimeSlots().size());

            return allTimeSlots;

        } catch (Exception e) {
            log.error("Error fetching available time slots for date {}: {}", date, e.getMessage(), e);
            throw new BusinessLogicException("Failed to fetch available time slots");
        }
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        try {
            log.debug("Fetching appointments by date: {}", date);
            List<Appointment> appointments = appointmentRepository.findByDateOrderByTimeAsc(date);
            log.info("Found {} appointments for date: {}", appointments.size(), date);
            return appointments;
        } catch (Exception e) {
            log.error("Error fetching appointments for date {}: {}", date, e.getMessage(), e);
            throw new BusinessLogicException("Failed to fetch appointments for date: " + date);
        }
    }

    // update appointment status
    public Appointment updateAppointmentStatus(Long appointmentId, String status) {
        try {
            log.info("Updating appointment ID: {} status to: {}", appointmentId, status);

            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> {
                        log.error("Appointment not found with ID: {}", appointmentId);
                        return new ResourceNotFoundException("Appointment not found with ID: " + appointmentId);
                    });

            validateAppointmentStatus(status);
            appointment.setAppointmentStatus(status);

            Appointment updatedAppointment = appointmentRepository.save(appointment);
            log.info("Successfully updated appointment ID: {} status to: {}", appointmentId, status);

            return updatedAppointment;

        } catch (ResourceNotFoundException | BusinessLogicException e) {
            log.error("Failed to update appointment status for ID {}: {}", appointmentId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating appointment status for ID {}: {}", appointmentId, e.getMessage(), e);
            throw new BusinessLogicException("Failed to update appointment status due to unexpected error");
        }
    }

    // method to cancel all appointments for a specific date
    @Transactional
    public void cancelAllAppointmentsByDate(LocalDate date) {
        try {
            log.info("Cancelling all appointments for date: {}", date);

            List<Appointment> appointments = appointmentRepository.findByDateOrderByTimeAsc(date);

            for (Appointment appointment : appointments) {
                appointment.setAppointmentStatus("CANCELLED");
                appointmentRepository.save(appointment);
            }

            log.info("Successfully cancelled {} appointments for date: {}", appointments.size(), date);

        } catch (Exception e) {
            log.error("Error cancelling appointments for date {}: {}", date, e.getMessage(), e);
            throw new BusinessLogicException("Failed to cancel appointments for date: " + date);
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
            log.error("Invalid appointment time: {}. Must be between 9:00-14:55", time);
            throw new BusinessLogicException("Appointments only available between 9:00 AM and 2:55 PM");
        }
    }

    private void validateAppointmentType(String type) {
        List<String> validTypes = Arrays.asList("CHECKUP", "TAKE_MEDICINE", "GET_ADVICE", "REPORT_CHECKING", "OTHER");
        if (type == null || !validTypes.contains(type.toUpperCase())) {
            log.error("Invalid appointment type: {}. Valid types: {}", type, validTypes);
            throw new BusinessLogicException("Invalid appointment type. Valid types are: Checkup, Take Medicine, Get Advice, Report Checking, Other");
        }
    }

    private void validateAppointmentStatus(String status) {
        List<String> validStatuses = Arrays.asList("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW");
        if (status == null || !validStatuses.contains(status.toUpperCase())) {
            log.error("Invalid appointment status: {}. Valid statuses: {}", status, validStatuses);
            throw new BusinessLogicException("Invalid appointment status. Valid statuses are: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW");
        }
    }

    private Integer calculateQueueNumberBasedOnTime(LocalDate date, LocalTime time) {
        try {
            log.debug("Calculating queue number for date: {} time: {}", date, time);

            // Get all existing appointments for the date
            List<Appointment> existingAppointments = appointmentRepository.findByDateOrderByTimeAsc(date);

            // Find the correct position for this time
            int position = 1;
            for (Appointment existing : existingAppointments) {
                if (existing.getTime().isBefore(time)) {
                    position++;
                } else {
                    existing.setQueueNumber(existing.getQueueNumber() + 1);
                    appointmentRepository.save(existing);
                }
            }

            log.debug("Calculated queue number: {} for date: {} time: {}", position, date, time);
            return position;

        } catch (Exception e) {
            log.error("Error calculating queue number for date {} time {}: {}", date, time, e.getMessage(), e);
            throw new BusinessLogicException("Failed to calculate queue number");
        }
    }

    @Transactional
    public void reorganizeQueueNumbers(LocalDate date) {
        try {
            log.debug("Reorganizing queue numbers for date: {}", date);

            List<Appointment> appointments = appointmentRepository.findByDateOrderByTimeAsc(date);

            // Reassign queue numbers based on time order
            int queueNumber = 1;
            for (Appointment appointment : appointments) {
                appointment.setQueueNumber(queueNumber++);
                appointmentRepository.save(appointment);
            }

            log.debug("Successfully reorganized {} queue numbers for date: {}", appointments.size(), date);

        } catch (Exception e) {
            log.error("Error reorganizing queue numbers for date {}: {}", date, e.getMessage(), e);
            throw new BusinessLogicException("Failed to reorganize queue numbers");
        }
    }

    // method to ensure appointments are returned with correct queue numbers
    public List<Appointment> getPatientAppointmentsByTime(LocalDate startDate, LocalDate endDate, String token) {
        try {
            log.debug("Fetching patient appointments by time for date range: {} to {}", startDate, endDate);

            String email = jwtUtils.extractUsername(token);
            Patient patient = patientRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("Patient not found for email: {}", email);
                        return new ResourceNotFoundException("Patient not found for the provided token");
                    });

            // Default date range
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
                    log.info("Correcting queue number for appointment ID: {} from {} to {}",
                            appt.getId(), appt.getQueueNumber(), correctPosition);
                    appt.setQueueNumber(correctPosition);
                    appointmentRepository.save(appt);
                }
            }

            log.info("Found {} appointments for patient: {} with corrected queue numbers", appointments.size(), email);
            return appointments;

        } catch (ResourceNotFoundException e) {
            log.error("Failed to get patient appointments by time: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching patient appointments by time: {}", e.getMessage(), e);
            throw new BusinessLogicException("Failed to fetch appointments with correct queue numbers");
        }
    }
}