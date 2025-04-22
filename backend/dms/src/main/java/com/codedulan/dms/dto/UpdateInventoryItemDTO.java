package com.codedulan.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInventoryItemDTO {
    private String batchNumber;
    private LocalDate expiryDate;
    private Integer additionalQuantity;
    private BigDecimal buyPrice;
    private BigDecimal sellPrice;
}
