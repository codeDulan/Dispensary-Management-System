package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.entity.Prescription;
import com.codedulan.dms.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatient(Patient patient);

    List<Prescription> findByPatientAndIssueDateBetweenOrderByIssueDateDesc(
            Patient patient, LocalDateTime start, LocalDateTime end);

    List<Prescription> findByIssueDateBetweenOrderByIssueDateDesc(
            LocalDateTime start, LocalDateTime end);





     // Count prescriptions by disease for a date range
   @Query("SELECT p.disease, COUNT(p) as count " +
            "FROM Prescription p " +
            "WHERE p.disease IS NOT NULL " +
            "AND p.issueDate BETWEEN :startDate AND :endDate " +
            "GROUP BY p.disease " +
            "ORDER BY COUNT(p) DESC")
    List<Object[]> countPrescriptionsByDiseaseAndDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);


     // Count prescriptions with custom disease for a date range
    @Query("SELECT p.customDisease, COUNT(p) as count " +
            "FROM Prescription p " +
            "WHERE p.customDisease IS NOT NULL " +
            "AND p.issueDate BETWEEN :startDate AND :endDate " +
            "GROUP BY p.customDisease " +
            "ORDER BY COUNT(p) DESC")
    List<Object[]> countPrescriptionsByCustomDiseaseAndDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

}

