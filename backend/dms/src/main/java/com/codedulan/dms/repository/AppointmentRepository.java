package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Appointment;
import com.codedulan.dms.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDateAndPatient(LocalDate date, Patient patient);

    boolean existsByDateAndTime(LocalDate date, LocalTime time);

    List<Appointment> findByDateBetweenAndPatient(LocalDate startDate, LocalDate endDate, Patient patient);

    // Add these two methods
    List<Appointment> findByDateBetween(LocalDate startDate, LocalDate endDate);

    boolean existsByDateAndTimeAndIdNot(LocalDate date, LocalTime time, Long id);
}