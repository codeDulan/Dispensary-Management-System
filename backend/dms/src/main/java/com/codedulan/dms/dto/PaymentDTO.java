package com.codedulan.dms.dto;

import com.codedulan.dms.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long prescriptionId;
    private LocalDateTime prescriptionDate;
    private BigDecimal medicinesCost;
    private BigDecimal doctorFee;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private String transactionReference;
    private LocalDateTime paymentDate;
    private String notes;

    public static PaymentDTO fromEntity(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .patientId(payment.getPatient().getPatientId())
                .patientName(payment.getPatient().getFirstName() + " " +
                        (payment.getPatient().getLastName() != null ? payment.getPatient().getLastName() : ""))
                .prescriptionId(payment.getPrescription().getId())
                .prescriptionDate(payment.getPrescription().getIssueDate())
                .medicinesCost(payment.getMedicinesCost())
                .doctorFee(payment.getDoctorFee())
                .totalAmount(payment.getTotalAmount())
                .status(payment.getStatus().name())
                .paymentMethod(payment.getPaymentMethod().name())
                .transactionReference(payment.getTransactionReference())
                .paymentDate(payment.getPaymentDate())
                .notes(payment.getNotes())
                .build();
    }
}