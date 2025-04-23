package com.codedulan.dms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentDTO {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Prescription ID is required")
    private Long prescriptionId;

    @NotNull(message = "Medicines cost is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Medicines cost must be a positive number")
    private BigDecimal medicinesCost;

    @NotNull(message = "Doctor fee is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Doctor fee must be a positive number")
    private BigDecimal doctorFee;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Total amount must be a positive number")
    private BigDecimal totalAmount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    private String status;

    private String transactionReference;

    private String notes;
}