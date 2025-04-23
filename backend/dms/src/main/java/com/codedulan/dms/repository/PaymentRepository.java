package com.codedulan.dms.repository;

import com.codedulan.dms.entity.Payment;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPatient(Patient patient);

    Optional<Payment> findByPrescription(Prescription prescription);

    List<Payment> findByStatus(Payment.PaymentStatus status);

    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT p FROM Payment p WHERE p.paymentDate >= :startDate")
    List<Payment> findByPaymentDateFrom(LocalDateTime startDate);

    @Query("SELECT p FROM Payment p WHERE p.paymentDate <= :endDate")
    List<Payment> findByPaymentDateTo(LocalDateTime endDate);

    List<Payment> findByPatientAndPaymentDateBetween(Patient patient, LocalDateTime startDate, LocalDateTime endDate);
}