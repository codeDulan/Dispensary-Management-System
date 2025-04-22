package com.codedulan.dms.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInventoryItemDTO {
    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String batchNumber;

    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Buy price is required")
    @Min(value = 0, message = "Buy price cannot be negative")
    private BigDecimal buyPrice;

    @NotNull(message = "Sell price is required")
    @Min(value = 0, message = "Sell price cannot be negative")
    private BigDecimal sellPrice;

    private LocalDate receivedDate;
}
