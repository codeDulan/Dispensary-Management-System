package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Appointment;
import com.codedulan.dms.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDateAndPatient(LocalDate date, Patient patient);

    boolean existsByDateAndTime(LocalDate date, LocalTime time);

    List<Appointment> findByDateBetweenAndPatient(LocalDate startDate, LocalDate endDate, Patient patient);

    List<Appointment> findByDateBetween(LocalDate startDate, LocalDate endDate);

    boolean existsByDateAndTimeAndIdNot(LocalDate date, LocalTime time, Long id);

    @Query("SELECT MAX(a.queueNumber) FROM Appointment a WHERE a.date = :date")
    Integer findMaxQueueNumberByDate(@Param("date") LocalDate date);

    @Query("SELECT a.time FROM Appointment a WHERE a.date = :date")
    List<LocalTime> findTimesByDate(@Param("date") LocalDate date);

    List<Appointment> findByDateOrderByQueueNumberAsc(LocalDate date);
}