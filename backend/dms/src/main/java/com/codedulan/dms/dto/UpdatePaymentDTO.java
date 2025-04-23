package com.codedulan.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentDTO {
    private String status;
    private String paymentMethod;
    private BigDecimal medicinesCost;
    private BigDecimal doctorFee;
    private BigDecimal totalAmount;
    private String transactionReference;
    private String notes;
}