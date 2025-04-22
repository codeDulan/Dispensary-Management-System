package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.entity.Prescription;
import com.codedulan.dms.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
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
}

