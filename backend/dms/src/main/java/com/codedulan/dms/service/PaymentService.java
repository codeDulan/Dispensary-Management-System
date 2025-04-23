package com.codedulan.dms.service;

import com.codedulan.dms.dto.CreatePaymentDTO;
import com.codedulan.dms.dto.PaymentDTO;
import com.codedulan.dms.dto.UpdatePaymentDTO;
import com.codedulan.dms.entity.Patient;
import com.codedulan.dms.entity.Payment;
import com.codedulan.dms.entity.Prescription;
import com.codedulan.dms.exception.BusinessLogicException;
import com.codedulan.dms.exception.ResourceNotFoundException;
import com.codedulan.dms.repository.PatientRepository;
import com.codedulan.dms.repository.PaymentRepository;
import com.codedulan.dms.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final JWTUtils jwtUtils;

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(PaymentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public PaymentDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return PaymentDTO.fromEntity(payment);
    }

    public PaymentDTO getPaymentByPrescriptionId(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));

        Payment payment = paymentRepository.findByPrescription(prescription)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for prescription id: " + prescriptionId));

        return PaymentDTO.fromEntity(payment);
    }

    public List<PaymentDTO> getPaymentsByPatientId(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        return paymentRepository.findByPatient(patient).stream()
                .map(PaymentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByStatus(String status) {
        Payment.PaymentStatus paymentStatus;
        try {
            paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessLogicException("Invalid payment status: " + status);
        }

        return paymentRepository.findByStatus(paymentStatus).stream()
                .map(PaymentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDate.now().atTime(LocalTime.MAX);

        return paymentRepository.findByPaymentDateBetween(start, end).stream()
                .map(PaymentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getMyPayments(String token) {
        String email = jwtUtils.extractEmail(token);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with email: " + email));

        return paymentRepository.findByPatient(patient).stream()
                .map(PaymentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDTO createPayment(CreatePaymentDTO createDTO) {
        Patient patient = patientRepository.findById(createDTO.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + createDTO.getPatientId()));

        Prescription prescription = prescriptionRepository.findById(createDTO.getPrescriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + createDTO.getPrescriptionId()));

        // Check if payment already exists for this prescription
        if (paymentRepository.findByPrescription(prescription).isPresent()) {
            throw new BusinessLogicException("Payment already exists for prescription id: " + createDTO.getPrescriptionId());
        }

        Payment.PaymentMethod paymentMethod;
        try {
            paymentMethod = Payment.PaymentMethod.valueOf(createDTO.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessLogicException("Invalid payment method: " + createDTO.getPaymentMethod());
        }


        // Parse the status or default to COMPLETED
        Payment.PaymentStatus status;
        try {
            status = createDTO.getStatus() != null
                    ? Payment.PaymentStatus.valueOf(createDTO.getStatus().toUpperCase())
                    : Payment.PaymentStatus.COMPLETED;
        } catch (IllegalArgumentException e) {
            throw new BusinessLogicException("Invalid payment status: " + createDTO.getStatus());
        }


        Payment payment = Payment.builder()
                .patient(patient)
                .prescription(prescription)
                .medicinesCost(createDTO.getMedicinesCost())
                .doctorFee(createDTO.getDoctorFee())
                .totalAmount(createDTO.getTotalAmount())
                .status(status)
                .paymentMethod(paymentMethod)
                .transactionReference(createDTO.getTransactionReference())
                .paymentDate(LocalDateTime.now())
                .notes(createDTO.getNotes())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Created payment for prescription id: {} and patient: {}",
                prescription.getId(), patient.getFirstName() + " " + patient.getLastName());

        return PaymentDTO.fromEntity(savedPayment);
    }

    @Transactional
    public PaymentDTO updatePayment(Long id, UpdatePaymentDTO updateDTO) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        if (updateDTO.getStatus() != null) {
            try {
                payment.setStatus(Payment.PaymentStatus.valueOf(updateDTO.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BusinessLogicException("Invalid payment status: " + updateDTO.getStatus());
            }
        }

        if (updateDTO.getPaymentMethod() != null) {
            try {
                payment.setPaymentMethod(Payment.PaymentMethod.valueOf(updateDTO.getPaymentMethod().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BusinessLogicException("Invalid payment method: " + updateDTO.getPaymentMethod());
            }
        }

        if (updateDTO.getMedicinesCost() != null) {
            payment.setMedicinesCost(updateDTO.getMedicinesCost());
        }

        if (updateDTO.getDoctorFee() != null) {
            payment.setDoctorFee(updateDTO.getDoctorFee());
        }

        if (updateDTO.getTotalAmount() != null) {
            payment.setTotalAmount(updateDTO.getTotalAmount());
        }

        if (updateDTO.getTransactionReference() != null) {
            payment.setTransactionReference(updateDTO.getTransactionReference());
        }

        if (updateDTO.getNotes() != null) {
            payment.setNotes(updateDTO.getNotes());
        }

        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Updated payment with id: {}", id);

        return PaymentDTO.fromEntity(updatedPayment);
    }

    @Transactional
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payment not found with id: " + id);
        }

        paymentRepository.deleteById(id);
        log.info("Deleted payment with id: {}", id);
    }
}